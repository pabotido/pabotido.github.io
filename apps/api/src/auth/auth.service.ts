import { createHmac } from 'node:crypto';
import { HttpException, HttpStatus, Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { createToken, hashPassword, hashToken, verifyPassword } from './crypto';
import { RESET_TOKEN_TTL_MS, SESSION_TTL_MS } from './auth.constants';
import type { AuthenticatedUser } from './auth.types';

@Injectable()
export class AuthService {
  private readonly failedLoginLimit = 5;
  private readonly failedLoginWindowSeconds = 15 * 60;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {}

  async login(email: string, password: string): Promise<{ token: string; user: AuthenticatedUser }> {
    const normalizedEmail = email.trim().toLowerCase();
    const failedLoginKey = this.failedLoginKey(normalizedEmail);
    let failures: number;
    try {
      failures = Number(await this.redis.get(failedLoginKey) ?? 0);
    } catch {
      throw new ServiceUnavailableException('Dịch vụ đăng nhập tạm thời không khả dụng. Vui lòng thử lại sau.');
    }
    if (failures >= this.failedLoginLimit) {
      throw new HttpException('Quá nhiều lần đăng nhập không thành công. Vui lòng thử lại sau.', HttpStatus.TOO_MANY_REQUESTS);
    }

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } },
    });
    if (!user || user.status !== 'ACTIVE' || !(await verifyPassword(password, user.passwordHash))) {
      try {
        await this.redis.incrementWindow(failedLoginKey, this.failedLoginWindowSeconds);
      } catch {
        throw new ServiceUnavailableException('Dịch vụ đăng nhập tạm thời không khả dụng. Vui lòng thử lại sau.');
      }
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    try {
      await this.redis.delete(failedLoginKey);
    } catch {
      throw new ServiceUnavailableException('Dịch vụ đăng nhập tạm thời không khả dụng. Vui lòng thử lại sau.');
    }
    const token = createToken();
    await this.prisma.userSession.create({ data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + SESSION_TTL_MS) } });
    return { token, user: this.toAuthenticatedUser(user) };
  }

  async resolveSession(token: string | undefined): Promise<{ sessionId: string; user: AuthenticatedUser } | null> {
    if (!token) return null;
    const session = await this.prisma.userSession.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { user: { include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } } } },
    });
    if (!session || session.revokedAt || session.expiresAt <= new Date() || session.user.status !== 'ACTIVE') return null;
    return { sessionId: session.id, user: this.toAuthenticatedUser(session.user) };
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.prisma.userSession.updateMany({ where: { id: sessionId, revokedAt: null }, data: { revokedAt: new Date() } });
  }

  async requestPasswordReset(email: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user || user.status !== 'ACTIVE') return null;
    const token = createToken();
    await this.prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });
    await this.prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS) } });
    return token;
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const resetToken = await this.prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(token) } });
    if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= new Date()) throw new UnauthorizedException('Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
    const passwordHash = await hashPassword(password);
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
      this.prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
      this.prisma.userSession.updateMany({ where: { userId: resetToken.userId, revokedAt: null }, data: { revokedAt: new Date() } }),
    ]);
  }

  async getUserById(id: string): Promise<AuthenticatedUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } },
    });
    return user ? this.toAuthenticatedUser(user) : null;
  }

  async hashPassword(password: string): Promise<string> { return hashPassword(password); }

  private failedLoginKey(email: string): string {
    const secret = this.config.getOrThrow<string>('AUTH_SECRET');
    const digest = createHmac('sha256', secret).update(email).digest('hex');
    return `auth:failed-login:${digest}`;
  }

  private toAuthenticatedUser(user: { id: string; email: string; status: AuthenticatedUser['status']; roles: Array<{ role: { permissions: Array<{ permission: { key: string } }> } }> }): AuthenticatedUser {
    return { id: user.id, email: user.email, status: user.status, permissions: [...new Set(user.roles.flatMap(({ role }) => role.permissions.map(({ permission }) => permission.key)))].sort() };
  }
}
