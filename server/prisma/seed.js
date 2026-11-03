import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { categories } from './data/categories.js';
import { tools } from './data/tools.js';
import { guides } from './data/guides.js';
import { onlineIdeas1 } from './data/online-1.js';
import { onlineIdeas2 } from './data/online-2.js';
import { offlineIdeas1 } from './data/offline-1.js';
import { offlineIdeas2 } from './data/offline-2.js';

const prisma = new PrismaClient();
const REVIEWED = new Date('2026-11-03T00:00:00.000Z');
const ideas = [...onlineIdeas1, ...onlineIdeas2, ...offlineIdeas1, ...offlineIdeas2];

async function main() {
  if (ideas.length !== 40) {
    throw new Error(`Expected 40 ideas, found ${ideas.length}`);
  }

  const categoryMap = new Map();
  for (const category of categories) {
    const record = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        mode: category.mode,
        icon: category.icon,
        sortOrder: category.sortOrder,
        description: category.description,
      },
      create: category,
    });
    categoryMap.set(record.slug, record.id);
  }

  for (const idea of ideas) {
    const categoryId = categoryMap.get(idea.category);
    if (!categoryId) throw new Error(`Unknown category "${idea.category}" on ${idea.slug}`);
    const data = {
      title: idea.title,
      summary: idea.summary,
      description: idea.description,
      categoryId,
      mode: idea.mode,
      skills: JSON.stringify(idea.skills),
      equipment: JSON.stringify(idea.equipment),
      startingCostMin: idea.startingCostMin,
      startingCostMax: idea.startingCostMax,
      recurringExpenses: JSON.stringify(idea.recurringExpenses),
      revenueStreams: JSON.stringify(idea.revenueStreams),
      targetCustomers: idea.targetCustomers,
      competition: idea.competition,
      difficulty: idea.difficulty,
      timeCommitment: idea.timeCommitment,
      steps: JSON.stringify(idea.steps),
      marketing: JSON.stringify(idea.marketing),
      risks: JSON.stringify(idea.risks),
      legal: JSON.stringify(idea.legal),
      resources: JSON.stringify(idea.resources),
      sources: JSON.stringify(idea.resources),
      featured: Boolean(idea.featured),
      published: true,
      lastVerifiedAt: REVIEWED,
    };
    await prisma.idea.upsert({
      where: { slug: idea.slug },
      update: data,
      create: { slug: idea.slug, ...data },
    });
  }

  for (const tool of tools) {
    const data = {
      name: tool.name,
      description: tool.description,
      category: tool.category,
      url: tool.url,
      pricing: tool.pricing,
      published: true,
      lastVerifiedAt: REVIEWED,
    };
    await prisma.tool.upsert({
      where: { slug: tool.slug },
      update: data,
      create: { slug: tool.slug, ...data },
    });
  }

  for (const guide of guides) {
    const data = {
      title: guide.title,
      excerpt: guide.excerpt,
      body: guide.body,
      category: guide.category,
      sources: JSON.stringify(guide.sources),
      published: true,
      lastVerifiedAt: REVIEWED,
      isCommunity: false,
    };
    await prisma.guide.upsert({
      where: { slug: guide.slug },
      update: data,
      create: { slug: guide.slug, ...data },
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    if (adminPassword.length < 10) {
      throw new Error('ADMIN_PASSWORD must be at least 10 characters.');
    }
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { role: 'ADMIN', passwordHash },
      create: { name: 'Administrator', email: adminEmail, passwordHash, role: 'ADMIN' },
    });
    console.log(`Admin account ready: ${adminEmail}`);
  } else {
    console.log('No admin bootstrapped. Register normally, then run: npm run make-admin -- you@example.com');
  }

  const [ideaCount, toolCount, guideCount, categoryCount] = await Promise.all([
    prisma.idea.count(),
    prisma.tool.count(),
    prisma.guide.count(),
    prisma.category.count(),
  ]);
  console.log(`Seed complete: ${ideaCount} ideas, ${toolCount} tools, ${guideCount} guides, ${categoryCount} categories.`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
