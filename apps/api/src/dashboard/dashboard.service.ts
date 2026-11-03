import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(userId: string) {
    const [user, activeEmployees, departments, recentActivity] = await this.prisma.$transaction([
      this.prisma.user.findUnique({ where: { id: userId }, select: { profile: { select: { displayName: true, avatarUrl: true } } } }),
      this.prisma.employee.count({ where: { status: 'ACTIVE' } }),
      this.prisma.department.count(),
      this.prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: { id: true, action: true, resource: true, resourceId: true, createdAt: true, actor: { select: { profile: { select: { displayName: true, avatarUrl: true } } } } },
      }),
    ]);

    return {
      user: user?.profile ?? { displayName: null, avatarUrl: null },
      stats: { activeEmployees, departments },
      recentActivity,
      unavailableModules: ['notifications', 'approvals', 'documents', 'tasks', 'calendar'],
    };
  }
}
