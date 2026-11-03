import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from './auth.controller';
import { CsrfGuard } from './csrf.guard';
import { AuthService } from './auth.service';
import { PermissionsGuard } from './permissions.guard';
import { SessionGuard } from './session.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, SessionGuard, PermissionsGuard, CsrfGuard, { provide: APP_GUARD, useClass: PermissionsGuard }],
  exports: [AuthService, SessionGuard, PermissionsGuard, CsrfGuard],
})
export class AuthModule {}
