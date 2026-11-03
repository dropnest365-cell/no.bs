import { Router } from 'express';
import { prisma } from '../db.js';
import { asyncHandler, ApiError } from '../middleware/error.js';
import { serializeFullGuide, serializeGuide } from '../lib/serializers.js';

export const guidesRouter = Router();

guidesRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 120) : '';
    const category = typeof req.query.category === 'string' ? req.query.category.trim().slice(0, 80) : '';
    const where = { published: true };
    if (category) where.category = category;
    if (q) {
      where.OR = [{ title: { contains: q } }, { excerpt: { contains: q } }, { body: { contains: q } }];
    }
    const rows = await prisma.guide.findMany({ where, orderBy: [{ updatedAt: 'desc' }] });
    const categories = [...new Set((await prisma.guide.findMany({ where: { published: true }, select: { category: true } })).map((row) => row.category))].sort();
    res.json({ items: rows.map(serializeGuide), categories });
  }),
);

guidesRouter.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const guide = await prisma.guide.findUnique({ where: { slug: req.params.slug } });
    if (!guide || !guide.published) throw new ApiError(404, 'Guide not found');
    const related = await prisma.guide.findMany({
      where: { published: true, category: guide.category, id: { not: guide.id } },
      take: 3,
    });
    res.json({ guide: serializeFullGuide(guide), related: related.map(serializeGuide) });
  }),
);
