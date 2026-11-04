CREATE TABLE "workflow_definitions" (
  "id" UUID NOT NULL,
  "key" VARCHAR(100) NOT NULL,
  "name" VARCHAR(180) NOT NULL,
  "description" VARCHAR(1000),
  "active" BOOLEAN NOT NULL DEFAULT true,
  "creator_id" UUID NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "workflow_definitions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "workflow_definitions_key_key" ON "workflow_definitions"("key");
CREATE TABLE "workflow_steps" (
  "id" UUID NOT NULL,
  "workflow_id" UUID NOT NULL,
  "order" INTEGER NOT NULL,
  "name" VARCHAR(180) NOT NULL,
  "reviewer_id" UUID NOT NULL,
  CONSTRAINT "workflow_steps_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "workflow_steps_workflow_id_order_key" ON "workflow_steps"("workflow_id", "order");
CREATE INDEX "workflow_steps_reviewer_id_idx" ON "workflow_steps"("reviewer_id");
ALTER TABLE "workflow_definitions" ADD CONSTRAINT "workflow_definitions_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "workflow_steps" ADD CONSTRAINT "workflow_steps_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflow_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "workflow_steps" ADD CONSTRAINT "workflow_steps_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "approval_requests" ADD COLUMN "workflow_id" UUID;
ALTER TABLE "approval_requests" ADD COLUMN "current_step" INTEGER;
ALTER TABLE "approval_actions" ADD COLUMN "step_id" UUID;
CREATE INDEX "approval_requests_workflow_id_current_step_idx" ON "approval_requests"("workflow_id", "current_step");
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflow_definitions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "approval_actions" ADD CONSTRAINT "approval_actions_step_id_fkey" FOREIGN KEY ("step_id") REFERENCES "workflow_steps"("id") ON DELETE SET NULL ON UPDATE CASCADE;