import { isOriginAllowed } from '../config.js';

// Lightweight CSRF defence for cookie-authenticated, state-changing requests.
// Browsers send Origin on cross-site POST/PATCH/DELETE; reject unexpected origins.
export function originGuard(req, res, next) {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();
  const origin = req.get('origin');
  if (origin && !isOriginAllowed(origin)) {
    return res.status(403).json({ error: 'Request origin is not allowed' });
  }
  next();
}
