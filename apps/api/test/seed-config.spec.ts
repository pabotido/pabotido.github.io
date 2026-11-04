import { validateLocalSeedConfig } from '../src/common/local-seed-config';

describe('validateLocalSeedConfig', () => {
  it('normalizes the local administrator email in development', () => {
    expect(validateLocalSeedConfig({ nodeEnv: 'development', databaseUrl: 'postgresql://portal:local@localhost:5432/portal', adminEmail: ' ADMIN@COMPANY.LOCAL ', adminPassword: 'ChangeMe123!' })).toEqual({
      adminEmail: 'admin@company.local',
      adminPassword: 'ChangeMe123!',
    });
  });

  it.each(['production', 'staging', undefined])('rejects seed mode %s', (nodeEnv) => {
    expect(() => validateLocalSeedConfig({ nodeEnv, databaseUrl: 'postgresql://portal:local@localhost:5432/portal', adminEmail: 'admin@company.local', adminPassword: 'ChangeMe123!' })).toThrow('Seed chỉ được chạy ở local/test');
  });

  it('requires a valid email and a bounded password of at least 12 characters', () => {
    for (const [adminEmail, adminPassword] of [
      ['not-an-email', 'ChangeMe123!'],
      ['admin@company.local', 'short'],
      ['admin@company.local', 'x'.repeat(129)],
    ]) {
      expect(() => validateLocalSeedConfig({ nodeEnv: 'development', databaseUrl: 'postgresql://portal:local@localhost:5432/portal', adminEmail, adminPassword })).toThrow('LOCAL_ADMIN_EMAIL hợp lệ');
    }
  });

  it('refuses a non-local database host even in development mode', () => {
    expect(() => validateLocalSeedConfig({ nodeEnv: 'development', databaseUrl: 'postgresql://portal:password@db.example.com/portal', adminEmail: 'admin@company.local', adminPassword: 'ChangeMe123!' })).toThrow('Seed chỉ được chạy với PostgreSQL local');
    expect(() => validateLocalSeedConfig({ nodeEnv: 'development', databaseUrl: 'https://localhost/portal', adminEmail: 'admin@company.local', adminPassword: 'ChangeMe123!' })).toThrow('Seed chỉ được chạy với PostgreSQL local');
  });
});
