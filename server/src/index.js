import fs from 'node:fs';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { config, isOriginAllowed } from './config.js';
import { optionalAuth } from './middleware/auth.js';
import { originGuard } from './middleware/origin.js';
import { errorHandler, notFound } from './middleware/error.js';
import { globalLimiter, authLimiter, contactLimiter, bookmarkLimiter } from './middleware/rateLimit.js';

import { authRouter } from './routes/auth.js';
import { ideasRouter } from './routes/ideas.js';
import { categoriesRouter } from './routes/categories.js';
import { bookmarksRouter } from './routes/bookmarks.js';
import { toolsRouter } from './routes/tools.js';
import { guidesRouter } from './routes/guides.js';
import { contactRouter } from './routes/contact.js';
import { mentorRouter } from './routes/mentor.js';
import { analyzerRouter } from './routes/analyzer.js';
import { roadmapsRouter } from './routes/roadmaps.js';
import { dashboardRouter } from './routes/dashboard.js';
import { adminRouter } from './routes/admin.js';

const app = express();
app.disable('x-powered-by');
if (config.isProduction) app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: config.isProduction
      ? {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'"],
            objectSrc: ["'none'"],
            frameAncestors: ["'none'"],
            baseUri: ["'self'"],
          },
        }
      : false,
    crossOriginResourcePolicy: false,
    hsts: config.isProduction,
  }),
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || isOriginAllowed(origin)) return callback(null, true);
      return callback(new Error('Origin not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  }),
);

app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.use(originGuard);
if (!config.isProduction) app.use(morgan('dev'));
app.use(globalLimiter);
app.use(optionalAuth);

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    name: 'NO BS API',
    environment: config.isProduction ? 'production' : 'development',
    ai: process.env.AI_PROVIDER && process.env.AI_API_KEY ? 'configured' : 'rule-based',
  });
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth', authRouter);
app.use('/api/ideas', ideasRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/bookmarks', bookmarkLimiter, bookmarksRouter);
app.use('/api/tools', toolsRouter);
app.use('/api/guides', guidesRouter);
app.use('/api/contact', contactLimiter, contactRouter);
app.use('/api/mentor', mentorRouter);
app.use('/api/analyzer', analyzerRouter);
app.use('/api/roadmaps', roadmapsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/admin', adminRouter);

app.use('/api', notFound);

if (config.isProduction && fs.existsSync(config.clientDist)) {
  app.use(express.static(config.clientDist, { index: false, maxAge: '1h' }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile('index.html', { root: config.clientDist });
  });
} else {
  app.get('/', (_req, res) => {
    res.json({
      message: 'NO BS API is running. Start the Vite frontend on http://localhost:5173 for the app.',
      health: '/api/health',
    });
  });
}

app.use(notFound);
app.use(errorHandler);

const server = app.listen(config.port, () => {
  console.log(`NO BS API listening on http://localhost:${config.port}`);
  console.log(`Environment: ${config.isProduction ? 'production' : 'development'}`);
  console.log(
    config.ai.apiKey && config.ai.model
      ? `AI provider: ${config.ai.provider || 'openai-compatible'} / ${config.ai.model}`
      : 'AI provider: not configured — rule-based fallbacks active',
  );
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${config.port} is already in use. Set PORT in .env or stop the other process.`);
  } else {
    console.error(error);
  }
  process.exit(1);
});

function shutdown() {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000).unref();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
