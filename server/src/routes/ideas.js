import { Router } from 'express';
import { prisma } from '../db.js';
import { optionalAuth } from '../middleware/auth.js';
import { asyncHandler, ApiError } from '../middleware/error.js';
import { querySchema, parseOrThrow } from '../lib/validation.js';
import { serializeIdea, serializeIdeaCard } from '../lib/serializers.js';

export const ideasRouter = Router();

ideasRouter.use(optionalAuth);

ideasRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const query = parseOrThrow(querySchema, req.query, 'Invalid filters');
    const where = { published: true };
    if (query.mode) where.mode = query.mode;
    if (query.difficulty) where.difficulty = query.difficulty;
    if (query.category) where.category = { slug: query.category };
    if (query.budget) where.startingCostMin = { lte: query.budget };
    if (query.featured === 'true') where.featured = true;
    if (query.q) {
      where.OR = [
        { title: { contains: query.q } },
        { summary: { contains: query.q } },
        { description: { contains: query.q } },
        { targetCustomers: { contains: query.q } },
      ];
    }

    const orderBy =
      query.sort === 'newest'
        ? [{ createdAt: 'desc' }]
        : query.sort === 'cost-low'
          ? [{ startingCostMin: 'asc' }]
          : query.sort === 'cost-high'
            ? [{ startingCostMin: 'desc' }]
            : query.sort === 'title'
              ? [{ title: 'asc' }]
              : [{ featured: 'desc' }, { title: 'asc' }];

    const skip = (query.page - 1) * query.limit;
    const [total, rows] = await Promise.all([
      prisma.idea.count({ where }),
      prisma.idea.findMany({
        where,
        orderBy,
        skip,
        take: query.limit,
        include: { category: { select: { slug: true, name: true } } },
      }),
    ]);

    const bookmarked = new Set();
    if (req.user) {
      const marks = await prisma.bookmark.findMany({
        where: { userId: req.user.id, ideaId: { in: rows.map((row) => row.id) } },
        select: { ideaId: true },
      });
      marks.forEach((mark) => bookmarked.add(mark.ideaId));
    }

    res.json({
      items: rows.map((row) => serializeIdeaCard(row, { bookmarked: bookmarked.has(row.id) })),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        pages: Math.max(1, Math.ceil(total / query.limit)),
      },
    });
  }),
);

ideasRouter.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const idea = await prisma.idea.findUnique({
      where: { slug: req.params.slug },
      include: { category: { select: { slug: true, name: true, description: true } } },
    });
    if (!idea || (!idea.published && req.user?.role !== 'ADMIN')) {
      throw new ApiError(404, 'Business idea not found');
    }

    const [bookmark, related] = await Promise.all([
      req.user
        ? prisma.bookmark.findUnique({ where: { userId_ideaId: { userId: req.user.id, ideaId: idea.id } } })
        : null,
      prisma.idea.findMany({
        where: { published: true, categoryId: idea.categoryId, id: { not: idea.id } },
        take: 3,
        include: { category: { select: { slug: true, name: true } } },
      }),
    ]);

    res.json({
      idea: serializeIdea(idea, { bookmarked: Boolean(bookmark) }),
      related: related.map((row) => serializeIdeaCard(row)),
    });
  }),
);
