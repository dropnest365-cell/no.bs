import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db.js';
import { issueAuthCookie, clearAuthCookie, publicUser, requireAuth } from '../middleware/auth.js';
import { asyncHandler, ApiError } from '../middleware/error.js';
import { registerSchema, loginSchema, profileSchema, passwordChangeSchema, parseOrThrow } from '../lib/validation.js';

export const authRouter = Router();

const userSelect = {
  id: true, name: true, email: true, role: true, bio: true, city: true, createdAt: true,
};

authRouter.post(
  '/register',
  asyncHandler(async (req, res) => {
    const input = parseOrThrow(registerSchema, req.body);
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw new ApiError(409, 'An account with this email already exists');

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await prisma.user.create({
      data: { name: input.name, email: input.email, passwordHash, role: 'USER' },
      select: userSelect,
    });
    issueAuthCookie(res, user);
    res.status(201).json({ user: publicUser(user) });
  }),
);

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const input = parseOrThrow(loginSchema, req.body);
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    const valid = user ? await bcrypt.compare(input.password, user.passwordHash) : false;
    if (!user || !valid) throw new ApiError(401, 'Invalid email or password');
    issueAuthCookie(res, user);
    res.json({ user: publicUser(user) });
  }),
);

authRouter.post('/logout', (req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

authRouter.get('/me', (req, res) => {
  res.json({ user: publicUser(req.user) });
});

authRouter.patch(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = parseOrThrow(profileSchema, req.body);
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name: input.name, bio: input.bio, city: input.city },
      select: userSelect,
    });
    res.json({ user: publicUser(user) });
  }),
);

authRouter.post(
  '/change-password',
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = parseOrThrow(passwordChangeSchema, req.body);
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) throw new ApiError(401, 'Please sign in again');
    const valid = await bcrypt.compare(input.currentPassword, user.passwordHash);
    if (!valid) throw new ApiError(400, 'Current password is incorrect');
    if (input.currentPassword === input.newPassword) {
      throw new ApiError(400, 'New password must be different from the current password');
    }
    const passwordHash = await bcrypt.hash(input.newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    issueAuthCookie(res, { ...user, passwordHash });
    res.json({ ok: true, message: 'Password updated' });
  }),
);
