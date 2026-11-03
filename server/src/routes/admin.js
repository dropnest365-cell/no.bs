import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { asyncHandler, ApiError } from '../middleware/error.js';
import {
  adminIdeaSchema,
  adminCategorySchema,
  adminGuideSchema,
  adminDraftActionSchema,
  parseOrThrow,
} from '../lib/validation.js';
import {
  serializeIdea,
  serializeIdeaCard,
  serializeGuide,
  serializeFullGuide,
  serializeDraft,
} from '../lib/serializers.js';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

const publishSchema = z.object({ published: z.boolean() });
const handledSchema = z.object({ handled: z.boolean() });

adminRouter.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const [
      users, ideas, publishedIdeas, guides, tools, roadmaps, bookmarks,
      conversations, pendingDrafts, unreadContacts, recentUsers, recentIdeas,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.idea.count(),
      prisma.idea.count({ where: { published: true } }),
      prisma.guide.count(),
      prisma.tool.count(),
      prisma.roadmap.count(),
      prisma.bookmark.count(),
      prisma.conversation.count(),
      prisma.contentDraft.count({ where: { status: 'PENDING' } }),
      prisma.contactMessage.count({ where: { handled: false } }),
      prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, name: true, email: true, role: true, createdAt: true } }),
      prisma.idea.findMany({ orderBy: { updatedAt: 'desc' }, take: 5, select: { id: true, title: true, slug: true, published: true, updatedAt: true } }),
    ]);

    res.json({
      stats: {
        users, ideas, publishedIdeas, guides, tools, roadmaps, bookmarks,
        conversations, pendingDrafts, unreadContacts,
      },
      recentUsers,
      recentIdeas,
    });
  }),
);

adminRouter.get(
  '/ideas',
  asyncHandler(async (req, res) => {
    const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 120) : '';
    const where = {};
    if (q) where.OR = [{ title: { contains: q } }, { slug: { contains: q } }];
    const rows = await prisma.idea.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: { category: { select: { slug: true, name: true } } },
    });
    res.json({ items: rows.map((row) => serializeIdeaCard(row, { published: row.published, updatedAt: row.updatedAt })) });
  }),
);

adminRouter.get(
  '/ideas/:id',
  asyncHandler(async (req, res) => {
    const idea = await prisma.idea.findUnique({
      where: { id: req.params.id },
      include: { category: { select: { slug: true, name: true } } },
    });
    if (!idea) throw new ApiError(404, 'Business idea not found');
    res.json({ idea: serializeIdea(idea) });
  }),
);

adminRouter.post(
  '/ideas',
  asyncHandler(async (req, res) => {
    const input = parseOrThrow(adminIdeaSchema, req.body);
    const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
    if (!category) throw new ApiError(400, 'Select a valid category');

    const idea = await prisma.idea.create({
      data: {
        title: input.title,
        slug: input.slug,
        summary: input.summary,
        description: input.description,
        categoryId: input.categoryId,
        mode: input.mode,
        skills: JSON.stringify(input.skills),
        equipment: JSON.stringify(input.equipment),
        startingCostMin: input.startingCostMin,
        startingCostMax: input.startingCostMax,
        recurringExpenses: JSON.stringify(input.recurringExpenses),
        revenueStreams: JSON.stringify(input.revenueStreams),
        targetCustomers: input.targetCustomers,
        competition: input.competition,
        difficulty: input.difficulty,
        timeCommitment: input.timeCommitment,
        steps: JSON.stringify(input.steps),
        marketing: JSON.stringify(input.marketing),
        risks: JSON.stringify(input.risks),
        legal: JSON.stringify(input.legal),
        resources: JSON.stringify(input.resources),
        sources: JSON.stringify(input.resources),
        published: input.published,
        featured: input.featured,
        lastVerifiedAt: input.lastVerifiedAt || new Date(),
        createdById: req.user.id,
      },
      include: { category: { select: { slug: true, name: true } } },
    });
    res.status(201).json({ idea: serializeIdea(idea) });
  }),
);

