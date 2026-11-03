import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { aiLimiter } from '../middleware/rateLimit.js';
import { analyzerSchema, parseOrThrow } from '../lib/validation.js';
import { findRelevantIdeas } from '../services/discovery.js';
import { buildRuleBasedAnalysis, normalizeAiAnalysis } from '../services/analyzer.js';
import { aiAnalyzeIdea, aiStatus } from '../services/ai.js';

export const analyzerRouter = Router();

const submitSchema = z.object({
  idea: z.string().trim().min(5).max(2000),
  title: z.string().trim().min(3).max(160).optional(),
  body: z.string().trim().min(20).max(30000),
  source: z.enum(['AI', 'RULE_BASED']).default('RULE_BASED'),
});

async function loadLibraryIdeas() {
  return prisma.idea.findMany({
    where: { published: true },
    include: { category: { select: { name: true } } },
  });
}

analyzerRouter.post(
  '/analyze',
  aiLimiter,
  asyncHandler(async (req, res) => {
    const input = parseOrThrow(analyzerSchema, req.body);
    const ideas = await loadLibraryIdeas();
    const related = findRelevantIdeas(ideas, input.idea, 3);

    if (aiStatus().enabled) {
      try {
        const context = related
          .map((idea) => `${idea.title}: ${idea.summary} Target: ${idea.targetCustomers}`)
          .join('\n');
        const aiAnalysis = await aiAnalyzeIdea(input.idea, context, input.budget, input.location);
        return res.json({
          analysis: normalizeAiAnalysis(aiAnalysis, related, input.budget, input.location),
          source: 'AI',
          aiConfigured: true,
        });
      } catch (error) {
        console.error('[analyzer] AI failed, using rule-based analysis:', error.message);
      }
    }

    const analysis = buildRuleBasedAnalysis({
      ideaText: input.idea,
      budget: input.budget,
      location: input.location,
      relatedIdeas: related,
    });
    res.json({ analysis, source: 'RULE_BASED', aiConfigured: aiStatus().enabled });
  }),
);

analyzerRouter.post(
  '/submit-review',
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = parseOrThrow(submitSchema, req.body);
    const draft = await prisma.contentDraft.create({
      data: {
        type: 'ANALYZER',
        title: (input.title || `Idea analysis: ${input.idea}`).slice(0, 160),
        body: input.body,
        source: input.source,
        status: 'PENDING',
        userId: req.user.id,
      },
    });
    res.status(201).json({
      draft: { id: draft.id, status: draft.status },
      message: 'Analysis submitted for admin review. It is not published until an admin approves it.',
    });
  }),
);
