import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService, private readonly redis: RedisService) {}

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
  @ApiOperation({ summary: 'Kiểm tra PostgreSQL và Redis sẵn sàng phục vụ' })
  async getReady(): Promise<{ status: 'ok' }> {
    try {
      await Promise.all([this.prisma.$queryRaw`SELECT 1`, this.redis.ping()]);
      return { status: 'ok' };
    } catch {
      throw new ServiceUnavailableException('API dependencies are unavailable');
    }
  }
}
