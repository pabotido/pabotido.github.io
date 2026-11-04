import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../apps/api/src/auth/crypto';
import { validateLocalSeedConfig } from '../apps/api/src/common/local-seed-config';

export async function seedLocal(prisma: PrismaClient, config: LocalSeedConfig): Promise<void> {
  const { adminEmail, adminPassword } = validateLocalSeedConfig(config);
  const permissions = ['health.read', 'users.read', 'users.create', 'users.update', 'employees.read', 'employees.create', 'employees.update', 'departments.read', 'departments.manage', 'roles.manage', 'audit.read'];
  for (const key of permissions) await prisma.permission.upsert({ where: { key }, update: {}, create: { key, name: key } });

  const adminRole = await prisma.role.upsert({ where: { key: 'super_admin' }, update: {}, create: { key: 'super_admin', name: 'Super Admin' } });
  const permissionRows = await prisma.permission.findMany({ where: { key: { in: permissions } } });
  for (const permission of permissionRows) {
    await prisma.rolePermission.upsert({ where: { roleId_permissionId: { roleId: adminRole.id, permissionId: permission.id } }, update: {}, create: { roleId: adminRole.id, permissionId: permission.id } });
  }

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      status: 'ACTIVE',
      passwordHash: await hashPassword(adminPassword),
      profile: { create: { displayName: 'Local Administrator' } },
    },
  });
  await prisma.userProfile.upsert({ where: { userId: admin.id }, update: {}, create: { userId: admin.id, displayName: 'Local Administrator' } });
  await prisma.userRole.upsert({ where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } }, update: {}, create: { userId: admin.id, roleId: adminRole.id } });
  console.log('Local seed complete. Change the local administrator password before sharing this environment.');
}

async function main(): Promise<void> {
  const prisma = new PrismaClient();
  try {
    await seedLocal(prisma, {
      nodeEnv: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL,
      adminEmail: process.env.LOCAL_ADMIN_EMAIL,
      adminPassword: process.env.LOCAL_ADMIN_PASSWORD,
    });
  } finally {
    await prisma.$disconnect();
  }
}

void main();
