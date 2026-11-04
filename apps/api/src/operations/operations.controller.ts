import { Body, Controller, Get, Param, Patch, Post, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import type { AuthRequest } from '../auth/auth.types';
import { CsrfGuard } from '../auth/csrf.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { PermissionsGuard } from '../auth/permissions.guard';
import { SessionGuard } from '../auth/session.guard';
import { ApprovalActionDto, CreateApprovalDto, CreateDocumentDto, CreateLeaveRequestDto, CreateProjectDto, CreateTaskDto, LeaveDecisionDto, PageQueryDto, SearchQueryDto, UpdateTaskStatusDto } from './dto/operations.dto';
import { OperationsService } from './operations.service';

@ApiTags('operations')
@ApiCookieAuth('portal_session')
@UseGuards(SessionGuard, PermissionsGuard)
@Controller()
export class OperationsController {
  constructor(private readonly operations: OperationsService) {}

  @Get('documents')
  @RequirePermissions('documents.read')
  listDocuments(@Query() query: PageQueryDto, @Req() request: AuthRequest) { return this.wrap(this.operations.listDocuments(request.user!, query), 'documents-list'); }

  @Post('documents')
  @UseGuards(CsrfGuard)
  @RequirePermissions('documents.create')
  createDocument(@Body() dto: CreateDocumentDto, @Req() request: AuthRequest) { return this.wrap(this.operations.createDocument(dto, request.user!), 'documents-create'); }

  @Post('documents/upload')
  @UseGuards(CsrfGuard)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 25 * 1024 * 1024 } }))
  @RequirePermissions('documents.create')
  uploadDocument(@UploadedFile() file: { originalname: string; mimetype: string; size: number; buffer: Buffer }, @Req() request: AuthRequest) { return this.wrap(this.operations.uploadDocument(file, request.user!), 'documents-upload'); }

  @Get('documents/:id/download')
  @RequirePermissions('documents.read')
  async downloadDocument(@Param('id') id: string, @Req() request: AuthRequest, @Res() response: Response) {
    const result = await this.operations.downloadDocument(id, request.user!);
    response.setHeader('Content-Type', result.file.contentType ?? result.document.mimeType);
    response.setHeader('Content-Disposition', `attachment; filename="${result.document.name.replace(/"/g, '')}"`);
    if (result.file.length) response.setHeader('Content-Length', String(result.file.length));
    result.file.body.pipe(response);
  }

  @Get('search')
  @RequirePermissions('documents.read')
  search(@Query() query: SearchQueryDto, @Req() request: AuthRequest) { return this.wrap(this.operations.search(query, request.user!), 'search'); }

  @Get('projects')
  @RequirePermissions('projects.read')
  listProjects(@Req() request: AuthRequest) { return this.wrap(this.operations.listProjects(request.user!), 'projects-list'); }

  @Post('projects')
  @UseGuards(CsrfGuard)
  @RequirePermissions('projects.create')
  createProject(@Body() dto: CreateProjectDto, @Req() request: AuthRequest) { return this.wrap(this.operations.createProject(dto, request.user!), 'projects-create'); }

  @Post('tasks')
  @UseGuards(CsrfGuard)
  @RequirePermissions('tasks.create')
  createTask(@Body() dto: CreateTaskDto, @Req() request: AuthRequest) { return this.wrap(this.operations.createTask(dto, request.user!), 'tasks-create'); }

  @Patch('tasks/:id/status')
  @UseGuards(CsrfGuard)
  @RequirePermissions('tasks.create')
  updateTaskStatus(@Param('id') id: string, @Body() dto: UpdateTaskStatusDto, @Req() request: AuthRequest) { return this.wrap(this.operations.updateTaskStatus(id, dto, request.user!), 'tasks-status'); }

  @Get('leaves')
  @RequirePermissions('leave.read')
  listLeaves(@Req() request: AuthRequest) { return this.wrap(this.operations.listLeaves(request.user!), 'leaves-list'); }

  @Post('leaves')
  @UseGuards(CsrfGuard)
  @RequirePermissions('leave.create')
  createLeave(@Body() dto: CreateLeaveRequestDto, @Req() request: AuthRequest) { return this.wrap(this.operations.createLeave(dto, request.user!), 'leaves-create'); }

  @Patch('leaves/:id/decision')
  @UseGuards(CsrfGuard)
  @RequirePermissions('leave.manage')
  decideLeave(@Param('id') id: string, @Body() dto: LeaveDecisionDto, @Req() request: AuthRequest) { return this.wrap(this.operations.decideLeave(id, dto, request.user!), 'leaves-decision'); }

  @Get('approvals')
  @RequirePermissions('approvals.read')
  listApprovals(@Req() request: AuthRequest) { return this.wrap(this.operations.listApprovals(request.user!), 'approvals-list'); }

  @Post('approvals')
  @UseGuards(CsrfGuard)
  @RequirePermissions('approvals.create')
  createApproval(@Body() dto: CreateApprovalDto, @Req() request: AuthRequest) { return this.wrap(this.operations.createApproval(dto, request.user!), 'approvals-create'); }

  @Post('approvals/:id/action')
  @UseGuards(CsrfGuard)
  @RequirePermissions('approvals.manage')
  actionApproval(@Param('id') id: string, @Body() dto: ApprovalActionDto, @Req() request: AuthRequest) { return this.wrap(this.operations.actionApproval(id, dto, request.user!), 'approvals-action'); }

  @Get('notifications')
  @RequirePermissions('notifications.read')
  listNotifications(@Req() request: AuthRequest) { return this.wrap(this.operations.listNotifications(request.user!), 'notifications-list'); }

  @Patch('notifications/:id/read')
  @UseGuards(CsrfGuard)
  @RequirePermissions('notifications.update')
  markNotificationRead(@Param('id') id: string, @Req() request: AuthRequest) { return this.wrap(this.operations.markNotificationRead(id, request.user!), 'notifications-read'); }

  private wrap<T>(data: T | Promise<T>, requestId: string) { return Promise.resolve(data).then((value) => ({ data: value, meta: { requestId } })); }
}
