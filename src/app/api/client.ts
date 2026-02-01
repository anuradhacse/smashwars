import type {
  ClubLeaderboard,
  EventDetailsForPlayer,
  PlayerHistory,
  PlayerOverview,
} from './types';
import { mockApi } from './mockClient';

const USE_MOCK = true;
const API_BASE_URL = '/v1';

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export const api = {
  async getPlayerOverview(playerId: number): Promise<PlayerOverview> {
    if (USE_MOCK) {
      return Promise.resolve(mockApi.getPlayerOverview(playerId));
    }
    return getJson<PlayerOverview>(`${API_BASE_URL}/players/${playerId}/overview`);
  },

  async getPlayerHistory(playerId: number, range: PlayerHistory['range']): Promise<PlayerHistory> {
    if (USE_MOCK) {
      return Promise.resolve(mockApi.getPlayerHistory(playerId, range));
    }
    return getJson<PlayerHistory>(`${API_BASE_URL}/players/${playerId}/history?range=${range}`);
  },

  async getEventDetailsForPlayer(
    eventId: number,
    playerId: number,
  ): Promise<EventDetailsForPlayer> {
    if (USE_MOCK) {
      return Promise.resolve(mockApi.getEventDetailsForPlayer(eventId, playerId));
    }
    return getJson<EventDetailsForPlayer>(
      `${API_BASE_URL}/events/${eventId}/player/${playerId}`,
    );
  },

  async getClubLeaderboard(
    clubId: number,
    scope: ClubLeaderboard['scope'],
  ): Promise<ClubLeaderboard> {
    if (USE_MOCK) {
      return Promise.resolve(mockApi.getClubLeaderboard(clubId, scope));
    }
    return getJson<ClubLeaderboard>(`${API_BASE_URL}/clubs/${clubId}/leaderboard?scope=${scope}`);
  },
};
