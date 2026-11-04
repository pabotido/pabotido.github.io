import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';

describe('API application bootstrap integration', () => {
  it('initializes and closes all modules with PostgreSQL and Redis configured', async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    const app = module.createNestApplication();
    await app.init();
    expect(app.getHttpServer()).toBeDefined();
    await app.close();
  });
});
