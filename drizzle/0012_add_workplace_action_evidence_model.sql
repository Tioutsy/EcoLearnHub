-- Migration 0012: Add Sprint 11D Workplace Action Evidence Model fields
ALTER TABLE "learner_commitments" ADD COLUMN IF NOT EXISTS "action_category" text NOT NULL DEFAULT 'workplace-practice';
ALTER TABLE "learner_commitments" ADD COLUMN IF NOT EXISTS "employee_progress_note" text;
ALTER TABLE "learner_commitments" ADD COLUMN IF NOT EXISTS "manager_response_note" text;
ALTER TABLE "learner_commitments" ADD COLUMN IF NOT EXISTS "employee_submitted_at" timestamp with time zone DEFAULT now();
ALTER TABLE "learner_commitments" ADD COLUMN IF NOT EXISTS "action_reported_at" timestamp with time zone;
ALTER TABLE "learner_commitments" ADD COLUMN IF NOT EXISTS "manager_reviewed_at" timestamp with time zone;
ALTER TABLE "learner_commitments" ADD COLUMN IF NOT EXISTS "reviewed_by_employee_id" integer;
