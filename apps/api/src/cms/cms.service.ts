import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { CmsArticleStatus, ContentAudienceType, Prisma } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateArticleDto, UpdateArticleDto } from './dto/article.dto';

const articleSelect = {
  id: true, title: true, slug: true, summary: true, body: true, status: true,
  audienceType: true, departmentId: true, publishedAt: true, createdAt: true, updatedAt: true,
  author: { select: { id: true, profile: { select: { displayName: true } } } },
  department: { select: { id: true, name: true } },
} satisfies Prisma.CmsArticleSelect;

@Injectable()
export class CmsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublished(user: AuthenticatedUser) {
    return this.prisma.cmsArticle.findMany({ where: await this.publishedWhere(user), orderBy: { publishedAt: 'desc' }, take: 50, select: articleSelect });
  }

  async getPublished(slug: string, user: AuthenticatedUser) {
    const article = await this.prisma.cmsArticle.findFirst({ where: { ...await this.publishedWhere(user), slug }, select: articleSelect });
    if (!article) throw new NotFoundException('Không tìm thấy bài viết');
    return article;
  }

  async listManaged(status?: CmsArticleStatus) {
    return this.prisma.cmsArticle.findMany({ where: status ? { status } : {}, orderBy: { updatedAt: 'desc' }, take: 100, select: articleSelect });
  }

  listDepartments() { return this.prisma.department.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }); }

  async create(dto: CreateArticleDto, actor: AuthenticatedUser) {
    const audience = this.validateAudience(dto.audienceType ?? 'COMPANY', dto.departmentId);
    try {
      return await this.prisma.$transaction(async (tx) => {
        const article = await tx.cmsArticle.create({ data: { ...dto, ...audience, authorId: actor.id }, select: articleSelect });
        await tx.auditLog.create({ data: { actorId: actor.id, action: 'cms.article.created', resource: 'cms_article', resourceId: article.id } });
        return article;
      });
    } catch (error) {
      this.rethrowSlugConflict(error);
      throw error;
    }
  }

  async update(id: string, dto: UpdateArticleDto, actor: AuthenticatedUser) {
    const article = await this.requireArticle(id);
    this.assertDraft(article.status);
    if (article.authorId !== actor.id && !actor.permissions.includes('cms.news.update')) throw new ForbiddenException('Bạn không có quyền sửa bài viết này');
    const audience = dto.audienceType || dto.departmentId !== undefined
      ? this.validateAudience(dto.audienceType ?? article.audienceType, dto.departmentId ?? article.departmentId ?? undefined)
      : {};
    try {
      return await this.prisma.cmsArticle.update({ where: { id }, data: { ...dto, ...audience }, select: articleSelect });
    } catch (error) {
      this.rethrowSlugConflict(error);
      throw error;
    }
  }

  async submit(id: string, actor: AuthenticatedUser) {
    const article = await this.requireArticle(id);
    if (article.authorId !== actor.id && !actor.permissions.includes('cms.news.update')) throw new ForbiddenException('Bạn không có quyền gửi duyệt bài viết này');
    if (article.status !== 'DRAFT') throw new ConflictException('Chỉ bản nháp mới có thể gửi duyệt');
    return this.transition(id, 'PENDING_REVIEW', actor.id, 'cms.article.submitted');
  }

  async approve(id: string, actor: AuthenticatedUser) {
    const article = await this.requireArticle(id);
    if (article.authorId === actor.id) throw new ForbiddenException('Người tạo không thể tự duyệt bài viết');
    if (article.status !== 'PENDING_REVIEW') throw new ConflictException('Bài viết không ở trạng thái chờ duyệt');
    return this.transition(id, 'APPROVED', actor.id, 'cms.article.approved');
  }

  async publish(id: string, actor: AuthenticatedUser) {
    const article = await this.requireArticle(id);
    if (article.status !== 'APPROVED') throw new ConflictException('Bài viết cần được duyệt trước khi xuất bản');
    return this.transition(id, 'PUBLISHED', actor.id, 'cms.article.published', { publishedAt: new Date() });
  }

  private async transition(id: string, status: CmsArticleStatus, actorId: string, action: string, extra: Prisma.CmsArticleUpdateInput = {}) {
    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.cmsArticle.updateMany({ where: { id, status: this.previousStatus(status) }, data: { status, ...extra } });
      if (!result.count) throw new ConflictException('Trạng thái bài viết đã thay đổi; hãy tải lại trang');
      const article = await tx.cmsArticle.findUniqueOrThrow({ where: { id }, select: articleSelect });
      await tx.auditLog.create({ data: { actorId, action, resource: 'cms_article', resourceId: id } });
      return article;
    });
    return updated;
  }

  private previousStatus(status: CmsArticleStatus): CmsArticleStatus {
    return ({ PENDING_REVIEW: 'DRAFT', APPROVED: 'PENDING_REVIEW', PUBLISHED: 'APPROVED' } as const)[status as 'PENDING_REVIEW' | 'APPROVED' | 'PUBLISHED'];
  }

  private async requireArticle(id: string) {
    const article = await this.prisma.cmsArticle.findUnique({ where: { id } });
    if (!article) throw new NotFoundException('Không tìm thấy bài viết');
    return article;
  }

  private validateAudience(audienceType: ContentAudienceType, departmentId?: string): Pick<Prisma.CmsArticleUncheckedCreateInput, 'audienceType' | 'departmentId'> {
    if (audienceType === 'DEPARTMENT') {
      if (!departmentId) throw new ConflictException('Cần chọn phòng ban cho nội dung giới hạn theo phòng ban');
      return { audienceType, departmentId };
    }
    return { audienceType, departmentId: null };
  }

  private assertDraft(status: CmsArticleStatus) {
    if (status !== 'DRAFT') throw new ConflictException('Chỉ có thể sửa bài viết ở trạng thái bản nháp');
  }

  private async publishedWhere(user: AuthenticatedUser): Promise<Prisma.CmsArticleWhereInput> {
    const profile = await this.prisma.employee.findUnique({ where: { userId: user.id }, select: { departmentId: true } });
    return {
      status: 'PUBLISHED', publishedAt: { lte: new Date() },
      OR: [
        { audienceType: 'COMPANY' },
        ...(profile?.departmentId ? [{ audienceType: 'DEPARTMENT' as const, departmentId: profile.departmentId }] : []),
      ],
    };
  }

  private rethrowSlugConflict(error: unknown): void {
    if ((error as { code?: string }).code === 'P2002') throw new ConflictException('Đường dẫn bài viết đã tồn tại');
  }
}
