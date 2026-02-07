import { prisma } from '../db/prisma.js';
import { syncClub } from '../services/sync-club.js';

const args = process.argv.slice(2);
const clubIdArg = args[0];
const nameIndex = args.indexOf('--name');
const clubName = nameIndex >= 0 ? args[nameIndex + 1] : undefined;
const noPlayers = args.includes('--no-players');
const fromDb = args.includes('--from-db');
const monthsIndex = args.indexOf('--months');
const monthsBack =
  monthsIndex >= 0 ? Number(args[monthsIndex + 1]) : undefined;

if (!clubIdArg) {
  console.error(
    'Usage: npm run sync:club -- <clubId> [--name "Club Name"] [--no-players] [--from-db] [--months <n>]'
  );
  process.exit(1);
}

const clubId = Number(clubIdArg);

try {
  console.log(`[sync-club] Starting sync for club ${clubId}...`);
  await syncClub(clubId, {
    clubName,
    syncPlayers: !noPlayers,
    monthsBack,
    useRosterCache: fromDb,
  });
  console.log(`Club ${clubId} sync complete.`);
} catch (error) {
  console.error('Club sync failed:', error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
