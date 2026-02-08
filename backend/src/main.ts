import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './modules/app.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true });
  app.useBodyParser('json', { limit: '500kb' });
  await app.listen(3001);
}

bootstrap();
