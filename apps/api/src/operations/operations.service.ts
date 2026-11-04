import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { TaskStatus } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import type { ApprovalActionDto, CreateApprovalDto, CreateDocumentDto, CreateWorkflowDto, CreateLeaveRequestDto, CreateProjectDto, CreateTaskDto, LeaveDecisionDto, PageQueryDto, SearchQueryDto, UpdateTaskStatusDto } from './dto/operations.dto';

@Injectable()
export class OperationsService {
  constructor(private readonly prisma: PrismaService, private readonly storage: StorageService) {}

  listDocuments(actor: AuthenticatedUser, query: PageQueryDto) {
    const take = Math.min(query.pageSize, 100); const skip = (query.page - 1) * take;
    return this.prisma.$transaction(async (tx) => {
      const where = actor.permissions.includes('documents.manage') ? {} : { ownerId: actor.id };
      const [items, total] = await Promise.all([
        tx.document.findMany({ where, orderBy: { updatedAt: 'desc' }, skip, take, select: { id: true, name: true, description: true, classification: true, folderPath: true, mimeType: true, sizeBytes: true, storageKey: true, ownerId: true, createdAt: true, updatedAt: true } }),
        tx.document.count({ where }),
      ]);
      return { items: items.map((item) => ({ ...item, sizeBytes: item.sizeBytes.toString() })), page: query.page, pageSize: take, total };
    });
  }

