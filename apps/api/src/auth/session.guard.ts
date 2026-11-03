import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies?.portal_session as string | undefined;
    const session = await this.authService.resolveSession(token);
    if (!session) throw new UnauthorizedException('Phiên đăng nhập không hợp lệ hoặc đã hết hạn');
    request.user = session.user;
    request.sessionId = session.sessionId;
    return true;
  }
}
