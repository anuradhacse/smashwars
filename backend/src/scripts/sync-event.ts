import { prisma } from '../db/prisma.js';
import { syncEventForPlayer } from '../services/sync-event.js';

const args = process.argv.slice(2);
const eventIdArg = args[0];
const playerIndex = args.indexOf('--player');

if (!eventIdArg || playerIndex === -1) {
  console.error(
    'Usage: npm run sync:event -- <eventId> --player <playerId> [--name "Event Name"] [--date "YYYY-MM-DD"]'
  );
  process.exit(1);
}

const eventId = Number(eventIdArg);
const playerId = Number(args[playerIndex + 1]);
const nameIndex = args.indexOf('--name');
const dateIndex = args.indexOf('--date');
const name = nameIndex >= 0 ? args[nameIndex + 1] : undefined;
const dateString = dateIndex >= 0 ? args[dateIndex + 1] : undefined;
const date = dateString ? new Date(dateString) : undefined;

try {
  console.log(
    `[sync-event] Starting sync for event ${eventId}, player ${playerId}...`
  );
  await syncEventForPlayer(eventId, playerId, { name, date });
  console.log(`Event ${eventId} sync complete for player ${playerId}.`);
} catch (error) {
  console.error('Event sync failed:', error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
