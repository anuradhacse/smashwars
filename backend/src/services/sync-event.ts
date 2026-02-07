import { prisma } from '../db/prisma.js';
import { fetchEventDetail } from '../scrapers/eventDetail.js';
import { fetchEventSummary } from '../scrapers/eventSummary.js';

export type EventMeta = {
  name?: string;
  date?: Date;
};

export const syncEventForPlayer = async (
  eventId: number,
  playerId: number,
  meta: EventMeta = {}
): Promise<void> => {
  console.log(
    `[sync-event] Checking event ${eventId} for player ${playerId}...`
  );
  const existingSummary = await prisma.eventSummary.findUnique({
    where: {
      eventId_playerId: {
        eventId,
        playerId,
      },
    },
  });

  const existingMatch = await prisma.eventMatch.findFirst({
    where: {
      eventId,
      playerId,
    },
  });

  const existingMissingNames = await prisma.eventMatch.count({
    where: {
      eventId,
      playerId,
      opponentName: null,
    },
  });

  if (existingSummary && existingMatch && existingMissingNames === 0) {
    console.log(
      `[sync-event] Event ${eventId} already stored for player ${playerId}, skipping.`
    );
    return;
  }

  console.log(
    `[sync-event] Fetching summary + detail for event ${eventId}...`
  );
  const [summaryRows, detailRows] = await Promise.all([
    fetchEventSummary(eventId),
    fetchEventDetail(eventId),
  ]);

  const nameMap = new Map<number, string>();
  for (const row of summaryRows) {
    if (row.playerId && row.playerName) {
      nameMap.set(row.playerId, row.playerName);
    }
  }

  const existingEvent = await prisma.event.findUnique({ where: { id: eventId } });
  const eventName = meta.name?.trim() || existingEvent?.name || `Event ${eventId}`;
  const eventDate = meta.date || existingEvent?.date || new Date();

  await prisma.event.upsert({
    where: { id: eventId },
    update: {
      name: eventName,
      date: eventDate,
    },
    create: {
      id: eventId,
      name: eventName,
      date: eventDate,
    },
  });

  const playerSummary = summaryRows.find((row) => row.playerId === playerId);

  if (playerSummary) {
    console.log(
      `[sync-event] Upserting event summary for player ${playerId} (event ${eventId})`
    );
    await prisma.eventSummary.upsert({
      where: {
        eventId_playerId: {
          eventId,
          playerId,
        },
      },
      update: {
        playerName: playerSummary.playerName,
        initialMean: playerSummary.initialMean,
        initialStDev: playerSummary.initialStDev,
        pointChange: playerSummary.pointChange,
        finalMean: playerSummary.finalMean,
        finalStDev: playerSummary.finalStDev,
      },
      create: {
        eventId,
        playerId,
        playerName: playerSummary.playerName,
        initialMean: playerSummary.initialMean,
        initialStDev: playerSummary.initialStDev,
        pointChange: playerSummary.pointChange,
        finalMean: playerSummary.finalMean,
        finalStDev: playerSummary.finalStDev,
      },
    });
  }

  const playerMatches = detailRows.filter(
    (row) => row.winnerId === playerId || row.loserId === playerId
  );

  if (playerMatches.length > 0) {
    console.log(
      `[sync-event] Storing ${playerMatches.length} matches for player ${playerId} (event ${eventId})`
    );
    await prisma.eventMatch.deleteMany({
      where: {
        eventId,
        playerId,
      },
    });

    await prisma.eventMatch.createMany({
      data: playerMatches.map((row, index) => ({
        eventId,
        playerId,
        opponentName:
          row.winnerId === playerId
            ? nameMap.get(row.loserId) ?? null
            : nameMap.get(row.winnerId) ?? null,
        winnerId: row.winnerId,
        loserId: row.loserId,
        score: row.score,
        winnerDelta: row.winnerDelta,
        winnerOppMean: row.winnerOppMean,
        winnerOppStDev: row.winnerOppStDev,
        loserDelta: row.loserDelta,
        loserOppMean: row.loserOppMean,
        loserOppStDev: row.loserOppStDev,
        matchesPairPlayed: row.matchesPairPlayed,
        rowIndex: index,
      })),
    });
  } else {
    console.log(
      `[sync-event] No matches found for player ${playerId} in event ${eventId}`
    );
  }
};
