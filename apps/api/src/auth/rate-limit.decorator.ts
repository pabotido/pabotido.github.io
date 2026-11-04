import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_OPTIONS = 'rate-limit-options';

export type RateLimitOptions = {
  name: string;
  limit: number;
  windowSeconds: number;
};

export const RateLimit = (options: RateLimitOptions) => SetMetadata(RATE_LIMIT_OPTIONS, options);