adminRouter.patch(
  '/ideas/:id',
  asyncHandler(async (req, res) => {
    const existing = await prisma.idea.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new ApiError(404, 'Business idea not found');
    const input = parseOrThrow(adminIdeaSchema, req.body);
    const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
    if (!category) throw new ApiError(400, 'Select a valid category');

    const idea = await prisma.idea.update({
      where: { id: existing.id },
      data: {
        title: input.title,
        slug: input.slug,
        summary: input.summary,
        description: input.description,
        categoryId: input.categoryId,
        mode: input.mode,
        skills: JSON.stringify(input.skills),
        equipment: JSON.stringify(input.equipment),
        startingCostMin: input.startingCostMin,
        startingCostMax: input.startingCostMax,
        recurringExpenses: JSON.stringify(input.recurringExpenses),
        revenueStreams: JSON.stringify(input.revenueStreams),
        targetCustomers: input.targetCustomers,
        competition: input.competition,
        difficulty: input.difficulty,
        timeCommitment: input.timeCommitment,
        steps: JSON.stringify(input.steps),
        marketing: JSON.stringify(input.marketing),
        risks: JSON.stringify(input.risks),
        legal: JSON.stringify(input.legal),
        resources: JSON.stringify(input.resources),
        sources: JSON.stringify(input.resources),
        published: input.published,
        featured: input.featured,
        lastVerifiedAt: input.lastVerifiedAt || existing.lastVerifiedAt,
      },
      include: { category: { select: { slug: true, name: true } } },
    });
    res.json({ idea: serializeIdea(idea) });
  }),
);

adminRouter.patch(
  '/ideas/:id/publish',
  asyncHandler(async (req, res) => {
    const input = parseOrThrow(publishSchema, req.body);
    const idea = await prisma.idea.update({
      where: { id: req.params.id },
      data: { published: input.published },
      include: { category: { select: { slug: true, name: true } } },
    });
    res.json({ idea: serializeIdeaCard(idea, { published: idea.published }) });
  }),
);

adminRouter.delete(
  '/ideas/:id',
  asyncHandler(async (req, res) => {
    await prisma.idea.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  }),
);

adminRouter.get(
  '/categories',
  asyncHandler(async (_req, res) => {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { ideas: true } } },
    });
    res.json({
      items: categories.map((category) => ({
        id: category.id,
        slug: category.slug,
        name: category.name,
        description: category.description,
        mode: category.mode,
        icon: category.icon,
        sortOrder: category.sortOrder,
        ideaCount: category._count.ideas,
      })),
    });
  }),
);

adminRouter.post(
  '/categories',
  asyncHandler(async (req, res) => {
    const input = parseOrThrow(adminCategorySchema, req.body);
    const category = await prisma.category.create({ data: input });
    res.status(201).json({ category });
  }),
);

adminRouter.patch(
  '/categories/:id',
  asyncHandler(async (req, res) => {
    const input = parseOrThrow(adminCategorySchema, req.body);
    const category = await prisma.category.update({ where: { id: req.params.id }, data: input });
    res.json({ category });
  }),
);

adminRouter.delete(
  '/categories/:id',
  asyncHandler(async (req, res) => {
    const count = await prisma.idea.count({ where: { categoryId: req.params.id } });
    if (count > 0) throw new ApiError(409, 'Move or delete the ideas in this category first');
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  }),
);

adminRouter.get(
  '/guides',
  asyncHandler(async (_req, res) => {
    const guides = await prisma.guide.findMany({ orderBy: { updatedAt: 'desc' } });
    res.json({ items: guides.map(serializeFullGuide) });
  }),
);

adminRouter.post(
  '/guides',
  asyncHandler(async (req, res) => {
    const input = parseOrThrow(adminGuideSchema, req.body);
    const guide = await prisma.guide.create({
      data: {
        title: input.title,
        slug: input.slug,
        excerpt: input.excerpt,
        body: input.body,
        category: input.category,
        published: input.published,
        sources: JSON.stringify(input.sources),
        lastVerifiedAt: input.lastVerifiedAt || new Date(),
        authorId: req.user.id,
        isCommunity: false,
      },
    });
    res.status(201).json({ guide: serializeFullGuide(guide) });
  }),
);

