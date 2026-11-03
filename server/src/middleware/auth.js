import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { prisma } from '../db.js';
import { ApiError } from './error.js';

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: config.cookieSecure,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export function issueAuthCookie(res, user) {
  const token = jwt.sign({ sub: user.id, role: user.role }, config.jwtSecret, { expiresIn: '7d' });
  res.cookie(config.cookieName, token, cookieOptions);
}

export function clearAuthCookie(res) {
  res.clearCookie(config.cookieName, {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.cookieSecure,
    path: '/',
  });
}

export function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    bio: user.bio || '',
    city: user.city || '',
    createdAt: user.createdAt,
  };
}

async function resolveUser(req) {
  const token = req.cookies?.[config.cookieName];
  if (!token) return null;
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    if (!payload?.sub) return null;
    return await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, role: true, bio: true, city: true, createdAt: true },
    });
  } catch {
    return null;
  }
}

export async function optionalAuth(req, _res, next) {
  req.user = await resolveUser(req);
  next();
}

export async function requireAuth(req, _res, next) {
  if (!req.user) req.user = await resolveUser(req);
  if (!req.user) return next(new ApiError(401, 'Please sign in to continue'));
  next();
}

export function requireAdmin(req, _res, next) {
  if (!req.user) return next(new ApiError(401, 'Please sign in to continue'));
  if (req.user.role !== 'ADMIN') return next(new ApiError(403, 'Administrator access is required'));
  next();
}
