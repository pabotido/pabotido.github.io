import { ServiceUnavailableException } from '@nestjs/common';
import { RateLimitGuard } from '../src/auth/rate-limit.guard';

describe('RateLimitGuard', () => {
  const createContext = () => {
    const response = { setHeader: jest.fn() };
    const request = { ip: '203.0.113.10', socket: { remoteAddress: '203.0.113.10' } };
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => request, getResponse: () => response }),
    };
    return { context: context as never, request, response };
  };

  it('allows a request within its Redis-backed limit', async () => {
    const options = { name: 'auth:login', limit: 10, windowSeconds: 900 };
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(options) };
    const redis = { incrementWindow: jest.fn().mockResolvedValue({ count: 10, ttlSeconds: 800 }) };
    const guard = new RateLimitGuard(reflector as never, redis as never);
    const { context, request } = createContext();

    await expect(guard.canActivate(context)).resolves.toBe(true);
    const key = redis.incrementWindow.mock.calls[0][0] as string;
    expect(key).toMatch(/^rate:auth:login:[a-f0-9]{64}$/);
    expect(key).not.toContain(request.ip);
    expect(redis.incrementWindow).toHaveBeenCalledWith(key, 900);
  });

  it('returns 429 with Retry-After after the limit is exceeded', async () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue({ name: 'auth:login', limit: 10, windowSeconds: 900 }) };
    const redis = { incrementWindow: jest.fn().mockResolvedValue({ count: 11, ttlSeconds: 123 }) };
    const guard = new RateLimitGuard(reflector as never, redis as never);
    const { context, response } = createContext();

    await expect(guard.canActivate(context)).rejects.toMatchObject({ status: 429 });
    expect(response.setHeader).toHaveBeenCalledWith('Retry-After', 123);
  });

  it('fails closed when Redis cannot enforce the limit', async () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue({ name: 'auth:login', limit: 10, windowSeconds: 900 }) };
    const redis = { incrementWindow: jest.fn().mockRejectedValue(new Error('connection failed')) };
    const guard = new RateLimitGuard(reflector as never, redis as never);

    await expect(guard.canActivate(createContext().context)).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
