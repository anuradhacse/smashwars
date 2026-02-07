import { Controller, Get, NotFoundException, Param } from '@nestjs/common';

import { InsightsService } from '../services/insights.service.js';

@Controller('v1/events')
export class EventsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get(':eventId/player/:playerId')
  async getEventForPlayer(
    @Param('eventId') eventId: string,
    @Param('playerId') playerId: string
  ) {
    const result = await this.insightsService.getEventDetailsForPlayer(
      Number(eventId),
      Number(playerId)
    );

    if (!result) {
      throw new NotFoundException('Event not found.');
    }

    return result;
  }
}
