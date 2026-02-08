export type SyncStatus = 'ok' | 'stale' | 'in_progress' | 'failed';

export interface SyncInfo {
  status: SyncStatus;
  lastSyncedAt: string | null;
  error?: string | null;
}

export interface RatingSnapshot {
  mean: number;
  stdev: number;
}

export interface PlayerOverview {
  playerId: number;
  displayName: string;
  club?: { clubId: number; name: string; rank?: number | null } | null;
  current: {
    mean: number;
    stdev: number;
    lastChange?: number;
    lastEvent?: { eventId: number; name: string; date: string };
    confidence?: 'high' | 'medium' | 'low' | 'unknown';
  } | null;
  lastPlayedDate?: string | null;
  trend: { points: Array<{ date: string; mean: number; stdev: number }> };
  recentEvents: Array<{
    eventId: number;
    eventDate: string;
    eventName: string;
    pointChange: number;
    final: RatingSnapshot;
  }>;
  insights: {
    momentumLast5?: number;
    stdevChangeSelectedRange?: number;
    eventsPlayed?: number;
    winRate?: { wins: number; losses: number; total: number } | null;
    upsetWins?: {
      count: number;
      best: {
        opponentName: string | null;
        opponentRating: number;
        eventId: number;
      } | null;
    };
    toughestLoss?: {
      opponentName: string | null;
      opponentRating: number;
      eventId: number;
    } | null;
    currentStreak?: { direction: 'W' | 'L'; count: number } | null;
  };
  sync: SyncInfo;
}

export interface PlayerHistory {
  items: Array<{
    eventId: number;
    eventDate: string;
    eventName: string;
    initial: RatingSnapshot;
    pointChange: number;
    final: RatingSnapshot;
  }>;
  nextCursor: string | null;
  hasMore: boolean;
}

export interface EventDetailsForPlayer {
  event: { id: number; name: string; date: string };
  player: { playerId: number };
  summary: {
    initial: RatingSnapshot;
    final: RatingSnapshot;
    totalChange: number;
  } | null;
  insights: {
    wins: number;
    losses: number;
    avgOpponentMean: number | null;
    bestWin: {
      opponent: { playerId: number; name?: string | null };
      opponentRating: RatingSnapshot;
      delta: number;
      score: string;
    } | null;
    toughestLoss: {
      opponent: { playerId: number; name?: string | null };
      opponentRating: RatingSnapshot;
      delta: number;
      score: string;
    } | null;
  };
  matches: Array<{
    result: 'W' | 'L';
    opponent: { playerId: number; name?: string | null };
    opponentRating: RatingSnapshot;
    delta: number;
    score: string;
  }>;
}

export interface ClubLeaderboard {
  items: Array<{
    rank: number | null;
    playerId: number;
    name: string;
    rating: RatingSnapshot;
    lastPlayedDate?: string | null;
  }>;
  nextCursor: string | null;
  hasMore: boolean;
}

export interface ClubListItem {
  id: number;
  name: string;
}

export interface ClubMemberSearchResult {
  playerId: number;
  name: string;
  rating: number | null;
  rank: number | null;
}

export interface ClubListItem {
  id: number;
  name: string;
}

export interface ClubMemberSearchResult {
  playerId: number;
  name: string;
  rating: number | null;
  rank: number | null;
}
