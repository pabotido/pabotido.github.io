import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import type { AuthRequest } from './auth.types';
import { createToken } from './crypto';
import { AUTH_COOKIE_OPTIONS, CSRF_COOKIE, SESSION_COOKIE } from './auth.constants';
import { AuthService } from './auth.service';
import { CsrfGuard } from './csrf.guard';
import { LoginDto } from './dto/login.dto';
import { RequirePermissions } from './permissions.decorator';
import { PermissionsGuard } from './permissions.guard';
import { SessionGuard } from './session.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập bằng email và mật khẩu' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.login(dto.email, dto.password);
    response.cookie(SESSION_COOKIE, result.token, AUTH_COOKIE_OPTIONS);
    response.cookie(CSRF_COOKIE, createToken(24), { httpOnly: false, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' });
    return { data: { user: result.user }, meta: { requestId: 'auth-login' } };
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
