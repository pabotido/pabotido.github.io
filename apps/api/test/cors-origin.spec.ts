import { resolveWebOrigin } from '../src/common/cors-origin';

describe('resolveWebOrigin', () => {
  it('returns the exact origin used for credentialed browser requests', () => {
    expect(resolveWebOrigin('https://portal.example.com')).toBe('https://portal.example.com');
  });

  it('rejects URLs containing a path, query, credentials, or a non-HTTP scheme', () => {
    for (const value of [
      'https://portal.example.com/app',
      'https://portal.example.com?next=/app',
      'https://user:password@portal.example.com',
      'file:///tmp/portal',
    ]) {
      expect(() => resolveWebOrigin(value)).toThrow('APP_URL must be an HTTP(S) origin without a path');
    }
  });
});
