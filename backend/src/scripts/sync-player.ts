import { prisma } from '../db/prisma.js';
import { syncPlayer } from '../services/sync-player.js';

const [playerIdArg, ...flags] = process.argv.slice(2);
const monthsIndex = flags.indexOf('--months');
const monthsBack =
  monthsIndex >= 0 ? Number(flags[monthsIndex + 1]) : undefined;

if (!playerIdArg) {
  console.error(
    'Usage: npm run sync:player -- <playerId> [--no-events] [--months <n>]'
  );
  process.exit(1);
}

const playerId = Number(playerIdArg);
const syncEvents = !flags.includes('--no-events');

try {
  console.log(`[sync-player] Starting sync for player ${playerId}...`);
  await syncPlayer(playerId, { syncEvents, monthsBack });
  console.log(`Player ${playerId} sync complete.`);
} catch (error) {
  console.error('Player sync failed:', error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
