import { prisma } from '../db/prisma.js';

const truncateSql = `
TRUNCATE TABLE
  "EventMatch",
  "EventSummary",
  "PlayerHistory",
  "ClubMember",
  "Event",
  "Player",
  "Club"
RESTART IDENTITY CASCADE;
`;

try {
  console.log('[reset-db] Truncating tables...');
  await prisma.$executeRawUnsafe(truncateSql);
  console.log('Database reset complete.');
} catch (error) {
  console.error('Database reset failed:', error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
