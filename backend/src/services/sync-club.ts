import { prisma } from '../db/prisma.js';
import { fetchClubRoster } from '../scrapers/clubRoster.js';
import { syncPlayer } from './sync-player.js';

export type SyncClubOptions = {
  clubName?: string;
  syncPlayers?: boolean;
  monthsBack?: number;
  useRosterCache?: boolean;
};

export const syncClub = async (
  clubId: number,
  options: SyncClubOptions = {}
): Promise<void> => {
  const clubName = options.clubName ?? 'Club';
  const syncPlayers = options.syncPlayers !== false;
  const monthsBack = options.monthsBack ?? 12;
  const useRosterCache = options.useRosterCache === true;
  let roster = [];

  if (useRosterCache) {
    console.log(`[sync-club] Loading roster from DB for club ${clubId}...`);
    const members = await prisma.clubMember.findMany({
      where: { clubId },
    });
    roster = members.map((member) => ({
      playerId: member.playerId,
      rank: member.rank ?? undefined,
      displayName: member.displayName,
      ratingMean: member.ratingMean ?? undefined,
      ratingStDev: member.ratingStDev ?? undefined,
      lastPlayedDate: member.lastPlayedDate ?? undefined,
    }));
    console.log(
      `[sync-club] Roster loaded from DB: ${roster.length} players for club ${clubId}`
    );
  } else {
    console.log(`[sync-club] Fetching roster for club ${clubId}...`);
    roster = await fetchClubRoster(clubId, clubName);
    console.log(
      `[sync-club] Roster fetched: ${roster.length} players for club ${clubId}`
    );
  }

  if (roster.length === 0) {
    throw new Error('Club roster is empty.');
  }

  if (!useRosterCache) {
    await prisma.club.upsert({
      where: { id: clubId },
      update: {
        name: clubName,
        lastSyncedAt: new Date(),
        syncStatus: 'in_progress',
        syncError: null,
      },
      create: {
        id: clubId,
        name: clubName,
        lastSyncedAt: new Date(),
        syncStatus: 'in_progress',
      },
    });
  }

  if (!useRosterCache) {
    for (const member of roster) {
      await prisma.player.upsert({
        where: { id: member.playerId },
        update: {
          displayName: member.displayName,
        },
        create: {
          id: member.playerId,
          displayName: member.displayName,
        },
      });

      await prisma.clubMember.upsert({
        where: {
          clubId_playerId: {
            clubId,
            playerId: member.playerId,
          },
        },
        update: {
          rank: member.rank ?? null,
          ratingMean: member.ratingMean ?? null,
          ratingStDev: member.ratingStDev ?? null,
          lastPlayedDate: member.lastPlayedDate ?? null,
          displayName: member.displayName,
        },
        create: {
          clubId,
          playerId: member.playerId,
          rank: member.rank ?? null,
          ratingMean: member.ratingMean ?? null,
          ratingStDev: member.ratingStDev ?? null,
          lastPlayedDate: member.lastPlayedDate ?? null,
          displayName: member.displayName,
        },
      });
    }
  }

  if (syncPlayers) {
    console.log(`[sync-club] Syncing player histories for club ${clubId}...`);
    let completed = 0;
    for (const member of roster) {
      try {
        await syncPlayer(member.playerId, { monthsBack });
      } catch (error) {
        console.warn(
          `[sync-club] Player ${member.playerId} sync failed:`,
          error
        );
      }
      completed += 1;
      if (completed % 10 === 0 || completed === roster.length) {
        console.log(
          `[sync-club] Progress: ${completed}/${roster.length} players synced`
        );
      }
    }
  }

  if (!useRosterCache) {
    await prisma.club.update({
      where: { id: clubId },
      data: {
        lastSyncedAt: new Date(),
        syncStatus: 'ok',
        syncError: null,
      },
    });
  }
  console.log(`[sync-club] Club ${clubId} sync done.`);
};
