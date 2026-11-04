import { Inject, Injectable } from '@nestjs/common';
import type { RedisClientType } from 'redis';
import { REDIS_CLIENT } from './redis.constants';

const INCREMENT_WINDOW_SCRIPT = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then
  redis.call('EXPIRE', KEYS[1], ARGV[1])
end
return { count, redis.call('TTL', KEYS[1]) }
`;

@Injectable()
export class RedisService {
  constructor(@Inject(REDIS_CLIENT) private readonly client: RedisClientType) {}

  async incrementWindow(key: string, windowSeconds: number): Promise<{ count: number; ttlSeconds: number }> {
    this.requireReady();
    const result = await this.client.eval(INCREMENT_WINDOW_SCRIPT, { keys: [key], arguments: [String(windowSeconds)] });
    if (!Array.isArray(result) || result.length !== 2) throw new Error('Redis returned an invalid rate-limit result');
    return { count: Number(result[0]), ttlSeconds: Number(result[1]) };
  }

  get(key: string): Promise<string | null> {
    this.requireReady();
    return this.client.get(key);
  }

  async delete(key: string): Promise<void> {
    this.requireReady();
    await this.client.del(key);
  }

  private requireReady(): void {
    if (!this.client.isReady) throw new Error('Redis client is not ready');
  }
}
