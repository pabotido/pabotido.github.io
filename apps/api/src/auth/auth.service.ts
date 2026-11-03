import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createToken, hashPassword, hashToken, verifyPassword } from './crypto';
import { SESSION_TTL_MS } from './auth.constants';
import type { AuthenticatedUser } from './auth.types';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(email: string, password: string): Promise<{ token: string; user: AuthenticatedUser }> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } },
    });
    if (!user || user.status !== 'ACTIVE' || !(await verifyPassword(password, user.passwordHash))) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
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

  async getUserById(id: string): Promise<AuthenticatedUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } },
    });
    return user ? this.toAuthenticatedUser(user) : null;
  }

  async hashPassword(password: string): Promise<string> { return hashPassword(password); }

  private toAuthenticatedUser(user: { id: string; email: string; status: AuthenticatedUser['status']; roles: Array<{ role: { permissions: Array<{ permission: { key: string } }> } }> }): AuthenticatedUser {
    return { id: user.id, email: user.email, status: user.status, permissions: [...new Set(user.roles.flatMap(({ role }) => role.permissions.map(({ permission }) => permission.key)))].sort() };
  }
}
