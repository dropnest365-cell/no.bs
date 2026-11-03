import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, ApiError } from '../middleware/error.js';
import { aiLimiter } from '../middleware/rateLimit.js';
import { mentorMessageSchema, parseOrThrow } from '../lib/validation.js';
import { aiMentorReply, aiStatus } from '../services/ai.js';
import { buildRuleBasedReply, mentorContext } from '../services/mentor.js';

export const mentorRouter = Router();

mentorRouter.get('/status', (_req, res) => {
  res.json(aiStatus());
});

mentorRouter.use(requireAuth);

async function ownedConversation(id, userId) {
  const conversation = await prisma.conversation.findFirst({ where: { id, userId } });
  if (!conversation) throw new ApiError(404, 'Conversation not found');
  return conversation;
}

mentorRouter.get(
  '/conversations',
  asyncHandler(async (req, res) => {
    const conversations = await prisma.conversation.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { messages: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1, select: { content: true, role: true } },
      },
    });
    res.json({
      items: conversations.map((conversation) => ({
        id: conversation.id,
        title: conversation.title,
        messageCount: conversation._count.messages,
        lastMessage: conversation.messages[0]?.content?.slice(0, 160) || '',
        updatedAt: conversation.updatedAt,
        createdAt: conversation.createdAt,
      })),
    });
  }),
);

mentorRouter.post(
  '/conversations',
  asyncHandler(async (req, res) => {
    const conversation = await prisma.conversation.create({
      data: { userId: req.user.id, title: 'New conversation' },
    });
    res.status(201).json({ conversation });
  }),
);

mentorRouter.get(
  '/conversations/:id',
  asyncHandler(async (req, res) => {
    const conversation = await ownedConversation(req.params.id, req.user.id);
    const messages = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
      select: { id: true, role: true, content: true, source: true, createdAt: true },
    });
    res.json({
      conversation: { id: conversation.id, title: conversation.title, createdAt: conversation.createdAt },
      messages,
    });
  }),
);

mentorRouter.delete(
  '/conversations/:id',
  asyncHandler(async (req, res) => {
    await ownedConversation(req.params.id, req.user.id);
    await prisma.conversation.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  }),
);

mentorRouter.post(
  '/conversations/:id/messages',
  aiLimiter,
  asyncHandler(async (req, res) => {
    const conversation = await ownedConversation(req.params.id, req.user.id);
    const input = parseOrThrow(mentorMessageSchema, req.body, 'Write a valid question');

    const userMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'USER',
        content: input.content,
        source: 'USER',
      },
    });

    const [ideas, guides, tools] = await Promise.all([
      prisma.idea.findMany({
        where: { published: true },
        select: {
          slug: true, title: true, summary: true, mode: true,
          category: { select: { name: true } },
          startingCostMin: true, startingCostMax: true,
        },
      }),
      prisma.guide.findMany({
        where: { published: true },
        select: { slug: true, title: true, excerpt: true },
        take: 12,
      }),
      prisma.tool.findMany({
        where: { published: true },
        select: { name: true, category: true, description: true },
        take: 20,
      }),
    ]);

    let reply;
    let fallbackReason = null;
    const status = aiStatus();
    if (status.enabled) {
      try {
        const aiContent = await aiMentorReply(input.content, mentorContext(ideas, guides, tools));
        reply = {
          content: `${aiContent}\n\n---\n_AI-generated response. It may be incomplete or wrong. Verify important claims and official requirements before acting. It has not been reviewed by an expert unless you submit it for admin review._`,
          source: 'AI',
        };
      } catch {
        reply = buildRuleBasedReply({ question: input.content, ideas });
        fallbackReason = 'The configured AI provider was unavailable, so a rule-based answer was used.';
      }
    } else {
      reply = buildRuleBasedReply({ question: input.content, ideas });
    }

    const assistantMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'ASSISTANT',
        content: reply.content,
        source: reply.source,
      },
    });

    const newTitle =
      conversation.title === 'New conversation'
        ? input.content.replace(/\s+/g, ' ').slice(0, 70)
        : conversation.title;

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { title: newTitle, updatedAt: new Date() },
    });

    res.status(201).json({
      userMessage,
      assistantMessage,
      conversation: { id: conversation.id, title: newTitle },
      source: reply.source,
      fallbackReason,
    });
  }),
);

mentorRouter.post(
  '/messages/:id/submit-review',
  asyncHandler(async (req, res) => {
    const message = await prisma.message.findUnique({
      where: { id: req.params.id },
      include: { conversation: true },
    });
    if (!message || message.conversation.userId !== req.user.id) {
      throw new ApiError(404, 'Message not found');
    }
    if (message.role !== 'ASSISTANT') throw new ApiError(400, 'Only mentor answers can be submitted for review');

    const duplicate = await prisma.contentDraft.findFirst({
      where: { userId: req.user.id, body: message.content, status: 'PENDING' },
    });
    if (duplicate) throw new ApiError(409, 'This answer is already waiting for admin review');

    const draft = await prisma.contentDraft.create({
      data: {
        type: 'AI_ANSWER',
        title: `Mentor answer: ${message.conversation.title}`.slice(0, 120),
        body: message.content,
        source: message.source === 'AI' ? 'AI' : 'RULE_BASED',
        userId: req.user.id,
        status: 'PENDING',
      },
    });
    res.status(201).json({
      draft: { id: draft.id, status: draft.status },
      message: 'Submitted for admin review. It will not be published automatically.',
    });
  }),
);
