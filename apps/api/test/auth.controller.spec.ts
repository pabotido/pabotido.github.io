import type { Response } from 'express';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { CSRF_COOKIE, SESSION_COOKIE } from '../src/auth/auth.constants';

describe('AuthController', () => {
  it('returns the CSRF token to the allowed web origin and sets its double-submit cookie', async () => {
    const authService = {
      login: jest.fn().mockResolvedValue({ token: 'opaque-session', user: { id: 'user-1', email: 'person@example.com', status: 'ACTIVE', permissions: [] } }),
    } as unknown as AuthService;
    const setCookie = jest.fn();
    const response = { cookie: setCookie } as unknown as Response;
    const controller = new AuthController(authService);

    const result = await controller.login({ email: 'person@example.com', password: 'password' }, response);
    const csrfCookie = setCookie.mock.calls.find(([name]) => name === CSRF_COOKIE);

    expect(result.data.user.email).toBe('person@example.com');
    expect(result.data.csrfToken).toEqual(expect.any(String));
    expect(csrfCookie?.[1]).toBe(result.data.csrfToken);
    expect(setCookie).toHaveBeenCalledWith(SESSION_COOKIE, 'opaque-session', expect.any(Object));
  });
});
