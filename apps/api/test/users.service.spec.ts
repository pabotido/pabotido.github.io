import { ForbiddenException } from '@nestjs/common';
import { UsersService } from '../src/users/users.service';

describe('UsersService authorization', () => {
  it('does not allow a user to read another user without users.read', async () => {
    const prisma = { user: { findUnique: jest.fn() } };
    const service = new UsersService(prisma as never, {} as never);
    await expect(service.get('other-user', { id: 'self', email: 'self@example.com', status: 'ACTIVE', permissions: [] })).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });
});
