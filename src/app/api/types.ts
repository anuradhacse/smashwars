export type SyncStatus = 'ok' | 'stale' | 'in_progress' | 'failed';

export interface SyncInfo {
  status: SyncStatus;
  lastSyncedAt: string;
  errorMessage?: string;
}

export interface RatingSnapshot {
  mean: number;
  stdev: number;
}

export interface PlayerOverview {
  playerId: number;
  displayName: string;
  club?: { clubId: number; name: string; rank?: number };
  current: {
    mean: number;
    stdev: number;
    lastChange?: number;
    lastEvent?: { eventId: number; name: string; date: string };
  };
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
    lastPlayedDate?: string;
  };
  sync: SyncInfo;
}

export interface PlayerHistory {
  playerId: number;
  range: '3m' | '6m' | '1y' | 'all';
  events: Array<{
    eventId: number;
    eventDate: string;
    eventName: string;
    initial: RatingSnapshot;
    pointChange: number;
    final: RatingSnapshot;
  }>;
  sync: SyncInfo;
}

export interface EventDetailsForPlayer {
  event: { id: number; name: string; date: string };
  player: { playerId: number };
  summary: {
    initial: RatingSnapshot;
    final: RatingSnapshot;
    totalChange: number;
  };
  matches: Array<{
    result: 'W' | 'L';
    opponent: { playerId: number; name?: string | null };
    opponentRating: RatingSnapshot;
    delta: number;
    score: string;
  }>;
  sync: SyncInfo;
}

export interface ClubLeaderboard {
  clubId: number;
  name: string;
  scope: 'all' | 'primary';
  members: Array<{
    rank: number;
    playerId: number;
    name: string;
    rating: RatingSnapshot;
    lastPlayedDate?: string | null;
  }>;
  sync: SyncInfo;
}
