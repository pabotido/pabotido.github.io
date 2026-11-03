import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import type { AuthenticatedUser } from '../auth/auth.types';
import type { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService, private readonly auth: AuthService) {}

  async list(page = 1, pageSize = 20) {
    const take = Math.min(Math.max(pageSize, 1), 100);
    const skip = (Math.max(page, 1) - 1) * take;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({ skip, take, orderBy: { createdAt: 'desc' }, select: { id: true, email: true, username: true, status: true, profile: { select: { displayName: true, phone: true, avatarUrl: true } }, employee: { select: { employeeCode: true, departmentId: true, positionId: true } } } }),
      this.prisma.user.count(),
    ]);
    return { items, page: Math.max(page, 1), pageSize: take, total };
  }

  async get(id: string, actor: AuthenticatedUser) {
    if (id !== actor.id && !actor.permissions.includes('users.read')) throw new ForbiddenException('Bạn không có quyền xem người dùng này');
    const user = await this.prisma.user.findUnique({ where: { id }, select: { id: true, email: true, username: true, status: true, profile: true, employee: { include: { department: true, position: true } } } });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    return user;
  }

  async create(dto: CreateUserDto) {
    const passwordHash = await this.auth.hashPassword(dto.password);
    try {
      return await this.prisma.user.create({ data: { email: dto.email.trim().toLowerCase(), username: dto.username, passwordHash, profile: { create: { displayName: dto.displayName } } }, select: { id: true, email: true, username: true, status: true, profile: true } });
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') throw new ConflictException('Email hoặc username đã tồn tại');
      throw error;
    }
  }

  async update(id: string, dto: UpdateUserDto, actor: AuthenticatedUser) {
    if (id !== actor.id && !actor.permissions.includes('users.update')) throw new ForbiddenException('Bạn không có quyền cập nhật người dùng này');
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    return this.prisma.$transaction(async (tx) => {
      if (dto.displayName !== undefined) await tx.userProfile.upsert({ where: { userId: id }, create: { userId: id, displayName: dto.displayName }, update: { displayName: dto.displayName } });
      return tx.user.update({ where: { id }, data: dto.status ? { status: dto.status } : {}, select: { id: true, email: true, username: true, status: true, profile: true } });
    });
  }
}
