import { createHash, randomBytes, scrypt as nodeScrypt, timingSafeEqual } from 'node:crypto';

type ScryptOptions = { N: number; r: number; p: number };
function scrypt(password: string, salt: string, keyLength: number, options: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => nodeScrypt(password, salt, keyLength, options, (error, derivedKey) => error ? reject(error) : resolve(derivedKey as Buffer)));
}
const KEY_LENGTH = 64;
const SCRYPT_OPTIONS = { N: 16384, r: 8, p: 1 };

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scrypt(password, salt, KEY_LENGTH, SCRYPT_OPTIONS)) as Buffer;
  return `scrypt$${SCRYPT_OPTIONS.N}$${SCRYPT_OPTIONS.r}$${SCRYPT_OPTIONS.p}$${salt}$${derivedKey.toString('hex')}`;
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const [algorithm, n, r, p, salt, expectedHex] = encoded.split('$');
  if (algorithm !== 'scrypt' || !n || !r || !p || !salt || !expectedHex) return false;
  const expected = Buffer.from(expectedHex, 'hex');
  const derivedKey = (await scrypt(password, salt, expected.length, { N: Number(n), r: Number(r), p: Number(p) })) as Buffer;
  return expected.length === derivedKey.length && timingSafeEqual(expected, derivedKey);
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function createToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}
