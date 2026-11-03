import { Router } from 'express';
import { prisma } from '../db.js';
import { asyncHandler } from '../middleware/error.js';

export const categoriesRouter = Router();

categoriesRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { ideas: { where: { published: true } } } } },
    });
    res.json({
      items: categories.map((category) => ({
        id: category.id,
        slug: category.slug,
        name: category.name,
        description: category.description,
        mode: category.mode,
        icon: category.icon,
        ideaCount: category._count.ideas,
      })),
    });
  }),
);
