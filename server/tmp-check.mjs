import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const idea = await prisma.idea.findUnique({
  where: { slug: 'test-idea-e2e' },
  select: { resources: true, sources: true },
});
console.log(idea);
await prisma.$disconnect();
