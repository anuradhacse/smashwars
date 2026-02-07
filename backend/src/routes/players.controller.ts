import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';

import { PlayersService } from '../services/players.service.js';
import { parseRange } from '../utils/api/range.js';

@Controller('v1/players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get(':playerId/overview')
  async getOverview(
    @Param('playerId') playerId: string,
    @Query('range') range?: string
  ) {
    const result = await this.playersService.getOverview(
      Number(playerId),
      parseRange(range)
    );

    if (!result) {
      throw new NotFoundException(
        'Player not found. Sync this player to load data.'
      );
    }

    return result;
  }

  @Get(':playerId/history')
  async getHistory(
    @Param('playerId') playerId: string,
    @Query('range') range?: string,
    @Query('limit') limit = '50',
    @Query('cursor') cursor?: string
  ) {
    const safeLimit = Math.min(Number(limit) || 50, 200);
    return this.playersService.getHistory(
      Number(playerId),
      parseRange(range),
      safeLimit,
      cursor
    );
  }
}
