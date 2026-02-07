import { Controller, Get, Param, Query } from '@nestjs/common';

import { prisma } from '../db/prisma.js';

type RankCursor = {
  rank: number;
  playerId: number;
};

const encodeRankCursor = (payload: RankCursor): string =>
  Buffer.from(JSON.stringify(payload)).toString('base64url');

const decodeRankCursor = (cursor?: string): RankCursor | null => {
  if (!cursor) return null;
  try {
    return JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')) as RankCursor;
  } catch {
    return null;
  }
};

@Controller('v1/clubs')
export class ClubsController {
  @Get(':clubId/leaderboard')
  async getLeaderboard(
    @Param('clubId') clubId: string,
    @Query('limit') limit = '50',
    @Query('cursor') cursor?: string
  ) {
    const safeLimit = Math.min(Number(limit) || 50, 200);
    const decoded = decodeRankCursor(cursor);

    const rows = await prisma.clubMember.findMany({
      where: {
        clubId: Number(clubId),
        ...(decoded
          ? {
              OR: [
                { rank: { gt: decoded.rank } },
                { rank: decoded.rank, playerId: { gt: decoded.playerId } },
              ],
            }
          : {}),
      },
      orderBy: [{ rank: 'asc' }, { playerId: 'asc' }],
      take: safeLimit + 1,
    });

    const hasMore = rows.length > safeLimit;
    const items = hasMore ? rows.slice(0, safeLimit) : rows;
    const nextCursor = hasMore
      ? encodeRankCursor({
          rank: items[items.length - 1].rank ?? 0,
          playerId: items[items.length - 1].playerId,
        })
      : null;

    return {
      items: items.map((row) => ({
        rank: row.rank,
        playerId: row.playerId,
        name: row.displayName,
        rating: { mean: row.ratingMean, stdev: row.ratingStDev },
        lastPlayedDate: row.lastPlayedDate?.toISOString() ?? null,
      })),
      nextCursor,
      hasMore,
    };
  }
}
