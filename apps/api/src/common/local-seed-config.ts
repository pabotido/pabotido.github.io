export type LocalSeedConfig = {
  nodeEnv: string | undefined;
  databaseUrl: string | undefined;
  adminEmail: string | undefined;
  adminPassword: string | undefined;
};

export function validateLocalSeedConfig(config: LocalSeedConfig): { adminEmail: string; adminPassword: string } {
  if (config.nodeEnv !== 'development' && config.nodeEnv !== 'test') throw new Error('Seed chỉ được chạy ở local/test');
  let databaseUrl: URL;
  try {
    databaseUrl = new URL(config.databaseUrl ?? '');
  } catch {
    throw new Error('DATABASE_URL phải trỏ tới PostgreSQL local để chạy seed');
  }
  if (databaseUrl.protocol !== 'postgresql:' || !['localhost', '127.0.0.1', '[::1]', '::1'].includes(databaseUrl.hostname)) {
    throw new Error('Seed chỉ được chạy với PostgreSQL local');
  }
  const adminEmail = config.adminEmail?.trim().toLowerCase();
  if (!adminEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail) || !config.adminPassword || config.adminPassword.length < 12 || config.adminPassword.length > 128) {
    throw new Error('LOCAL_ADMIN_EMAIL hợp lệ và LOCAL_ADMIN_PASSWORD từ 12 đến 128 ký tự là bắt buộc');
  }
  return { adminEmail, adminPassword: config.adminPassword };
}
