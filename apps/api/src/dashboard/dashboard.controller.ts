import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthRequest } from '../auth/auth.types';
import { SessionGuard } from '../auth/session.guard';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@ApiCookieAuth('portal_session')
@UseGuards(SessionGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy dữ liệu dashboard theo người dùng hiện tại' })
  async getDashboard(@Req() request: AuthRequest) {
    return { data: await this.dashboard.getDashboard(request.user!.id), meta: { requestId: 'dashboard-get' } };
  }
}
