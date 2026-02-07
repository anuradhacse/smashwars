import {
  clubMembers,
  currentPlayer,
  ratingHistory,
  recentEvents,
} from '@/app/data/mockData';
import type {
  ClubLeaderboard,
  EventDetailsForPlayer,
  PlayerHistory,
  PlayerOverview,
  SyncInfo,
} from './types';

const DEFAULT_PLAYER_ID = 156412;
const DEFAULT_CLUB_ID = 967;

const nowIso = new Date('2026-01-20T10:30:00Z').toISOString();

const defaultSync: SyncInfo = {
  status: 'ok',
  lastSyncedAt: nowIso,
  error: null,
};

const getPlayerName = () => currentPlayer.name;

export const mockApi = {
  getPlayerOverview(playerId: number = DEFAULT_PLAYER_ID): PlayerOverview {
    if (playerId !== Number(currentPlayer.id)) {
      throw new Error('Player not found in mock data');
    }

    const lastEvent = recentEvents[0];
    const lastChange = lastEvent?.ratingChange;

    const trendPoints = ratingHistory.map((point) => ({
      date: point.date,
      mean: point.rating,
      stdev: point.uncertainty,
    }));

    const recentEventSummaries = recentEvents.slice(0, 10).map((event) => ({
      eventId: Number(event.id),
      eventDate: event.date,
      eventName: event.name,
      pointChange: event.ratingChange,
      final: { mean: event.finalRating, stdev: ratingHistory[ratingHistory.length - 1].uncertainty },
    }));

    const last5 = recentEvents.slice(0, 5);
    const momentumLast5 = last5.reduce((sum, evt) => sum + evt.ratingChange, 0);

    return {
      playerId,
      displayName: getPlayerName(),
      club: {
        clubId: DEFAULT_CLUB_ID,
        name: currentPlayer.club,
        rank: clubMembers.find((member) => member.id === currentPlayer.id)?.rank ?? null,
      },
      current: {
        mean: currentPlayer.rating,
        stdev: currentPlayer.uncertainty,
        lastChange,
        lastEvent: lastEvent
          ? { eventId: Number(lastEvent.id), name: lastEvent.name, date: lastEvent.date }
          : undefined,
        confidence: 'medium',
      },
      lastPlayedDate: currentPlayer.lastPlayed,
      trend: { points: trendPoints },
      recentEvents: recentEventSummaries,
      insights: {
        momentumLast5,
        stdevChangeSelectedRange: ratingHistory[0]
          ? currentPlayer.uncertainty - ratingHistory[0].uncertainty
          : undefined,
      },
      sync: defaultSync,
    };
  },

  getPlayerHistory(
    playerId: number = DEFAULT_PLAYER_ID,
    range: '3m' | '6m' | '12m' | 'all' = '12m',
  ): PlayerHistory {
    if (playerId !== Number(currentPlayer.id)) {
      throw new Error('Player not found in mock data');
    }

    const rangeMap: Record<'3m' | '6m' | '12m' | 'all', number> = {
      '3m': 3,
      '6m': 6,
      '12m': 12,
      all: 120,
    };
    const now = new Date('2026-01-20');
    const cutoff = new Date(now);
    cutoff.setMonth(cutoff.getMonth() - rangeMap[range]);

    const events = recentEvents
      .filter((event) => new Date(event.date) >= cutoff || range === 'all')
      .map((event) => ({
        eventId: Number(event.id),
        eventDate: event.date,
        eventName: event.name,
        initial: { mean: event.initialRating, stdev: event.ratingChange === 0 ? 0 : 41 },
        pointChange: event.ratingChange,
        final: { mean: event.finalRating, stdev: 41 },
      }));

    return {
      items: events,
      nextCursor: null,
      hasMore: false,
    };
  },

  getEventDetailsForPlayer(
    eventId: number,
    playerId: number = DEFAULT_PLAYER_ID,
  ): EventDetailsForPlayer {
    const event = recentEvents.find((evt) => Number(evt.id) === eventId);
    if (!event) {
      throw new Error('Event not found in mock data');
    }

    const matches = event.matches.map((match) => ({
      result: (match.result === 'win' ? 'W' : 'L') as 'W' | 'L',
      opponent: { playerId: match.opponentId, name: match.opponentName },
      opponentRating: { mean: match.opponentMean, stdev: match.opponentStDev },
      delta: match.ratingDelta,
      score: match.score,
    }));

    return {
      event: { id: Number(event.id), name: event.name, date: event.date },
      player: { playerId },
      summary: {
        initial: { mean: event.initialRating, stdev: 41 },
        final: { mean: event.finalRating, stdev: 41 },
        totalChange: event.ratingChange,
      },
      insights: {
        wins: matches.filter((match) => match.result === 'W').length,
        losses: matches.filter((match) => match.result === 'L').length,
        avgOpponentMean:
          matches.length > 0
            ? Math.round(
                matches.reduce((sum, match) => sum + match.opponentRating.mean, 0) /
                  matches.length,
              )
            : null,
        bestWin:
          matches
            .filter((match) => match.result === 'W')
            .sort((a, b) => b.opponentRating.mean - a.opponentRating.mean)[0] ?? null,
        toughestLoss:
          matches
            .filter((match) => match.result === 'L')
            .sort((a, b) => a.opponentRating.mean - b.opponentRating.mean)[0] ?? null,
      },
      matches,
    };
  },

  getClubLeaderboard(
    clubId: number = DEFAULT_CLUB_ID,
  ): ClubLeaderboard {
    if (clubId !== DEFAULT_CLUB_ID) {
      throw new Error('Club not found in mock data');
    }

    return {
      items: clubMembers.map((member) => ({
        rank: member.rank,
        playerId: Number(member.id),
        name: member.name,
        rating: { mean: member.rating, stdev: member.uncertainty },
        lastPlayedDate: member.lastPlayed,
      })),
      nextCursor: null,
      hasMore: false,
    };
  },
};
