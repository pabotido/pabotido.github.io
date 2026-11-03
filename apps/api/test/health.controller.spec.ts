import { Test } from '@nestjs/testing';
import { HealthController } from '../src/health/health.controller';

describe('HealthController', () => {
  it('returns a healthy API response', async () => {
    const module = await Test.createTestingModule({ providers: [HealthController] }).compile();
    const controller = module.get(HealthController);
    const result = controller.getHealth();
    expect(result.data.status).toBe('ok');
    expect(result.data.service).toBe('portal-api');
  });
});
