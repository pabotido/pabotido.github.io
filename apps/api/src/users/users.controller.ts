import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import type { AuthRequest } from '../auth/auth.types';
import { RequirePermissions } from '../auth/permissions.decorator';
import { PermissionsGuard } from '../auth/permissions.guard';
import { SessionGuard } from '../auth/session.guard';
import { CreateUserDto, UpdateUserDto, UserIdParamDto } from './dto/user.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiCookieAuth('portal_session')
@UseGuards(SessionGuard, PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @RequirePermissions('users.read')
  async list(@Query('page', new ParseIntPipe({ optional: true })) page = 1, @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize = 20) { return { data: await this.users.list(page, pageSize), meta: { requestId: 'users-list' } }; }

  @Get(':id')
  async get(@Param() params: UserIdParamDto, @Req() request: AuthRequest) { return { data: await this.users.get(params.id, request.user!), meta: { requestId: 'users-get' } }; }

  @Post()
  @RequirePermissions('users.create')
  async create(@Body() dto: CreateUserDto) { return { data: await this.users.create(dto), meta: { requestId: 'users-create' } }; }

  @Patch(':id')
  async update(@Param() params: UserIdParamDto, @Body() dto: UpdateUserDto, @Req() request: AuthRequest) { return { data: await this.users.update(params.id, dto, request.user!), meta: { requestId: 'users-update' } }; }
}
