import { Global, Inject, Injectable, Logger, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient } from 'redis';
import { REDIS_CLIENT } from './redis.constants';
import { RedisService } from './redis.service';

@Injectable()
class RedisClientLifecycle implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisClientLifecycle.name);

  constructor(@Inject(REDIS_CLIENT) private readonly client: ReturnType<typeof createClient>) {}

  async onModuleInit(): Promise<void> {
    this.client.on('error', () => this.logger.error('Redis client connection error'));
    await this.client.connect();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client.isOpen) await this.client.close();
  }
}

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => createClient({ url: config.getOrThrow<string>('REDIS_URL') }),
    },
    RedisClientLifecycle,
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}
