-- Migration: 0016_secure_access_code_storage.sql
-- Description: Forward-only migration adding display_code_hash and display_code_last_four

ALTER TABLE "employee_invitations" ADD COLUMN IF NOT EXISTS "display_code_hash" text;
ALTER TABLE "employee_invitations" ADD COLUMN IF NOT EXISTS "display_code_last_four" varchar(4);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'uidx_employee_invitations_display_code_hash'
  ) THEN
    CREATE UNIQUE INDEX uidx_employee_invitations_display_code_hash ON employee_invitations (display_code_hash);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_employee_invitations_company_status'
  ) THEN
    CREATE INDEX idx_employee_invitations_company_status ON employee_invitations (company_id, status);
  END IF;
END $$;
