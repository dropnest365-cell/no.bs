import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error('Usage: npm run make-admin -w server -- you@example.com');
  console.error('Register the account in the app first.');
  process.exit(1);
}

const user = await prisma.user.findUnique({ where: { email } });
if (!user) {
  console.error(`No account found for ${email}. Register in the app first, then run this command.`);
  process.exit(1);
}

await prisma.user.update({ where: { email }, data: { role: 'ADMIN' } });
console.log(`${email} is now an administrator. Log out and back in if the UI does not update immediately.`);
await prisma.$disconnect();
