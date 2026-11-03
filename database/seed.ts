import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === 'production') throw new Error('Seed chỉ được chạy ở local/test');
  const permissions = ['health.read', 'users.read', 'users.create', 'roles.manage', 'audit.read'];
  for (const key of permissions) await prisma.permission.upsert({ where: { key }, update: {}, create: { key, name: key } });
  const adminRole = await prisma.role.upsert({ where: { key: 'super_admin' }, update: {}, create: { key: 'super_admin', name: 'Super Admin' } });
  const permissionRows = await prisma.permission.findMany({ where: { key: { in: permissions } } });
  for (const permission of permissionRows) await prisma.rolePermission.upsert({ where: { roleId_permissionId: { roleId: adminRole.id, permissionId: permission.id } }, update: {}, create: { roleId: adminRole.id, permissionId: permission.id } });
  console.log('Local seed complete. Create an admin password through the local setup flow before sharing the environment.');
}

main().finally(() => prisma.$disconnect());
