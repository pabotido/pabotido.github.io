import { createToken, hashPassword, hashToken, verifyPassword } from '../src/auth/crypto';

describe('auth crypto', () => {
  it('hashes and verifies passwords without storing plaintext', async () => {
    const encoded = await hashPassword('correct horse battery staple');
    expect(encoded).not.toContain('correct horse battery staple');
    expect(await verifyPassword('correct horse battery staple', encoded)).toBe(true);
    expect(await verifyPassword('wrong password', encoded)).toBe(false);
  });

  it('creates opaque tokens and deterministic token hashes', () => {
    const token = createToken();
    expect(token.length).toBeGreaterThan(20);
    expect(hashToken(token)).toHaveLength(64);
    expect(hashToken(token)).toBe(hashToken(token));
    expect(hashToken(token)).not.toBe(token);
  });
});
