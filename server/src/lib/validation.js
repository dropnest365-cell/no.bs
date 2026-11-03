import { z } from 'zod';
import { ApiError } from '../middleware/error.js';

export const emailSchema = z.string().trim().toLowerCase().email('Enter a valid email address').max(254);
export const passwordSchema = z
  .string()
  .min(10, 'Password must be at least 10 characters')
  .max(128, 'Password is too long');

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required').max(128),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  bio: z.string().trim().max(500).optional().default(''),
  city: z.string().trim().max(100).optional().default(''),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: passwordSchema,
});

const idSchema = z.string().trim().min(1).max(100);

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: emailSchema,
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(3000),
});

export const mentorMessageSchema = z.object({
  content: z.string().trim().min(2, 'Write a question first').max(3000),
});

export const conversationSchema = z.object({
  title: z.string().trim().min(1).max(100).optional(),
});

export const analyzerSchema = z.object({
  idea: z.string().trim().min(10, 'Describe the idea in at least 10 characters').max(2000),
  budget: z.coerce.number().min(0).max(1_000_000_000).optional(),
  location: z.string().trim().max(120).optional(),
});

export const roadmapSchema = z.object({
  idea: z.string().trim().min(3, 'Describe the business idea').max(500),
  budget: z.coerce.number().min(0).max(1_000_000_000),
  location: z.string().trim().min(1, 'Location is required').max(120),
  skills: z.string().trim().max(1000).optional().default(''),
  timeAvailable: z.string().trim().max(200).optional().default('10-15 hours per week'),
  goals: z.string().trim().max(1000).optional().default(''),
});

export const adminIdeaSchema = z.object({
  title: z.string().trim().min(3).max(120),
  slug: z.string().trim().min(3).max(140).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens'),
  summary: z.string().trim().min(10).max(500),
  description: z.string().trim().min(20).max(10000),
  categoryId: z.string().trim().min(1),
  mode: z.enum(['ONLINE', 'OFFLINE']),
  skills: z.array(z.string().trim().min(1).max(160)).max(20),
  equipment: z.array(z.string().trim().min(1).max(200)).max(20),
  startingCostMin: z.coerce.number().int().min(0).max(1_000_000_000),
  startingCostMax: z.coerce.number().int().min(0).max(1_000_000_000),
  recurringExpenses: z.array(z.string().trim().min(1).max(200)).max(20),
  revenueStreams: z.array(z.string().trim().min(1).max(200)).max(20),
  targetCustomers: z.string().trim().min(5).max(1000),
  competition: z.string().trim().min(5).max(1000),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  timeCommitment: z.string().trim().min(3).max(200),
  steps: z.array(z.string().trim().min(3).max(400)).min(1).max(30),
  marketing: z.array(z.string().trim().min(3).max(300)).max(20),
  risks: z.array(z.string().trim().min(3).max(300)).max(20),
  legal: z.array(z.string().trim().min(3).max(300)).max(20),
  resources: z.array(z.object({
    label: z.string().trim().min(1).max(120),
    url: z.string().url().max(500),
    note: z.string().trim().max(300).optional(),
  })).max(20),
  published: z.boolean().default(true),
  featured: z.boolean().default(false),
  lastVerifiedAt: z.coerce.date().optional(),
}).refine((data) => data.startingCostMax >= data.startingCostMin, {
  message: 'Maximum cost must be greater than or equal to minimum cost',
  path: ['startingCostMax'],
});

export const adminCategorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens'),
  description: z.string().trim().min(5).max(400),
  mode: z.enum(['ONLINE', 'OFFLINE', 'BOTH']),
  icon: z.string().trim().max(50).optional().default('Tag'),
  sortOrder: z.coerce.number().int().min(0).max(999).optional().default(0),
});

export const adminGuideSchema = z.object({
  title: z.string().trim().min(3).max(160),
  slug: z.string().trim().min(3).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens'),
  excerpt: z.string().trim().min(10).max(500),
  body: z.string().trim().min(20).max(30000),
  category: z.string().trim().min(2).max(80),
  published: z.boolean().default(true),
  sources: z.array(z.object({
    label: z.string().trim().min(1).max(160),
    url: z.string().url().max(500),
    note: z.string().trim().max(300).optional(),
  })).max(20).default([]),
  lastVerifiedAt: z.coerce.date().optional(),
});

export const adminDraftActionSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  reviewerNote: z.string().trim().max(1000).optional().default(''),
});

export const roadmapUpdateSchema = z.object({
  stages: z.array(
    z.object({
      key: z.string().trim().min(1).max(50),
      title: z.string().trim().min(1).max(100),
      summary: z.string().trim().max(1000),
      timeline: z.string().trim().max(100).optional().default(''),
      tasks: z.array(
        z.object({
          id: z.string().trim().min(1).max(80),
          title: z.string().trim().min(1).max(300),
          priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional().default('MEDIUM'),
          done: z.boolean(),
        }),
      ).max(30),
    }),
  ).min(1).max(10),
});

export const bookmarkParamSchema = z.object({ ideaId: idSchema });

export const querySchema = z.object({
  q: z.string().trim().max(120).optional(),
  mode: z.enum(['ONLINE', 'OFFLINE']).optional(),
  category: z.string().trim().max(100).optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  budget: z.coerce.number().int().min(0).max(1_000_000_000).optional(),
  sort: z.enum(['featured', 'newest', 'cost-low', 'cost-high', 'title']).optional().default('featured'),
  page: z.coerce.number().int().min(1).max(1000).optional().default(1),
  limit: z.coerce.number().int().min(1).max(48).optional().default(12),
  featured: z.enum(['true', 'false']).optional(),
});

export function parseBody(schema, body) {
  return schema.parse(body);
}

export function zodDetails(error) {
  return error.issues.map((issue) => ({
    path: issue.path.join('.') || 'body',
    message: issue.message,
  }));
}

export function parseOrThrow(schema, data, message = 'Validation failed') {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ApiError(400, message, zodDetails(result.error));
  }
  return result.data;
}
