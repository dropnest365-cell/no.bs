import { Router } from 'express';
import { prisma } from '../db.js';
import { asyncHandler } from '../middleware/error.js';
import { serializeTool } from '../lib/serializers.js';

export const toolsRouter = Router();

toolsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 120) : '';
    const category = typeof req.query.category === 'string' ? req.query.category.trim().slice(0, 80) : '';
    const pricing = typeof req.query.pricing === 'string' ? req.query.pricing.trim().toUpperCase() : '';
    const where = { published: true };
    if (category) where.category = category;
    if (['FREE', 'FREEMIUM', 'PAID', 'UNKNOWN'].includes(pricing)) where.pricing = pricing;
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
        { category: { contains: q } },
      ];
    }
    const rows = await prisma.tool.findMany({ where, orderBy: [{ category: 'asc' }, { name: 'asc' }] });
    const all = await prisma.tool.findMany({ where: { published: true }, select: { category: true } });
    const categories = [...new Set(all.map((row) => row.category))].sort();
    res.json({ items: rows.map(serializeTool), categories, total: rows.length });
  }),
);
