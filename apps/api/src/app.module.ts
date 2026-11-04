import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { OrganizationModule } from './organization/organization.module';
import { UsersModule } from './users/users.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { RedisModule } from './redis/redis.module';
import { resolveWebOrigin } from './common/cors-origin';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '.env'],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'test', 'staging', 'production').default('development'),
        PORT: Joi.number().port().default(4000),
        APP_URL: Joi.string().default('http://localhost:3000').custom((value, helpers) => {
          try {
            resolveWebOrigin(value);
            return value;
          } catch {
            return helpers.error('any.invalid');
          }
        }),
        API_PREFIX: Joi.string().default('api/v1'),
        AUTH_SECRET: Joi.string().min(32).required(),
        REDIS_URL: Joi.string().uri({ scheme: ['redis', 'rediss'] }).default('redis://localhost:6379'),
        TRUSTED_PROXY_CIDRS: Joi.string().allow('').default(''),
      }),
    }),
    RedisModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    DashboardModule,
    OrganizationModule,
    HealthModule,
  ],
})
export class AppModule {}
