import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Kiểm tra API đang hoạt động' })
  getHealth(): { data: { status: 'ok'; service: string; timestamp: string }; meta: { requestId: string } } {
    return {
      data: { status: 'ok', service: 'portal-api', timestamp: new Date().toISOString() },
      meta: { requestId: 'health-check' },
    };
  }

  @Get('live')
  getLive(): { status: 'ok' } { return { status: 'ok' }; }

  @Get('ready')
  getReady(): { status: 'ok' } { return { status: 'ok' }; }
}
