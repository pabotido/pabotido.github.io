import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { CsrfGuard } from './csrf.guard';
import { AuthService } from './auth.service';
import { PermissionsGuard } from './permissions.guard';
import { SessionGuard } from './session.guard';
import { RateLimitGuard } from './rate-limit.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, SessionGuard, PermissionsGuard, CsrfGuard, RateLimitGuard],
  exports: [AuthService, SessionGuard, PermissionsGuard, CsrfGuard],
})
export class AuthModule {}
