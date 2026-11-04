CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

CREATE TABLE "leave_requests" (
  "id" UUID NOT NULL,
  "employee_id" UUID NOT NULL,
  "requester_id" UUID NOT NULL,
  "decider_id" UUID,
  "start_date" DATE NOT NULL,
  "end_date" DATE NOT NULL,
  "reason" VARCHAR(1000) NOT NULL,
  "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
  "decision_note" VARCHAR(1000),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "leave_requests_employee_id_status_start_date_idx" ON "leave_requests"("employee_id", "status", "start_date");
CREATE INDEX "leave_requests_requester_id_created_at_idx" ON "leave_requests"("requester_id", "created_at");

ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_decider_id_fkey" FOREIGN KEY ("decider_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
