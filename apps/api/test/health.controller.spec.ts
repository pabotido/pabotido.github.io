import { Test } from '@nestjs/testing';
import { HealthController } from '../src/health/health.controller';
import { PrismaService } from '../src/prisma/prisma.service';
import { RedisService } from '../src/redis/redis.service';
import { ServiceUnavailableException } from '@nestjs/common';

describe('HealthController', () => {
  const prisma = { $queryRaw: jest.fn() };
  const redis = { ping: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
    redis.ping.mockResolvedValue('PONG');
  });

  it('returns a healthy API response', async () => {
    const module = await Test.createTestingModule({
      providers: [HealthController, { provide: PrismaService, useValue: prisma }, { provide: RedisService, useValue: redis }],
    }).compile();
    const controller = module.get(HealthController);
    const result = controller.getHealth();
    expect(result.data.status).toBe('ok');
    expect(result.data.service).toBe('portal-api');
  });

  it('reports readiness only when PostgreSQL and Redis respond', async () => {
    const module = await Test.createTestingModule({
      providers: [HealthController, { provide: PrismaService, useValue: prisma }, { provide: RedisService, useValue: redis }],
    }).compile();
    const controller = module.get(HealthController);

    await expect(controller.getReady()).resolves.toEqual({ status: 'ok' });
    expect(prisma.$queryRaw).toHaveBeenCalled();
    expect(redis.ping).toHaveBeenCalled();
  });

  it('fails readiness without exposing dependency errors', async () => {
    prisma.$queryRaw.mockRejectedValueOnce(new Error('sensitive database connection detail'));
    const module = await Test.createTestingModule({
      providers: [HealthController, { provide: PrismaService, useValue: prisma }, { provide: RedisService, useValue: redis }],
    }).compile();
    const controller = module.get(HealthController);

    await expect(controller.getReady()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
