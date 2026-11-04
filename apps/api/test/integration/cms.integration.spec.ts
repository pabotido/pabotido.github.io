import { randomUUID } from 'node:crypto';
import { NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CmsService } from '../../src/cms/cms.service';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('CMS workflow and audience PostgreSQL integration', () => {
  const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
  const cms = new CmsService(prisma as PrismaService);
  const suffix = randomUUID();
  const author = { id: randomUUID(), email: `cms-author-${suffix}@example.test`, status: 'ACTIVE' as const, permissions: ['cms.news.create', 'cms.news.update'] };
  const reviewer = { id: randomUUID(), email: `cms-reviewer-${suffix}@example.test`, status: 'ACTIVE' as const, permissions: ['cms.news.approve', 'cms.news.publish'] };
  const member = { id: randomUUID(), email: `cms-member-${suffix}@example.test`, status: 'ACTIVE' as const, permissions: [] };
  let ownDepartmentId: string;
  let otherDepartmentId: string;
  const createdArticleIds: string[] = [];

  beforeAll(async () => {
    await prisma.$connect();
    const [ownDepartment, otherDepartment] = await Promise.all([
      prisma.department.create({ data: { code: `CMS-${suffix.slice(0, 8)}-A`, name: 'CMS Audience A' } }),
      prisma.department.create({ data: { code: `CMS-${suffix.slice(0, 8)}-B`, name: 'CMS Audience B' } }),
    ]);
    ownDepartmentId = ownDepartment.id;
    otherDepartmentId = otherDepartment.id;
    await prisma.user.createMany({ data: [author, reviewer, member].map(({ id, email }) => ({ id, email, passwordHash: 'integration-only' })) });
    await prisma.employee.create({ data: { userId: member.id, employeeCode: `CMS-${suffix.slice(0, 12)}`, departmentId: ownDepartmentId } });
  });

  afterAll(async () => {
    await prisma.cmsArticle.deleteMany({ where: { id: { in: createdArticleIds } } });
    await prisma.employee.deleteMany({ where: { userId: member.id } });
    await prisma.user.deleteMany({ where: { id: { in: [author.id, reviewer.id, member.id] } } });
    await prisma.department.deleteMany({ where: { id: { in: [ownDepartmentId, otherDepartmentId] } } });
    await prisma.$disconnect();
  });

  it('enforces draft-review-approval-publish and filters by department audience', async () => {
    const company = await cms.create({ title: 'Company news', slug: `company-${suffix}`, summary: 'Visible to all', body: 'Company body' }, author);
    createdArticleIds.push(company.id);
    const own = await cms.create({ title: 'Own department news', slug: `own-${suffix}`, summary: 'Visible to own department', body: 'Own body', audienceType: 'DEPARTMENT', departmentId: ownDepartmentId }, author);
    createdArticleIds.push(own.id);
    const other = await cms.create({ title: 'Other department news', slug: `other-${suffix}`, summary: 'Private to other department', body: 'Other body', audienceType: 'DEPARTMENT', departmentId: otherDepartmentId }, author);
    createdArticleIds.push(other.id);

    await expect(cms.publish(company.id, reviewer)).rejects.toMatchObject({ status: 409 });
    await cms.submit(company.id, author);
    await expect(cms.approve(company.id, author)).rejects.toMatchObject({ status: 403 });
    await cms.approve(company.id, reviewer);
    await cms.publish(company.id, reviewer);

    await cms.submit(own.id, author);
    await cms.approve(own.id, reviewer);
    await cms.publish(own.id, reviewer);
    await cms.submit(other.id, author);
    await cms.approve(other.id, reviewer);
    await cms.publish(other.id, reviewer);

    const visible = await cms.listPublished(member);
    expect(visible.map((article) => article.slug)).toEqual(expect.arrayContaining([company.slug, own.slug]));
    expect(visible.map((article) => article.slug)).not.toContain(other.slug);
    await expect(cms.getPublished(other.slug, member)).rejects.toBeInstanceOf(NotFoundException);
  });
});
