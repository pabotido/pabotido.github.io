import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../auth/permissions.decorator';
import { PermissionsGuard } from '../auth/permissions.guard';
import { SessionGuard } from '../auth/session.guard';
import { CreateDepartmentDto, CreateEmployeeDto, UpdateDepartmentDto } from './dto/organization.dto';
import { OrganizationService } from './organization.service';

@ApiTags('organization')
@ApiCookieAuth('portal_session')
@UseGuards(SessionGuard, PermissionsGuard)
@Controller()
export class OrganizationController {
  constructor(private readonly organization: OrganizationService) {}

  @Get('departments')
  @RequirePermissions('departments.read')
  async listDepartments() { return { data: await this.organization.listDepartments(), meta: { requestId: 'departments-list' } }; }

  @Post('departments')
  @RequirePermissions('departments.manage')
  async createDepartment(@Body() dto: CreateDepartmentDto) { return { data: await this.organization.createDepartment(dto), meta: { requestId: 'departments-create' } }; }

  @Patch('departments/:id')
  @RequirePermissions('departments.manage')
  async updateDepartment(@Param('id') id: string, @Body() dto: UpdateDepartmentDto) { return { data: await this.organization.updateDepartment(id, dto), meta: { requestId: 'departments-update' } }; }

  @Get('employees')
  @RequirePermissions('employees.read')
  async listEmployees() { return { data: await this.organization.listEmployees(), meta: { requestId: 'employees-list' } }; }

  @Post('employees')
  @RequirePermissions('employees.create')
  async createEmployee(@Body() dto: CreateEmployeeDto) { return { data: await this.organization.createEmployee(dto), meta: { requestId: 'employees-create' } }; }
}