  async uploadDocument(file: { originalname: string; mimetype: string; size: number; buffer: Buffer } | undefined, actor: AuthenticatedUser) {
    if (!file) throw new ConflictException('Tệp tải lên là bắt buộc');
    const storageKey = `documents/${actor.id}/${randomUUID()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    await this.storage.put(storageKey, file.buffer, file.mimetype);
    return this.createDocument({ name: file.originalname, mimeType: file.mimetype, sizeBytes: file.size, storageKey }, actor);
  }

  async downloadDocument(id: string, actor: AuthenticatedUser) {
    const document = await this.prisma.document.findFirst({ where: { id, ...(actor.permissions.includes('documents.manage') ? {} : { ownerId: actor.id }) } });
    if (!document) throw new NotFoundException('Không tìm thấy tài liệu');
    return { document, file: await this.storage.get(document.storageKey) };
  }

  async createDocument(dto: CreateDocumentDto, actor: AuthenticatedUser) {
    const document = await this.prisma.document.create({ data: { ...dto, name: dto.name.trim(), folderPath: dto.folderPath?.trim() || '/', ownerId: actor.id, sizeBytes: BigInt(dto.sizeBytes) }, select: { id: true, name: true, classification: true, folderPath: true, mimeType: true, sizeBytes: true, storageKey: true, ownerId: true, createdAt: true } });
    await this.prisma.auditLog.create({ data: { actorId: actor.id, action: 'document.created', resource: 'document', resourceId: document.id, metadata: { storageKey: document.storageKey } } });
    return { ...document, sizeBytes: document.sizeBytes.toString() };
  }

  listProjects(actor: AuthenticatedUser) {
    return this.prisma.project.findMany({ where: actor.permissions.includes('projects.manage') ? {} : { OR: [{ ownerId: actor.id }, { members: { some: { userId: actor.id } } }] }, orderBy: { updatedAt: 'desc' }, include: { _count: { select: { tasks: true, members: true } } } });
  }

  async createProject(dto: CreateProjectDto, actor: AuthenticatedUser) {
    return this.prisma.project.create({ data: { name: dto.name.trim(), description: dto.description?.trim(), ownerId: actor.id, members: { create: { userId: actor.id } } }, include: { _count: { select: { tasks: true, members: true } } } });
  }

  async createTask(dto: CreateTaskDto, actor: AuthenticatedUser) {
    const project = await this.prisma.project.findFirst({ where: { id: dto.projectId, OR: [{ ownerId: actor.id }, { members: { some: { userId: actor.id } } }] } });
    if (!project && !actor.permissions.includes('projects.manage')) throw new NotFoundException('Không tìm thấy dự án hoặc bạn không thuộc dự án');
    return this.prisma.task.create({ data: { projectId: dto.projectId, title: dto.title.trim(), description: dto.description?.trim(), priority: dto.priority, creatorId: actor.id, assignees: dto.assigneeIds ? { createMany: { data: dto.assigneeIds.map((userId) => ({ userId })) } } : undefined }, include: { assignees: true } });
  }

  listWorkflows() {
    return this.prisma.workflowDefinition.findMany({ where: { active: true }, orderBy: { name: 'asc' }, include: { steps: { orderBy: { order: 'asc' }, select: { id: true, order: true, name: true, reviewerId: true } } } });
  }

  async createWorkflow(dto: CreateWorkflowDto, actor: AuthenticatedUser) {
    if (dto.steps.length === 0) throw new ConflictException('Workflow phải có ít nhất một bước');
    const reviewers = dto.steps.map((step) => step.reviewerId);
    if (new Set(reviewers).size !== reviewers.length) throw new ConflictException('Mỗi bước phải có reviewer khác nhau');
    return this.prisma.workflowDefinition.create({ data: { key: dto.key.trim(), name: dto.name.trim(), description: dto.description?.trim(), creatorId: actor.id, steps: { create: dto.steps.map((step, index) => ({ order: index + 1, name: step.name.trim(), reviewerId: step.reviewerId })) } }, include: { steps: { orderBy: { order: 'asc' } } } });
  }

  listApprovals(actor: AuthenticatedUser) {
    return this.prisma.approvalRequest.findMany({ where: actor.permissions.includes('approvals.manage') ? {} : { requesterId: actor.id }, orderBy: { updatedAt: 'desc' }, take: 100, include: { actions: { orderBy: { createdAt: 'desc' }, take: 10 }, workflow: { include: { steps: { orderBy: { order: 'asc' }, select: { id: true, order: true, name: true, reviewerId: true } } } } } });
  }

  createApproval(dto: CreateApprovalDto, actor: AuthenticatedUser) {
    return this.prisma.workflowDefinition.findFirst({ where: dto.workflowId ? { id: dto.workflowId, active: true } : undefined, include: { steps: { orderBy: { order: 'asc' } } } }).then((workflow) => {
      if (dto.workflowId && !workflow) throw new NotFoundException('Không tìm thấy workflow đang hoạt động');
      return this.prisma.approvalRequest.create({ data: { type: dto.type.trim(), title: dto.title.trim(), payload: dto.payload, requesterId: actor.id, status: 'SUBMITTED', workflowId: workflow?.id, currentStep: workflow ? 1 : undefined } });
    });
  }

  async actionApproval(id: string, dto: ApprovalActionDto, actor: AuthenticatedUser) {
    if (!actor.permissions.includes('approvals.manage')) throw new ForbiddenException('Bạn không có quyền xử lý yêu cầu duyệt');
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.approvalRequest.findUnique({ where: { id }, include: { workflow: { include: { steps: { orderBy: { order: 'asc' } } } } } });
      if (!request) throw new NotFoundException('Không tìm thấy yêu cầu duyệt');
      if (!['SUBMITTED', 'IN_REVIEW', 'CHANGES_REQUESTED'].includes(request.status)) throw new ConflictException('Yêu cầu không còn ở trạng thái có thể xử lý');
      const step = request.workflow?.steps.find((item) => item.order === request.currentStep);
      if (step && step.reviewerId !== actor.id) throw new ForbiddenException('Bạn không phải reviewer của bước hiện tại');
      const nextStep = step && request.workflow?.steps.find((item) => item.order === step.order + 1);
      const status = dto.type === 'REJECT' ? 'REJECTED' : dto.type === 'REQUEST_CHANGES' ? 'CHANGES_REQUESTED' : nextStep ? 'IN_REVIEW' : 'APPROVED';
      const updated = await tx.approvalRequest.update({ where: { id }, data: { status, reviewerId: actor.id, currentStep: nextStep?.order ?? request.currentStep }, include: { actions: true } });
      await tx.approvalAction.create({ data: { requestId: id, actorId: actor.id, stepId: step?.id, type: dto.type, comment: dto.comment?.trim() } });
      await tx.auditLog.create({ data: { actorId: actor.id, action: `approval.${dto.type.toLowerCase()}`, resource: 'approval_request', resourceId: id } });
      return updated;
    });
  }

  async updateTaskStatus(id: string, dto: UpdateTaskStatusDto, actor: AuthenticatedUser) {
    const task = await this.prisma.task.findUnique({ where: { id }, include: { project: true } });
    if (!task) throw new NotFoundException('Không tìm thấy công việc');
    const allowed = actor.permissions.includes('projects.manage') || task.creatorId === actor.id || await this.prisma.taskAssignee.findUnique({ where: { taskId_userId: { taskId: id, userId: actor.id } } });
    if (!allowed) throw new ForbiddenException('Bạn không có quyền cập nhật công việc');
    const transitions: Record<TaskStatus, TaskStatus[]> = { BACKLOG: ['TODO', 'CANCELLED'], TODO: ['IN_PROGRESS', 'CANCELLED'], IN_PROGRESS: ['REVIEW', 'CANCELLED'], REVIEW: ['DONE', 'IN_PROGRESS'], DONE: [], CANCELLED: ['TODO'] };
    if (!transitions[task.status].includes(dto.status)) throw new ConflictException('Chuyển trạng thái công việc không hợp lệ');
    return this.prisma.task.update({ where: { id }, data: { status: dto.status } });
  }

  async createLeave(dto: CreateLeaveRequestDto, actor: AuthenticatedUser) {
    const employee = await this.prisma.employee.findFirst({ where: { id: dto.employeeId, userId: actor.id } });
    if (!employee && !actor.permissions.includes('leave.manage')) throw new ForbiddenException('Bạn không thể tạo đơn nghỉ phép cho nhân sự khác');
    const startDate = new Date(dto.startDate); const endDate = new Date(dto.endDate);
    if (Number.isNaN(startDate.valueOf()) || Number.isNaN(endDate.valueOf()) || endDate < startDate) throw new ConflictException('Khoảng thời gian nghỉ phép không hợp lệ');
    return this.prisma.leaveRequest.create({ data: { employeeId: dto.employeeId, requesterId: actor.id, startDate, endDate, reason: dto.reason.trim() } });
  }

  listLeaves(actor: AuthenticatedUser) { return this.prisma.leaveRequest.findMany({ where: actor.permissions.includes('leave.manage') ? {} : { requesterId: actor.id }, orderBy: { createdAt: 'desc' }, include: { employee: { include: { user: { select: { email: true, profile: true } } } } } }); }

  async decideLeave(id: string, dto: LeaveDecisionDto, actor: AuthenticatedUser) {
    if (!actor.permissions.includes('leave.manage')) throw new ForbiddenException('Bạn không có quyền xử lý đơn nghỉ phép');
    const result = await this.prisma.leaveRequest.updateMany({ where: { id, status: 'PENDING' }, data: { status: dto.status, deciderId: actor.id, decisionNote: dto.note?.trim() } });
    if (!result.count) throw new NotFoundException('Không tìm thấy đơn nghỉ phép đang chờ');
    return this.prisma.leaveRequest.findUnique({ where: { id } });
  }

  async search(query: SearchQueryDto, actor: AuthenticatedUser) {
    const q = query.q.trim(); const take = query.limit;
    const [documents, projects, tasks, approvals] = await Promise.all([
      this.prisma.document.findMany({ where: { AND: [{ name: { contains: q, mode: 'insensitive' } }, actor.permissions.includes('documents.manage') ? {} : { ownerId: actor.id }] }, take, select: { id: true, name: true, mimeType: true } }),
      this.prisma.project.findMany({ where: { AND: [{ name: { contains: q, mode: 'insensitive' } }, actor.permissions.includes('projects.manage') ? {} : { OR: [{ ownerId: actor.id }, { members: { some: { userId: actor.id } } }] }] }, take, select: { id: true, name: true, status: true } }),
      this.prisma.task.findMany({ where: { AND: [{ title: { contains: q, mode: 'insensitive' } }, { OR: [{ creatorId: actor.id }, { assignees: { some: { userId: actor.id } } }] }] }, take, select: { id: true, title: true, status: true } }),
      this.prisma.approvalRequest.findMany({ where: { AND: [{ title: { contains: q, mode: 'insensitive' } }, actor.permissions.includes('approvals.manage') ? {} : { requesterId: actor.id }] }, take, select: { id: true, title: true, status: true } }),
    ]);
    return { documents, projects, tasks, approvals };
  }

  listNotifications(actor: AuthenticatedUser) { return this.prisma.notification.findMany({ where: { userId: actor.id }, orderBy: { createdAt: 'desc' }, take: 50 }); }

  async markNotificationRead(id: string, actor: AuthenticatedUser) {
    const result = await this.prisma.notification.updateMany({ where: { id, userId: actor.id }, data: { readAt: new Date() } });
    if (!result.count) throw new NotFoundException('Không tìm thấy thông báo');
    return this.prisma.notification.findUnique({ where: { id } });
  }
}
