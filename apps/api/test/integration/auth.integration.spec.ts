import { randomUUID } from 'node:crypto';
import { HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { createClient, type RedisClientType } from 'redis';
import { AuthService } from '../../src/auth/auth.service';
import { hashPassword } from '../../src/auth/crypto';
import { PrismaService } from '../../src/prisma/prisma.service';
import { RedisService } from '../../src/redis/redis.service';

describe('AuthService PostgreSQL/Redis integration', () => {
  const databaseUrl = process.env.DATABASE_URL;
  const redisUrl = process.env.REDIS_URL;
  const authSecret = process.env.AUTH_SECRET;
  if (!databaseUrl || !redisUrl || !authSecret || authSecret.length < 32) {
    throw new Error('Integration tests require DATABASE_URL, REDIS_URL, and AUTH_SECRET (at least 32 characters)');
  }

  const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
  const redisClient = createClient({ url: redisUrl });
  const auth = new AuthService(prisma as PrismaService, new RedisService(redisClient as unknown as RedisClientType), new ConfigService({ AUTH_SECRET: authSecret }));
  const password = 'CurrentPassword123!';
  let email: string;

  beforeAll(async () => {
    redisClient.on('error', () => undefined);
    await Promise.all([prisma.$connect(), redisClient.connect()]);
  });

  beforeEach(async () => {
    email = `auth-integration-${randomUUID()}@example.test`;
    await prisma.user.create({ data: { email, passwordHash: await hashPassword(password) } });
  });

  afterEach(async () => {
    await prisma.user.deleteMany({ where: { email } });
  });

  afterAll(async () => {
    await Promise.all([prisma.$disconnect(), redisClient.isOpen ? redisClient.close() : Promise.resolve()]);
  });

  it('creates, resolves and revokes a database-backed session', async () => {
    const login = await auth.login(email, password);
    const session = await auth.resolveSession(login.token);

    expect(session?.user.email).toBe(email);
    await auth.revokeSession(session!.sessionId);
    await expect(auth.resolveSession(login.token)).resolves.toBeNull();
  });

  it('consumes a password-reset token once and revokes existing sessions', async () => {
    const login = await auth.login(email, password);
    const token = await auth.requestPasswordReset(email);
    expect(token).toEqual(expect.any(String));

    await auth.resetPassword(token!, 'ReplacementPassword123!');
    await expect(auth.resolveSession(login.token)).resolves.toBeNull();
    await expect(auth.resetPassword(token!, 'AnotherPassword123!')).rejects.toBeInstanceOf(HttpException);
    await expect(auth.login(email, 'ReplacementPassword123!')).resolves.toHaveProperty('user.email', email);
  });

  it('blocks after five failed password attempts using shared Redis state', async () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await expect(auth.login(email, 'wrong-password')).rejects.toMatchObject({ status: 401 });
    }

    await expect(auth.login(email, password)).rejects.toMatchObject({ status: 429 });
  });
});
