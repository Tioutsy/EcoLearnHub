-- Migration 0015: Add Employee Invitations Table and Indexes
CREATE TABLE IF NOT EXISTS "employee_invitations" (
  "id" serial PRIMARY KEY,
  "company_id" integer NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
  "email" text NOT NULL,
  "first_name" text,
  "last_name" text,
  "department" text,
  "intended_role" text NOT NULL DEFAULT 'employee',
  "token_hash" text NOT NULL,
  "display_code" text NOT NULL,
  "status" text NOT NULL DEFAULT 'pending',
  "expires_at" timestamp with time zone NOT NULL,
  "invited_by" text,
  "accepted_by" text,
  "accepted_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "employee_invitations_token_hash_idx" ON "employee_invitations" ("token_hash");
CREATE UNIQUE INDEX IF NOT EXISTS "employee_invitations_display_code_idx" ON "employee_invitations" ("display_code");
CREATE INDEX IF NOT EXISTS "employee_invitations_company_email_idx" ON "employee_invitations" ("company_id", "email");
CREATE INDEX IF NOT EXISTS "employee_invitations_company_status_idx" ON "employee_invitations" ("company_id", "status");
