import { ConflictException, ForbiddenException } from '@nestjs/common';
import { CmsService } from '../src/cms/cms.service';

describe('CmsService editorial workflow', () => {
  const actor = { id: 'author-1', email: 'author@example.com', status: 'ACTIVE' as const, permissions: ['cms.news.update'] };
  const article = { id: 'article-1', authorId: actor.id, status: 'DRAFT', audienceType: 'COMPANY', departmentId: null };
  const prisma = {
    cmsArticle: { findUnique: jest.fn(), updateMany: jest.fn(), findUniqueOrThrow: jest.fn(), create: jest.fn(), update: jest.fn(), findMany: jest.fn() },
    auditLog: { create: jest.fn() },
    employee: { findUnique: jest.fn() },
    $transaction: jest.fn(),
  };
  prisma.$transaction.mockImplementation((callback: (tx: unknown) => unknown) => callback(prisma));
  const service = new CmsService(prisma as never);

  beforeEach(() => jest.clearAllMocks());

  it('requires a department when department audience is selected', async () => {
    await expect(service.create({ title: 'News title', slug: 'news-title', summary: 'Summary', body: 'Body', audienceType: 'DEPARTMENT' }, actor))
      .rejects.toBeInstanceOf(ConflictException);
    expect(prisma.cmsArticle.create).not.toHaveBeenCalled();
  });

  it('rejects edits after a draft has entered review', async () => {
    prisma.cmsArticle.findUnique.mockResolvedValue({ ...article, status: 'PENDING_REVIEW' });
    await expect(service.update(article.id, { title: 'Changed title' }, actor)).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.cmsArticle.update).not.toHaveBeenCalled();
  });

  it('prevents an author from approving their own article', async () => {
    prisma.cmsArticle.findUnique.mockResolvedValue({ ...article, status: 'PENDING_REVIEW' });
    await expect(service.approve(article.id, actor)).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.cmsArticle.updateMany).not.toHaveBeenCalled();
  });

  it('publishes only an approved article and records its audit event', async () => {
    const publisher = { ...actor, id: 'publisher-1', permissions: ['cms.news.publish'] };
    prisma.cmsArticle.findUnique.mockResolvedValue({ ...article, authorId: 'author-2', status: 'APPROVED' });
    prisma.cmsArticle.updateMany.mockResolvedValue({ count: 1 });
    prisma.cmsArticle.findUniqueOrThrow.mockResolvedValue({ ...article, status: 'PUBLISHED' });
    await service.publish(article.id, publisher);
    expect(prisma.cmsArticle.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: { id: article.id, status: 'APPROVED' }, data: expect.objectContaining({ status: 'PUBLISHED' }) }));
    expect(prisma.auditLog.create).toHaveBeenCalledWith({ data: { actorId: publisher.id, action: 'cms.article.published', resource: 'cms_article', resourceId: article.id } });
  });
});
