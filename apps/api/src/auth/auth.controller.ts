import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import type { AuthRequest } from './auth.types';
import { createToken } from './crypto';
import { AUTH_COOKIE_OPTIONS, CSRF_COOKIE, SESSION_COOKIE } from './auth.constants';
import { AuthService } from './auth.service';
import { CsrfGuard } from './csrf.guard';
import { LoginDto, RequestPasswordResetDto, ResetPasswordDto } from './dto/login.dto';
import { RequirePermissions } from './permissions.decorator';
import { PermissionsGuard } from './permissions.guard';
import { SessionGuard } from './session.guard';
import { RateLimit } from './rate-limit.decorator';
import { RateLimitGuard } from './rate-limit.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @RateLimit({ name: 'auth:login', limit: 10, windowSeconds: 15 * 60 })
  @UseGuards(RateLimitGuard)
  @ApiOperation({ summary: 'Đăng nhập bằng email và mật khẩu' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.login(dto.email, dto.password);
    response.cookie(SESSION_COOKIE, result.token, AUTH_COOKIE_OPTIONS);
    response.cookie(CSRF_COOKIE, createToken(24), { httpOnly: false, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' });
    return { data: { user: result.user }, meta: { requestId: 'auth-login' } };
  }

  @Post('password-reset/request')
  @RateLimit({ name: 'auth:password-reset', limit: 5, windowSeconds: 15 * 60 })
  @UseGuards(RateLimitGuard)
  @ApiOperation({ summary: 'Yêu cầu đặt lại mật khẩu' })
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    const token = await this.authService.requestPasswordReset(dto.email);
    return { data: { accepted: true, ...(process.env.NODE_ENV !== 'production' && token ? { developmentToken: token } : {}) }, meta: { requestId: 'auth-password-reset-request' } };
  }

  @Post('password-reset/confirm')
  @ApiOperation({ summary: 'Đặt lại mật khẩu bằng token một lần' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.password);
    return { data: { reset: true }, meta: { requestId: 'auth-password-reset-confirm' } };
  }

  @Get('me')
  @ApiCookieAuth(SESSION_COOKIE)
  @UseGuards(SessionGuard)
  getCurrentUser(@Req() request: AuthRequest) {
    return { data: request.user, meta: { requestId: 'auth-me' } };
  }

  @Post('logout')
  @ApiCookieAuth(SESSION_COOKIE)
  @UseGuards(SessionGuard, CsrfGuard)
  async logout(@Req() request: AuthRequest, @Res({ passthrough: true }) response: Response) {
    await this.authService.revokeSession(request.sessionId!);
    response.clearCookie(SESSION_COOKIE, { ...AUTH_COOKIE_OPTIONS, maxAge: undefined });
    response.clearCookie(CSRF_COOKIE, { sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' });
    return { data: { loggedOut: true }, meta: { requestId: 'auth-logout' } };
  }

  @Get('permissions-check')
  @ApiCookieAuth(SESSION_COOKIE)
  @UseGuards(SessionGuard, PermissionsGuard)
  @RequirePermissions('roles.manage')
  permissionCheck() {
    return { data: { authorized: true }, meta: { requestId: 'auth-permissions-check' } };
  }
}
