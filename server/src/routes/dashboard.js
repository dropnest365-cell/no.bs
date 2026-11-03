import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth, publicUser } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { serializeIdeaCard, serializeRoadmap } from '../lib/serializers.js';

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

dashboardRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const [bookmarks, roadmaps, conversations, counts, drafts] = await Promise.all([
      prisma.bookmark.findMany({
        where: { userId, idea: { published: true } },
        orderBy: { createdAt: 'desc' },
        take: 6,
        include: { idea: { include: { category: { select: { slug: true, name: true } } } } },
      }),
      prisma.roadmap.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' }, take: 4 }),
      prisma.conversation.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 4,
        include: { _count: { select: { messages: true } } },
      }),
      Promise.all([
        prisma.bookmark.count({ where: { userId } }),
        prisma.roadmap.count({ where: { userId } }),
        prisma.conversation.count({ where: { userId } }),
        prisma.contentDraft.count({ where: { userId } }),
      ]),
      prisma.contentDraft.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 5 }),
    ]);

    res.json({
      user: publicUser(req.user),
      counts: { bookmarks: counts[0], roadmaps: counts[1], conversations: counts[2], drafts: counts[3] },
      bookmarks: bookmarks.map((bookmark) => ({
        id: bookmark.id,
        createdAt: bookmark.createdAt,
        idea: serializeIdeaCard(bookmark.idea, { bookmarked: true }),
      })),
      roadmaps: roadmaps.map(serializeRoadmap),
      conversations: conversations.map((conversation) => ({
        id: conversation.id,
        title: conversation.title,
        messageCount: conversation._count.messages,
        updatedAt: conversation.updatedAt,
      })),
      drafts: drafts.map((draft) => ({
        id: draft.id,
        title: draft.title,
        type: draft.type,
        status: draft.status,
        createdAt: draft.createdAt,
      })),
    });
  }),
);
