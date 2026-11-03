export const SESSION_COOKIE = 'portal_session';
export const CSRF_COOKIE = 'portal_csrf';
export const CSRF_HEADER = 'x-csrf-token';
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const AUTH_COOKIE_OPTIONS = { httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: SESSION_TTL_MS };
