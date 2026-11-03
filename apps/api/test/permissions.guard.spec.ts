import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from '../src/auth/permissions.guard';
import { REQUIRED_PERMISSIONS } from '../src/auth/permissions.decorator';

describe('PermissionsGuard', () => {
  const reflector = { getAllAndOverride: jest.fn() } as unknown as Reflector;
  const guard = new PermissionsGuard(reflector);
  const handler = {};
  const classRef = {};

  it('allows a user with every required permission', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['users.read', 'users.update']);
    const context = { getHandler: () => handler, getClass: () => classRef, switchToHttp: () => ({ getRequest: () => ({ user: { permissions: ['users.read', 'users.update'] } }) }) } as never;
    expect(guard.canActivate(context)).toBe(true);
  });

  it('denies a user missing a required permission', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['users.manage']);
    const context = { getHandler: () => handler, getClass: () => classRef, switchToHttp: () => ({ getRequest: () => ({ user: { permissions: [] } }) }) } as never;
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(reflector.getAllAndOverride).toHaveBeenLastCalledWith(REQUIRED_PERMISSIONS, [handler, classRef]);
  });
});
