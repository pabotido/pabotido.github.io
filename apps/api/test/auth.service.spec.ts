import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../src/auth/auth.service';
import { hashPassword, hashToken } from '../src/auth/crypto';

describe('AuthService', () => {
  const createRedis = (overrides: Record<string, unknown> = {}) => ({
    get: jest.fn().mockResolvedValue(null),
    incrementWindow: jest.fn().mockResolvedValue({ count: 1, ttlSeconds: 900 }),
    delete: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  });
  const createConfig = () => ({ getOrThrow: jest.fn().mockReturnValue('test-auth-secret-at-least-32-characters') });

  it('creates a session with only a token hash', async () => {
    const passwordHash = await hashPassword('secret-password');
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue({ id: 'user-1', email: 'USER@EXAMPLE.COM', passwordHash, status: 'ACTIVE', roles: [] }) },
      userSession: { create: jest.fn().mockResolvedValue({}) },
    };
    const redis = createRedis();
    const service = new AuthService(prisma as never, redis as never, createConfig() as never);

    const result = await service.login(' user@example.com ', 'secret-password');

    expect(result.user).toMatchObject({ id: 'user-1', email: 'USER@EXAMPLE.COM', permissions: [] });
    expect(prisma.userSession.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ userId: 'user-1', tokenHash: expect.any(String) }) }));
    const stored = prisma.userSession.create.mock.calls[0][0].data.tokenHash;
    expect(stored).toBe(hashToken(result.token));
    expect(stored).not.toBe(result.token);
    expect(redis.delete).toHaveBeenCalledWith(expect.stringMatching(/^auth:failed-login:[a-f0-9]{64}$/));
  });

  it('creates a reset token and consumes it by changing the password', async () => {
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue({ id: 'user-1', status: 'ACTIVE' }), update: jest.fn() },
      passwordResetToken: { deleteMany: jest.fn(), create: jest.fn(), findUnique: jest.fn().mockResolvedValue({ id: 'reset-1', userId: 'user-1', usedAt: null, expiresAt: new Date(Date.now() + 60_000) }), update: jest.fn() },
      userSession: { updateMany: jest.fn() },
      $transaction: jest.fn().mockResolvedValue([]),
    };
    const service = new AuthService(prisma as never, createRedis() as never, createConfig() as never);
    const token = await service.requestPasswordReset('user@example.com');
    expect(token).toEqual(expect.any(String));
    expect(prisma.passwordResetToken.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ userId: 'user-1', tokenHash: expect.any(String) }) }));
    await service.resetPassword(token!, 'a-new-secure-password');
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it('rejects inactive users and bad credentials', async () => {
    const passwordHash = await hashPassword('secret');
    const prisma = { user: { findUnique: jest.fn().mockResolvedValue({ status: 'SUSPENDED', passwordHash }) } };
    const redis = createRedis();
    const service = new AuthService(prisma as never, redis as never, createConfig() as never);
    await expect(service.login('user@example.com', 'secret')).rejects.toBeInstanceOf(UnauthorizedException);
    expect(redis.incrementWindow).toHaveBeenCalledWith(expect.stringMatching(/^auth:failed-login:[a-f0-9]{64}$/), 900);
    expect(redis.incrementWindow.mock.calls[0][0]).not.toContain('user@example.com');
  });

  it('locks the account after five failed login attempts', async () => {
    const prisma = { user: { findUnique: jest.fn() } };
    const redis = createRedis({ get: jest.fn().mockResolvedValue('5') });
    const service = new AuthService(prisma as never, redis as never, createConfig() as never);

    await expect(service.login('user@example.com', 'secret')).rejects.toMatchObject({ status: 429 });
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });
});