adminRouter.patch(
  '/guides/:id',
  asyncHandler(async (req, res) => {
    const existing = await prisma.guide.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new ApiError(404, 'Guide not found');
    const input = parseOrThrow(adminGuideSchema, req.body);
    const guide = await prisma.guide.update({
      where: { id: existing.id },
      data: {
        title: input.title,
        slug: input.slug,
        excerpt: input.excerpt,
        body: input.body,
        category: input.category,
        published: input.published,
        sources: JSON.stringify(input.sources),
        lastVerifiedAt: input.lastVerifiedAt || existing.lastVerifiedAt,
      },
    });
    res.json({ guide: serializeFullGuide(guide) });
  }),
);

adminRouter.patch(
  '/guides/:id/publish',
  asyncHandler(async (req, res) => {
    const input = parseOrThrow(publishSchema, req.body);
    const guide = await prisma.guide.update({
      where: { id: req.params.id },
      data: { published: input.published },
    });
    res.json({ guide: serializeFullGuide(guide) });
  }),
);

adminRouter.delete(
  '/guides/:id',
  asyncHandler(async (req, res) => {
    await prisma.guide.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  }),
);

adminRouter.get(
  '/drafts',
  asyncHandler(async (req, res) => {
    const status = typeof req.query.status === 'string' ? req.query.status.toUpperCase() : '';
    const where = ['PENDING', 'APPROVED', 'REJECTED'].includes(status) ? { status } : {};
    const drafts = await prisma.contentDraft.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
      take: 100,
    });
    res.json({ items: drafts.map(serializeDraft) });
  }),
);

adminRouter.patch(
  '/drafts/:id/review',
  asyncHandler(async (req, res) => {
    const input = parseOrThrow(adminDraftActionSchema, req.body);
    const draft = await prisma.contentDraft.findUnique({ where: { id: req.params.id } });
    if (!draft) throw new ApiError(404, 'Draft not found');
    if (draft.status !== 'PENDING') throw new ApiError(409, 'This draft has already been reviewed');

    if (input.action === 'REJECT') {
      const updated = await prisma.contentDraft.update({
        where: { id: draft.id },
        data: { status: 'REJECTED', reviewerNote: input.reviewerNote, reviewedAt: new Date() },
      });
      return res.json({ draft: serializeDraft(updated), publishedGuide: null });
    }

    const disclaimer =
      '> Community-reviewed response. This is general guidance from a NO BS user, not verified professional advice. Confirm legal, tax and licensing details on official portals.';
    const slug = `community-${draft.id}`;
    const title = `Community answer: ${draft.title}`.slice(0, 160);
    const excerpt = draft.body.replace(/[#*_>`-]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 240);
    const guide = await prisma.guide.upsert({
      where: { slug },
      update: { title, excerpt, body: `${disclaimer}\n\n${draft.body}`, published: true, lastVerifiedAt: new Date() },
      create: {
        slug,
        title,
        excerpt,
        body: `${disclaimer}\n\n${draft.body}`,
        category: 'Community answers',
        published: true,
        sources: '[]',
        isCommunity: true,
        authorId: draft.userId,
        lastVerifiedAt: new Date(),
      },
    });
    const updated = await prisma.contentDraft.update({
      where: { id: draft.id },
      data: { status: 'APPROVED', reviewerNote: input.reviewerNote, reviewedAt: new Date() },
    });

    res.json({
      draft: serializeDraft(updated),
      publishedGuide: serializeGuide(guide),
      message: 'Draft approved and published as a clearly labelled community answer.',
    });
  }),
);

adminRouter.get(
  '/contacts',
  asyncHandler(async (_req, res) => {
    const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
    res.json({ items: messages });
  }),
);

adminRouter.patch(
  '/contacts/:id',
  asyncHandler(async (req, res) => {
    const input = parseOrThrow(handledSchema, req.body);
    const message = await prisma.contactMessage.update({
      where: { id: req.params.id },
      data: { handled: input.handled },
    });
    res.json({ message });
  }),
);
