import { RedisService } from '../src/redis/redis.service';

describe('RedisService', () => {
  it('increments a fixed window atomically and returns its count and remaining time', async () => {
    const client = { isReady: true, eval: jest.fn().mockResolvedValue([3, 842]) };
    const service = new RedisService(client as never);

    await expect(service.incrementWindow('rate:login:ip-hash', 900)).resolves.toEqual({ count: 3, ttlSeconds: 842 });
    expect(client.eval).toHaveBeenCalledWith(expect.stringContaining("redis.call('INCR', KEYS[1])"), {
      keys: ['rate:login:ip-hash'],
      arguments: ['900'],
    });
  });

  it('rejects malformed results from Redis', async () => {
    const service = new RedisService({ isReady: true, eval: jest.fn().mockResolvedValue('bad-result') } as never);
    await expect(service.incrementWindow('rate:login:ip-hash', 900)).rejects.toThrow('Redis returned an invalid rate-limit result');
  });

  it('does not queue security-sensitive commands while Redis is disconnected', async () => {
    const client = { isReady: false, eval: jest.fn() };
    const service = new RedisService(client as never);

    await expect(service.incrementWindow('rate:login:ip-hash', 900)).rejects.toThrow('Redis client is not ready');
    expect(client.eval).not.toHaveBeenCalled();
  });
});
