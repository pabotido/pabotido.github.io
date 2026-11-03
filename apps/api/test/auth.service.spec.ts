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

  it('rejects inactive users and bad credentials', async () => {
    const passwordHash = await hashPassword('secret');
    const prisma = { user: { findUnique: jest.fn().mockResolvedValue({ status: 'SUSPENDED', passwordHash }) } };
    const service = new AuthService(prisma as never);
    await expect(service.login('user@example.com', 'secret')).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
