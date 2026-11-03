import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, ApiError } from '../middleware/error.js';
import { roadmapSchema, roadmapUpdateSchema, parseOrThrow } from '../lib/validation.js';
import { aiLimiter } from '../middleware/rateLimit.js';
import { serializeRoadmap } from '../lib/serializers.js';
import { generateRoadmap, calculateProgress } from '../services/roadmap.js';

export const roadmapsRouter = Router();

async function loadIdeas() {
  return prisma.idea.findMany({
    where: { published: true },
    include: { category: { select: { name: true } } },
  });
}

roadmapsRouter.post(
  '/preview',
  aiLimiter,
  asyncHandler(async (req, res) => {
    const input = parseOrThrow(roadmapSchema, req.body);
    const ideas = await loadIdeas();
    const roadmap = generateRoadmap(input, ideas);
    res.json({ roadmap, saved: false });
  }),
);

roadmapsRouter.use(requireAuth);

roadmapsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const roadmaps = await prisma.roadmap.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: 'desc' },
    });
    res.json({ items: roadmaps.map(serializeRoadmap) });
  }),
);

roadmapsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const input = parseOrThrow(roadmapSchema, req.body);
    const ideas = await loadIdeas();
    const generated = generateRoadmap(input, ideas);
    const roadmap = await prisma.roadmap.create({
      data: {
        userId: req.user.id,
        title: generated.title,
        idea: generated.idea,
        budget: generated.budget,
        location: generated.location,
        skills: generated.skills,
        timeAvailable: generated.timeAvailable,
        goals: generated.goals,
        stages: JSON.stringify(generated.stages),
        progress: 0,
      },
    });
    res.status(201).json({
      roadmap: { ...serializeRoadmap(roadmap), summary: generated.summary, budgetPlan: generated.budgetPlan, disclaimer: generated.disclaimer },
      saved: true,
    });
  }),
);

roadmapsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const roadmap = await prisma.roadmap.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!roadmap) throw new ApiError(404, 'Roadmap not found');
    res.json({ roadmap: serializeRoadmap(roadmap) });
  }),
);

roadmapsRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const existing = await prisma.roadmap.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!existing) throw new ApiError(404, 'Roadmap not found');
    const input = parseOrThrow(roadmapUpdateSchema, req.body);
    const progress = calculateProgress(input.stages);
    const roadmap = await prisma.roadmap.update({
      where: { id: existing.id },
      data: { stages: JSON.stringify(input.stages), progress },
    });
    res.json({ roadmap: serializeRoadmap(roadmap) });
  }),
);

roadmapsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const existing = await prisma.roadmap.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!existing) throw new ApiError(404, 'Roadmap not found');
    await prisma.roadmap.delete({ where: { id: existing.id } });
    res.json({ ok: true });
  }),
);
