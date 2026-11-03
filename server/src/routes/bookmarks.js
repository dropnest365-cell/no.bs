import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, ApiError } from '../middleware/error.js';
import { serializeIdeaCard } from '../lib/serializers.js';

export const bookmarksRouter = Router();

bookmarksRouter.use(requireAuth);

bookmarksRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: req.user.id, idea: { published: true } },
      orderBy: { createdAt: 'desc' },
      include: { idea: { include: { category: { select: { slug: true, name: true } } } } },
    });
    res.json({
      items: bookmarks.map((bookmark) => ({
        id: bookmark.id,
        createdAt: bookmark.createdAt,
        idea: serializeIdeaCard(bookmark.idea, { bookmarked: true }),
      })),
    });
  }),
);

bookmarksRouter.post(
  '/:ideaId',
  asyncHandler(async (req, res) => {
    const idea = await prisma.idea.findUnique({ where: { id: req.params.ideaId } });
    if (!idea || !idea.published) throw new ApiError(404, 'Business idea not found');

    const bookmark = await prisma.bookmark.upsert({
      where: { userId_ideaId: { userId: req.user.id, ideaId: req.params.ideaId } },
      update: {},
      create: { userId: req.user.id, ideaId: req.params.ideaId },
    });
    res.status(201).json({ bookmarked: true, id: bookmark.id });
  }),
);

bookmarksRouter.delete(
  '/:ideaId',
  asyncHandler(async (req, res) => {
    await prisma.bookmark.deleteMany({
      where: { userId: req.user.id, ideaId: req.params.ideaId },
    });
    res.json({ bookmarked: false });
  }),
);
