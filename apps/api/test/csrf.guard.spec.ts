import { ForbiddenException } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { CSRF_COOKIE } from '../src/auth/auth.constants';
import { CsrfGuard } from '../src/auth/csrf.guard';
import { UsersController } from '../src/users/users.controller';
import { OrganizationController } from '../src/organization/organization.controller';
import { SessionGuard } from '../src/auth/session.guard';
import { PermissionsGuard } from '../src/auth/permissions.guard';

describe('CsrfGuard', () => {
  const guard = new CsrfGuard();
  const makeContext = (method: string, cookie?: string, header?: string) => ({
    switchToHttp: () => ({
      getRequest: () => ({
        method,
        cookies: cookie ? { [CSRF_COOKIE]: cookie } : {},
        header: () => header,
      }),
    }),
  }) as never;

  it('allows safe methods without a CSRF token', () => {
    expect(guard.canActivate(makeContext('GET'))).toBe(true);
  });

  it('rejects unsafe methods without matching cookie and header tokens', () => {
    expect(() => guard.canActivate(makeContext('POST'))).toThrow(ForbiddenException);
    expect(() => guard.canActivate(makeContext('PATCH', 'cookie-token', 'different'))).toThrow(ForbiddenException);
  });

  it('allows unsafe methods with matching cookie and header tokens', () => {
    expect(guard.canActivate(makeContext('PATCH', 'csrf-token', 'csrf-token'))).toBe(true);
  });

  it('is attached to authenticated mutation controllers', () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, UsersController)).toEqual([SessionGuard, CsrfGuard, PermissionsGuard]);
    expect(Reflect.getMetadata(GUARDS_METADATA, OrganizationController)).toEqual([SessionGuard, CsrfGuard, PermissionsGuard]);
  });
});
