import { prisma } from '../db/prisma.js';

export class InsightsService {
  async getEventDetailsForPlayer(eventId: number, playerId: number) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return null;
    }

    const summary = await prisma.eventSummary.findUnique({
      where: {
        eventId_playerId: {
          eventId,
          playerId,
        },
      },
    });

    const matches = await prisma.eventMatch.findMany({
      where: {
        eventId,
        playerId,
      },
      orderBy: { rowIndex: 'asc' },
    });

    const matchResults = matches.map((row) => {
      const isWin = row.winnerId === playerId;
      const opponentId = isWin ? row.loserId : row.winnerId;
      const delta = isWin ? row.winnerDelta : row.loserDelta;
      const opponentMean = isWin ? row.winnerOppMean : row.loserOppMean;
      const opponentStdev = isWin ? row.winnerOppStDev : row.loserOppStDev;

      return {
        result: isWin ? 'W' : 'L',
        opponent: { playerId: opponentId, name: row.opponentName ?? null },
        opponentRating: { mean: opponentMean, stdev: opponentStdev },
        delta,
        score: row.score,
      };
    });

    const wins = matchResults.filter((match) => match.result === 'W').length;
    const losses = matchResults.length - wins;

    const avgOpponent =
      matchResults.length > 0
        ? Math.round(
            matchResults.reduce((sum, match) => sum + match.opponentRating.mean, 0) /
              matchResults.length
          )
        : null;

    const bestWin =
      matchResults
        .filter((match) => match.result === 'W')
        .sort((a, b) => b.opponentRating.mean - a.opponentRating.mean)[0] ?? null;

    const toughestLoss =
      matchResults
        .filter((match) => match.result === 'L')
        .sort((a, b) => a.opponentRating.mean - b.opponentRating.mean)[0] ?? null;

    return {
      event: {
        id: event.id,
        name: event.name,
        date: event.date.toISOString(),
      },
      player: { playerId },
      summary: summary
        ? {
            initial: { mean: summary.initialMean, stdev: summary.initialStDev },
            final: { mean: summary.finalMean, stdev: summary.finalStDev },
            totalChange: summary.pointChange,
          }
        : null,
      insights: {
        wins,
        losses,
        avgOpponentMean: avgOpponent,
        bestWin,
        toughestLoss,
      },
      matches: matchResults,
    };
  }
}
