import { DashboardService } from '../src/dashboard/dashboard.service';

describe('DashboardService', () => {
  it('returns only values read from the dashboard queries', async () => {
    const prisma = {
      user: { findUnique: jest.fn().mockReturnValue('user-query') },
      employee: { count: jest.fn().mockReturnValue('employee-query') },
      department: { count: jest.fn().mockReturnValue('department-query') },
      auditLog: { findMany: jest.fn().mockReturnValue('audit-query') },
      $transaction: jest.fn().mockResolvedValue([
        { profile: { displayName: 'Admin', avatarUrl: null } },
        3,
        2,
        [],
      ]),
    };
    const service = new DashboardService(prisma as never);

    await expect(service.getDashboard('user-1')).resolves.toMatchObject({
      user: { displayName: 'Admin' },
      stats: { activeEmployees: 3, departments: 2 },
      recentActivity: [],
    });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });
});
