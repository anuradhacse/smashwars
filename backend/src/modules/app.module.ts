import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { ApiKeyGuard } from '../auth/api-key.guard.js';
import { ClubsController } from '../routes/clubs.controller.js';
import { EventsController } from '../routes/events.controller.js';
import { HealthController } from '../routes/health.controller.js';
import { PlayersController } from '../routes/players.controller.js';
import { SyncController } from '../routes/sync.controller.js';
import { InsightsService } from '../services/insights.service.js';
import { PlayersService } from '../services/players.service.js';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60_000,
      limit: 60,
    }]),
  ],
  controllers: [
    HealthController,
    PlayersController,
    EventsController,
    ClubsController,
    SyncController,
  ],
  providers: [
    PlayersService,
    InsightsService,
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
