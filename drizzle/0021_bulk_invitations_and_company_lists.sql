-- Sprint 13: Bulk Employee Invitations, Outbox Dispatch Queue, and Company Lists

CREATE TABLE IF NOT EXISTS "job_titles" (
  "id" serial PRIMARY KEY,
  "company_id" integer NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "code" text,
  "status" text NOT NULL DEFAULT 'active',
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "uidx_job_titles_company_name" ON "job_titles" ("company_id", "name");
CREATE INDEX IF NOT EXISTS "idx_job_titles_company_id" ON "job_titles" ("company_id");

CREATE TABLE IF NOT EXISTS "bulk_invitation_batches" (
  "id" serial PRIMARY KEY,
  "company_id" integer NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
  "uploaded_by_user_id" text NOT NULL,
  "file_name" text NOT NULL,
  "total_rows" integer NOT NULL DEFAULT 0,
  "valid_rows" integer NOT NULL DEFAULT 0,
  "skipped_rows" integer NOT NULL DEFAULT 0,
  "queued_count" integer NOT NULL DEFAULT 0,
  "sent_count" integer NOT NULL DEFAULT 0,
  "failed_count" integer NOT NULL DEFAULT 0,
  "status" text NOT NULL DEFAULT 'processing',
  "error_report_json" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_bulk_invitation_batches_company_id" ON "bulk_invitation_batches" ("company_id");
CREATE INDEX IF NOT EXISTS "idx_bulk_invitation_batches_status" ON "bulk_invitation_batches" ("status");
CREATE INDEX IF NOT EXISTS "idx_bulk_invitation_batches_created_at" ON "bulk_invitation_batches" ("created_at");

CREATE TABLE IF NOT EXISTS "invitation_email_queue" (
  "id" serial PRIMARY KEY,
  "batch_id" integer REFERENCES "bulk_invitation_batches"("id") ON DELETE SET NULL,
  "company_id" integer NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
  "invitation_id" integer NOT NULL REFERENCES "employee_invitations"("id") ON DELETE CASCADE,
  "recipient_email" text NOT NULL,
  "recipient_name" text NOT NULL,
  "status" text NOT NULL DEFAULT 'queued',
  "retry_count" integer NOT NULL DEFAULT 0,
  "max_retries" integer NOT NULL DEFAULT 3,
  "last_attempt_at" timestamp with time zone,
  "next_attempt_at" timestamp with time zone NOT NULL DEFAULT now(),
  "failure_reason" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_invitation_email_queue_company_id" ON "invitation_email_queue" ("company_id");
CREATE INDEX IF NOT EXISTS "idx_invitation_email_queue_batch_id" ON "invitation_email_queue" ("batch_id");
CREATE INDEX IF NOT EXISTS "idx_invitation_email_queue_status_next_attempt" ON "invitation_email_queue" ("status", "next_attempt_at");
CREATE INDEX IF NOT EXISTS "idx_invitation_email_queue_invitation_id" ON "invitation_email_queue" ("invitation_id");

ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "department_id" integer;
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "job_title_id" integer;
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "profile_completed" boolean NOT NULL DEFAULT false;

ALTER TABLE "employee_invitations" ADD COLUMN IF NOT EXISTS "batch_id" integer;
ALTER TABLE "employee_invitations" ADD COLUMN IF NOT EXISTS "department_id" integer;
ALTER TABLE "employee_invitations" ADD COLUMN IF NOT EXISTS "job_title_id" integer;
ALTER TABLE "employee_invitations" ADD COLUMN IF NOT EXISTS "job_title" text;
