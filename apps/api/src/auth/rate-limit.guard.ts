import { createHash } from 'node:crypto';
import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import { RedisService } from '../redis/redis.service';
import { RATE_LIMIT_OPTIONS, type RateLimitOptions } from './rate-limit.decorator';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly redis: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.getAllAndOverride<RateLimitOptions>(RATE_LIMIT_OPTIONS, [context.getHandler(), context.getClass()]);
    if (!options) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const source = request.ip ?? request.socket.remoteAddress ?? 'unknown';
    const addressHash = createHash('sha256').update(source).digest('hex');
    let result: { count: number; ttlSeconds: number };
    try {
      result = await this.redis.incrementWindow(`rate:${options.name}:${addressHash}`, options.windowSeconds);
    } catch {
      throw new ServiceUnavailableException('Không thể kiểm tra giới hạn truy cập. Vui lòng thử lại sau.');
    }

    if (result.count > options.limit) {
      const retryAfter = Math.max(1, result.ttlSeconds);
      response.setHeader('Retry-After', retryAfter);
      throw new HttpException('Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.', HttpStatus.TOO_MANY_REQUESTS);
    }
    return true;
  }
}
