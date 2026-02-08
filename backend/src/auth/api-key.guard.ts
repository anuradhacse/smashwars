import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { IS_PUBLIC_KEY } from './public.decorator.js';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    // Allow CORS preflight through without auth
    if (request.method === 'OPTIONS') {
      return true;
    }
    const apiKey = request.headers['x-api-key'];
    const expected = process.env.API_KEY;

    if (!expected) {
      return false;
    }

    return apiKey === expected;
  }
}
