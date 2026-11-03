import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateDepartmentDto, CreateEmployeeDto, UpdateDepartmentDto } from './dto/organization.dto';

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  listDepartments() { return this.prisma.department.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { employees: true } } } }); }

  async createDepartment(dto: CreateDepartmentDto) {
    try { return await this.prisma.department.create({ data: { code: dto.code.trim().toUpperCase(), name: dto.name.trim() } }); }
    catch (error) { if ((error as { code?: string }).code === 'P2002') throw new ConflictException('Mã phòng ban đã tồn tại'); throw error; }
  }

  async updateDepartment(id: string, dto: UpdateDepartmentDto) {
    try { return await this.prisma.department.update({ where: { id }, data: { name: dto.name?.trim() } }); }
    catch (error) { if ((error as { code?: string }).code === 'P2025') throw new NotFoundException('Không tìm thấy phòng ban'); throw error; }
  }

  listEmployees() { return this.prisma.employee.findMany({ orderBy: { employeeCode: 'asc' }, include: { user: { select: { id: true, email: true, profile: true } }, department: true, position: true } }); }

  async createEmployee(dto: CreateEmployeeDto) {
    try { return await this.prisma.employee.create({ data: dto, include: { user: { select: { id: true, email: true, profile: true } }, department: true, position: true } }); }
    catch (error) { if ((error as { code?: string }).code === 'P2002') throw new ConflictException('Mã nhân viên hoặc người dùng đã tồn tại'); if ((error as { code?: string }).code === 'P2025') throw new NotFoundException('Không tìm thấy dữ liệu liên kết'); throw error; }
  }
}
