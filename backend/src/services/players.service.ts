import { prisma } from '../db/prisma.js';
import { decodeCursor, encodeCursor } from '../utils/api/cursor.js';
import { getRangeStart, RangeKey } from '../utils/api/range.js';

const MOMENTUM_EVENTS = 5;

const confidenceBucket = (stdev: number | null) => {
  if (stdev == null) {
    return 'unknown';
  }
  if (stdev <= 60) return 'high';
  if (stdev <= 130) return 'medium';
  return 'low';
};

const latestHistory = async (playerId: number) => {
  return prisma.playerHistory.findFirst({
    where: { playerId },
    orderBy: { eventDate: 'desc' },
  });
};

const historyRange = async (playerId: number, range: RangeKey) => {
  const start = getRangeStart(range);
  return prisma.playerHistory.findMany({
    where: {
      playerId,
      ...(start ? { eventDate: { gte: start } } : {}),
    },
    orderBy: { eventDate: 'desc' },
  });
};

export class PlayersService {
  async getOverview(playerId: number, range: RangeKey) {
    const player = await prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!player) {
      return null;
    }

    const clubMember = await prisma.clubMember.findFirst({
      where: { playerId },
      include: { club: true },
    });

    const [latest, rangeRows] = await Promise.all([
      latestHistory(playerId),
      historyRange(playerId, range),
    ]);

    const eventIds = rangeRows.map((row) => row.eventId);

    const matches = eventIds.length > 0
      ? await prisma.eventMatch.findMany({
          where: {
            eventId: { in: eventIds },
            playerId,
          },
        })
      : [];

    const wins = matches.filter((m) => m.winnerId === playerId);
    const losses = matches.filter((m) => m.loserId === playerId);

    // Upset wins: wins where opponent was rated higher than the player's initial rating for that event
    const playerRatingByEvent = new Map(rangeRows.map((r) => [r.eventId, r.initialMean]));
    const upsetWinMatches = wins.filter((m) => {
      const playerRating = playerRatingByEvent.get(m.eventId);
      return playerRating != null && m.winnerOppMean > playerRating;
    });

    const bestWin = upsetWinMatches.length > 0
      ? upsetWinMatches.reduce((best, m) => (m.winnerOppMean > best.winnerOppMean ? m : best))
      : null;

    // Toughest loss: lowest-rated opponent that beat the player
    const toughestLoss = losses.length > 0
      ? losses.reduce((worst, m) => (m.loserOppMean < worst.loserOppMean ? m : worst))
      : null;

    // Current streak: consecutive events with positive or negative point changes (rangeRows is DESC)
    let streakCount = 0;
    let streakDirection: 'W' | 'L' | null = null;
    if (rangeRows.length > 0) {
      streakDirection = rangeRows[0].pointChange >= 0 ? 'W' : 'L';
      for (const row of rangeRows) {
        const rowDir = row.pointChange >= 0 ? 'W' : 'L';
        if (rowDir === streakDirection) {
          streakCount++;
        } else {
          break;
        }
      }
    }

    const recentEvents = rangeRows.slice(0, 7).map((row) => ({
      eventId: row.eventId,
      eventDate: row.eventDate.toISOString(),
      eventName: row.eventName,
      pointChange: row.pointChange,
      final: { mean: row.finalMean, stdev: row.finalStDev },
    }));

    const trendPoints = rangeRows
      .slice()
      .reverse()
      .map((row) => ({
        date: row.eventDate.toISOString(),
        mean: row.finalMean,
        stdev: row.finalStDev,
      }));

    const momentum = rangeRows
      .slice(0, MOMENTUM_EVENTS)
      .reduce((sum, row) => sum + row.pointChange, 0);

    const stdevChange =
      rangeRows.length >= 2
        ? rangeRows[0].finalStDev - rangeRows[rangeRows.length - 1].finalStDev
        : null;

    return {
      playerId: player.id,
      displayName: player.displayName,
      club: clubMember
        ? {
            clubId: clubMember.clubId,
            name: clubMember.club.name,
            rank: clubMember.rank ?? null,
          }
        : null,
      current: latest
        ? {
            mean: latest.finalMean,
            stdev: latest.finalStDev,
            lastChange: latest.pointChange,
            lastEvent: {
              eventId: latest.eventId,
              name: latest.eventName,
              date: latest.eventDate.toISOString(),
            },
            confidence: confidenceBucket(latest.finalStDev),
          }
        : null,
      lastPlayedDate: latest?.eventDate?.toISOString() ?? null,
      insights: {
        momentumLast5: momentum,
        stdevChangeSelectedRange: stdevChange,
        eventsPlayed: rangeRows.length,
        winRate: matches.length > 0
          ? { wins: wins.length, losses: losses.length, total: matches.length }
          : null,
        upsetWins: {
          count: upsetWinMatches.length,
          best: bestWin
            ? {
                opponentName: bestWin.opponentName ?? null,
                opponentRating: bestWin.winnerOppMean,
                eventId: bestWin.eventId,
              }
            : null,
        },
        toughestLoss: toughestLoss
          ? {
              opponentName: toughestLoss.opponentName ?? null,
              opponentRating: toughestLoss.loserOppMean,
              eventId: toughestLoss.eventId,
            }
          : null,
        currentStreak: streakCount > 0
          ? { direction: streakDirection!, count: streakCount }
          : null,
      },
      trend: { points: trendPoints },
      recentEvents,
      sync: {
        status: player.syncStatus,
        lastSyncedAt: player.lastSyncedAt?.toISOString() ?? null,
        error: player.syncError ?? null,
      },
    };
  }

  async getHistory(playerId: number, range: RangeKey, limit: number, cursor?: string) {
    const start = getRangeStart(range);
    const decoded = decodeCursor(cursor);

    const historyRows = await prisma.playerHistory.findMany({
      where: {
        playerId,
        ...(start ? { eventDate: { gte: start } } : {}),
        ...(decoded
          ? {
              OR: [
                { eventDate: { lt: new Date(decoded.eventDate) } },
                {
                  eventDate: new Date(decoded.eventDate),
                  eventId: { lt: decoded.eventId },
                },
              ],
            }
          : {}),
      },
      orderBy: [{ eventDate: 'desc' }, { eventId: 'desc' }],
      take: limit + 1,
    });

    const hasMore = historyRows.length > limit;
    const items = hasMore ? historyRows.slice(0, limit) : historyRows;
    const nextCursor = hasMore
      ? encodeCursor({
          eventDate: items[items.length - 1].eventDate.toISOString(),
          eventId: items[items.length - 1].eventId,
        })
      : null;

    return {
      items: items.map((row) => ({
        eventId: row.eventId,
        eventDate: row.eventDate.toISOString(),
        eventName: row.eventName,
        initial: { mean: row.initialMean, stdev: row.initialStDev },
        pointChange: row.pointChange,
        final: { mean: row.finalMean, stdev: row.finalStDev },
      })),
      nextCursor,
      hasMore,
    };
  }

  async getAvatar(playerId: number): Promise<string | null> {
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      select: { avatarUrl: true },
    });
    return player?.avatarUrl ?? null;
  }

  async updateAvatar(playerId: number, avatarUrl: string): Promise<void> {
    await prisma.player.update({
      where: { id: playerId },
      data: { avatarUrl },
    });
  }

}
