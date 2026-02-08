import type {
  ClubLeaderboard,
  EventDetailsForPlayer,
  PlayerHistory,
  PlayerOverview,
} from './types';
import { mockApi } from './mockClient';

const USE_MOCK = false;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/v1';
const API_KEY = import.meta.env.VITE_API_KEY ?? '';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: API_KEY ? { 'x-api-key': API_KEY } : undefined,
  });
  if (!res.ok) {
    throw new ApiError(`Request failed: ${res.status}`, res.status);
  }
  return (await res.json()) as T;
}

async function postJson<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw new ApiError(`Request failed: ${res.status}`, res.status);
  }
  return (await res.json()) as T;
}

async function putJson<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw new ApiError(`Request failed: ${res.status}`, res.status);
  }
  return (await res.json()) as T;
}

export const api = {
  async getPlayerOverview(
    playerId: number,
    range: '3m' | '6m' | '12m' | 'all',
  ): Promise<PlayerOverview> {
    if (USE_MOCK) {
      return Promise.resolve(mockApi.getPlayerOverview(playerId));
    }
    return getJson<PlayerOverview>(`${API_BASE_URL}/players/${playerId}/overview?range=${range}`);
  },

  async getPlayerHistory(
    playerId: number,
    range: '3m' | '6m' | '12m' | 'all',
    limit = 50,
    cursor?: string,
  ): Promise<PlayerHistory> {
    if (USE_MOCK) {
      return Promise.resolve(mockApi.getPlayerHistory(playerId, range));
    }
    const cursorParam = cursor ? `&cursor=${encodeURIComponent(cursor)}` : '';
    return getJson<PlayerHistory>(
      `${API_BASE_URL}/players/${playerId}/history?range=${range}&limit=${limit}${cursorParam}`,
    );
  },

  async getEventDetailsForPlayer(
    eventId: number,
    playerId: number,
  ): Promise<EventDetailsForPlayer> {
    if (USE_MOCK) {
      return Promise.resolve(mockApi.getEventDetailsForPlayer(eventId, playerId));
    }
    return getJson<EventDetailsForPlayer>(`${API_BASE_URL}/events/${eventId}/player/${playerId}`);
  },

  async getClubLeaderboard(clubId: number, limit = 50, cursor?: string): Promise<ClubLeaderboard> {
    if (USE_MOCK) {
      return Promise.resolve(mockApi.getClubLeaderboard(clubId, 'all'));
    }
    const cursorParam = cursor ? `&cursor=${encodeURIComponent(cursor)}` : '';
    return getJson<ClubLeaderboard>(
      `${API_BASE_URL}/clubs/${clubId}/leaderboard?limit=${limit}${cursorParam}`,
    );
  },

  async syncPlayer(playerId: number, monthsBack: number, confirmExtendedRange = false) {
    return postJson<{ status: string; message: string }>(
      `${API_BASE_URL}/sync/player/${playerId}`,
      { monthsBack, confirmExtendedRange },
    );
  },

  async syncClub(clubId: number, clubName?: string) {
    return postJson<{ status: string; message: string }>(`${API_BASE_URL}/sync/club/${clubId}`, {
      clubName,
      syncPlayers: false,
    });
  },

  async getAvatar(playerId: number): Promise<{ avatarUrl: string | null }> {
    return getJson<{ avatarUrl: string | null }>(`${API_BASE_URL}/players/${playerId}/avatar`);
  },

  async updateAvatar(playerId: number, avatarUrl: string): Promise<{ status: string }> {
    return putJson<{ status: string }>(`${API_BASE_URL}/players/${playerId}/avatar`, {
      avatarUrl,
    });
  },
};
