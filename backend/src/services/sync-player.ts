import { prisma } from '../db/prisma.js';
import { fetchPlayerHistory } from '../scrapers/playerHistory.js';
import { syncEventForPlayer } from './sync-event.js';

export type SyncPlayerOptions = {
  syncEvents?: boolean;
  monthsBack?: number;
};

export const syncPlayer = async (
  playerId: number,
  options: SyncPlayerOptions = {}
): Promise<void> => {
  const syncEvents = options.syncEvents !== false;
  const monthsBack = options.monthsBack ?? 12;
  console.log(`[sync-player] Fetching history for player ${playerId}...`);
  const historyRows = await fetchPlayerHistory(playerId);
  console.log(
    `[sync-player] History rows fetched: ${historyRows.length} for player ${playerId}`
  );

  const existingPlayer = await prisma.player.findUnique({ where: { id: playerId } });
  const displayName = existingPlayer?.displayName || `Player ${playerId}`;

  await prisma.player.upsert({
    where: { id: playerId },
    update: {
      displayName,
      lastSyncedAt: new Date(),
      syncStatus: 'in_progress',
      syncError: null,
    },
    create: {
      id: playerId,
      displayName,
      lastSyncedAt: new Date(),
      syncStatus: 'in_progress',
    },
  });

  if (historyRows.length === 0) {
    console.warn(`[sync-player] No history found for player ${playerId}`);
    await prisma.player.update({
      where: { id: playerId },
      data: {
        lastSyncedAt: new Date(),
        syncStatus: 'failed',
        syncError: 'No player history found.',
      },
    });
    return;
  }

  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - monthsBack);
  const recentRows = historyRows.filter((row) => row.eventDate >= cutoffDate);

  console.log(
    `[sync-player] Keeping ${recentRows.length}/${historyRows.length} events since ${cutoffDate.toISOString().slice(0, 10)}`
  );

  for (const row of recentRows) {
    await prisma.event.upsert({
      where: { id: row.eventId },
      update: {
        name: row.eventName || undefined,
        date: row.eventDate,
      },
      create: {
        id: row.eventId,
        name: row.eventName || `Event ${row.eventId}`,
        date: row.eventDate,
      },
    });

    await prisma.playerHistory.upsert({
      where: {
        playerId_eventId: {
          playerId,
          eventId: row.eventId,
        },
      },
      update: {
        eventDate: row.eventDate,
        eventName: row.eventName,
        initialMean: row.initialMean,
        initialStDev: row.initialStDev,
        pointChange: row.pointChange,
        finalMean: row.finalMean,
        finalStDev: row.finalStDev,
      },
      create: {
        playerId,
        eventId: row.eventId,
        eventDate: row.eventDate,
        eventName: row.eventName,
        initialMean: row.initialMean,
        initialStDev: row.initialStDev,
        pointChange: row.pointChange,
        finalMean: row.finalMean,
        finalStDev: row.finalStDev,
      },
    });
  }

  if (syncEvents) {
    const uniqueEvents = new Map(recentRows.map((row) => [row.eventId, row]));
    console.log(
      `[sync-player] Syncing ${uniqueEvents.size} events for player ${playerId}`
    );

    for (const row of uniqueEvents.values()) {
      try {
        await syncEventForPlayer(row.eventId, playerId, {
          name: row.eventName,
          date: row.eventDate,
        });
      } catch (error) {
        console.warn(
          `[sync-player] Event ${row.eventId} sync failed for player ${playerId}:`,
          error
        );
      }
    }
  }

  await prisma.player.update({
    where: { id: playerId },
    data: {
      lastSyncedAt: new Date(),
      syncStatus: 'ok',
      syncError: null,
    },
  });
  console.log(`[sync-player] Player ${playerId} sync done.`);
};
