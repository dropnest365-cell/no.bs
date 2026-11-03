import { Router } from 'express';
import { prisma } from '../db.js';
import { asyncHandler } from '../middleware/error.js';
import { contactSchema, parseOrThrow } from '../lib/validation.js';

export const contactRouter = Router();

contactRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const input = parseOrThrow(contactSchema, req.body);
    await prisma.contactMessage.create({ data: input });
    res.status(201).json({
      ok: true,
      message: 'Thanks. Your message has been saved. This demo stores messages locally; no email is sent automatically.',
    });
  }),
);
