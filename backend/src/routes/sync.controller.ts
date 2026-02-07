import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';

import { prisma } from '../db/prisma.js';
import { syncClub } from '../services/sync-club.js';
import { syncEventForPlayer } from '../services/sync-event.js';
import { syncPlayer } from '../services/sync-player.js';

type SyncBody = {
  monthsBack?: number;
  confirmExtendedRange?: boolean;
};

type ClubSyncBody = SyncBody & {
  clubName?: string;
  syncPlayers?: boolean;
};

@Controller('v1/sync')
export class SyncController {
  @Post('player/:playerId')
  async syncPlayer(@Param('playerId') playerId: string, @Body() body: SyncBody) {
    const monthsBack = body?.monthsBack ?? 12;
    if (monthsBack > 12 && !body?.confirmExtendedRange) {
      throw new BadRequestException(
        'Extended range requested. Set confirmExtendedRange=true to proceed.'
      );
    }
    await syncPlayer(Number(playerId), { monthsBack });
    return { status: 'done', message: 'Player sync complete.' };
  }

  @Post('club/:clubId')
  async syncClub(@Param('clubId') clubId: string, @Body() body: ClubSyncBody) {
    const monthsBack = body?.monthsBack ?? 12;
    if (monthsBack > 12 && !body?.confirmExtendedRange) {
      throw new BadRequestException(
        'Extended range requested. Set confirmExtendedRange=true to proceed.'
      );
    }
    await syncClub(Number(clubId), {
      monthsBack,
      clubName: body?.clubName,
      syncPlayers: body?.syncPlayers ?? false,
      useRosterCache: false,
    });
    return { status: 'done', message: 'Club sync complete.' };
  }

  @Post('event/:eventId/player/:playerId')
  async syncEvent(
    @Param('eventId') eventId: string,
    @Param('playerId') playerId: string
  ) {
    await syncEventForPlayer(Number(eventId), Number(playerId));
    return { status: 'done', message: 'Event sync complete.' };
  }

  @Get('status')
  async syncStatus(
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string
  ) {
    if (!entityType || !entityId) {
      return { status: 'error', message: 'entityType and entityId required.' };
    }

    const id = Number(entityId);

    if (entityType === 'player') {
      const player = await prisma.player.findUnique({ where: { id } });
      return player
        ? {
            status: player.syncStatus,
            lastSyncedAt: player.lastSyncedAt?.toISOString() ?? null,
            error: player.syncError ?? null,
          }
        : { status: 'missing' };
    }

    if (entityType === 'club') {
      const club = await prisma.club.findUnique({ where: { id } });
      return club
        ? {
            status: club.syncStatus,
            lastSyncedAt: club.lastSyncedAt?.toISOString() ?? null,
            error: club.syncError ?? null,
          }
        : { status: 'missing' };
    }

    if (entityType === 'event') {
      const summary = await prisma.eventSummary.findFirst({
        where: { eventId: id },
      });
      const match = await prisma.eventMatch.findFirst({
        where: { eventId: id },
      });
      return summary || match ? { status: 'ok' } : { status: 'missing' };
    }

    return { status: 'error', message: 'Unknown entityType.' };
  }
}
