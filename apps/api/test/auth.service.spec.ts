import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../src/auth/auth.service';
import { hashPassword, hashToken } from '../src/auth/crypto';

describe('AuthService', () => {
  it('creates a session with only a token hash', async () => {
    const passwordHash = await hashPassword('secret-password');
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue({ id: 'user-1', email: 'USER@EXAMPLE.COM', passwordHash, status: 'ACTIVE', roles: [] }) },
      userSession: { create: jest.fn().mockResolvedValue({}) },
    };
    const service = new AuthService(prisma as never);

    const result = await service.login(' user@example.com ', 'secret-password');

    expect(result.user).toMatchObject({ id: 'user-1', email: 'USER@EXAMPLE.COM', permissions: [] });
    expect(prisma.userSession.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ userId: 'user-1', tokenHash: expect.any(String) }) }));
    const stored = prisma.userSession.create.mock.calls[0][0].data.tokenHash;
    expect(stored).toBe(hashToken(result.token));
    expect(stored).not.toBe(result.token);
  });

  it('creates a reset token and consumes it by changing the password', async () => {
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue({ id: 'user-1', status: 'ACTIVE' }), update: jest.fn() },
      passwordResetToken: { deleteMany: jest.fn(), create: jest.fn(), findUnique: jest.fn().mockResolvedValue({ id: 'reset-1', userId: 'user-1', usedAt: null, expiresAt: new Date(Date.now() + 60_000) }), update: jest.fn() },
      userSession: { updateMany: jest.fn() },
      $transaction: jest.fn().mockResolvedValue([]),
    };
    const service = new AuthService(prisma as never);
    const token = await service.requestPasswordReset('user@example.com');
    expect(token).toEqual(expect.any(String));
    expect(prisma.passwordResetToken.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ userId: 'user-1', tokenHash: expect.any(String) }) }));
    await service.resetPassword(token!, 'a-new-secure-password');
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it('rejects inactive users and bad credentials', async () => {
    const passwordHash = await hashPassword('secret');
    const prisma = { user: { findUnique: jest.fn().mockResolvedValue({ status: 'SUSPENDED', passwordHash }) } };
    const service = new AuthService(prisma as never);
    await expect(service.login('user@example.com', 'secret')).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
