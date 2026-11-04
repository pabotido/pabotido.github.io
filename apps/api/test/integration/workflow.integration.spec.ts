import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { ForbiddenException } from '@nestjs/common';
import { OperationsService } from '../../src/operations/operations.service';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('Configurable approval workflow PostgreSQL integration', () => {
  const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
  const storage = { put: jest.fn(), get: jest.fn() } as never;
  const operations = new OperationsService(prisma as PrismaService, storage);
  const suffix = randomUUID();
  const requester = { id: randomUUID(), email: `workflow-requester-${suffix}@example.test`, status: 'ACTIVE' as const, permissions: ['approvals.create'] };
  const firstReviewer = { id: randomUUID(), email: `workflow-first-${suffix}@example.test`, status: 'ACTIVE' as const, permissions: ['approvals.manage'] };
  const secondReviewer = { id: randomUUID(), email: `workflow-second-${suffix}@example.test`, status: 'ACTIVE' as const, permissions: ['approvals.manage'] };
  let workflowId: string;
  let requestId: string;

  beforeAll(async () => {
    await prisma.$connect();
    await prisma.user.createMany({ data: [requester, firstReviewer, secondReviewer].map(({ id, email }) => ({ id, email, passwordHash: 'integration-only' })) });
  });

  afterAll(async () => {
    await prisma.approvalRequest.deleteMany({ where: { id: requestId } });
    await prisma.workflowDefinition.deleteMany({ where: { id: workflowId } });
    await prisma.user.deleteMany({ where: { id: { in: [requester.id, firstReviewer.id, secondReviewer.id] } } });
    await prisma.$disconnect();
  });

  it('enforces reviewer order and completes only after the final step', async () => {
    const workflow = await operations.createWorkflow({ key: `two-step-${suffix}`, name: 'Two-step approval', steps: [{ name: 'Manager review', reviewerId: firstReviewer.id }, { name: 'Finance review', reviewerId: secondReviewer.id }] }, requester);
    workflowId = workflow.id;
    const created = await operations.createApproval({ type: 'expense', title: 'Workflow test', payload: { amount: 10 }, workflowId }, requester);
    requestId = created.id;

    await expect(operations.actionApproval(requestId, { type: 'APPROVE' }, secondReviewer)).rejects.toBeInstanceOf(ForbiddenException);
    await expect(operations.actionApproval(requestId, { type: 'APPROVE' }, firstReviewer)).resolves.toMatchObject({ status: 'IN_REVIEW', currentStep: 2 });
    await expect(operations.actionApproval(requestId, { type: 'APPROVE' }, secondReviewer)).resolves.toMatchObject({ status: 'APPROVED', currentStep: 2 });
  });
});
