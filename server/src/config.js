import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const srcDir = path.dirname(fileURLToPath(import.meta.url));
export const serverRoot = path.resolve(srcDir, '..');
export const projectRoot = path.resolve(serverRoot, '..');

// Load root .env first, then server/.env (which wins if both exist).
dotenv.config({ path: path.join(projectRoot, '.env') });
dotenv.config({ path: path.join(serverRoot, '.env'), override: true });

const isProduction = process.env.NODE_ENV === 'production';

let jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 24) {
  if (isProduction) {
    throw new Error('JWT_SECRET must be set to a random string of at least 24 characters in production.');
  }
  jwtSecret = crypto.randomBytes(48).toString('hex');
  console.warn('[config] JWT_SECRET missing or too short. Using an ephemeral development secret; sessions reset on restart.');
}

const origins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((value) => value.trim().replace(/\/$/, ''))
  .filter(Boolean);

export const config = {
  isProduction,
  port: Number(process.env.PORT) || 4000,
  jwtSecret,
  cookieName: 'nobs_token',
  cookieSecure: process.env.COOKIE_SECURE === 'true' || isProduction,
  allowedOrigins: origins,
  ai: {
    provider: (process.env.AI_PROVIDER || '').trim(),
    apiKey: (process.env.AI_API_KEY || '').trim(),
    baseUrl: (process.env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, ''),
    model: (process.env.AI_MODEL || '').trim(),
  },
  clientDist: path.join(projectRoot, 'client', 'dist'),
};

export function isAiConfigured() {
  return Boolean(config.ai.provider && config.ai.apiKey && config.ai.model);
}

export function isOriginAllowed(origin) {
  if (!origin) return true; // same-origin or non-browser clients
  return config.allowedOrigins.includes(origin.replace(/\/$/, ''));
}
