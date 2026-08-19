-- Migration: 0017_add_company_pilot_passes.sql
-- Description: Create company_pilot_passes and pilot_pass_audit_logs tables

CREATE TABLE IF NOT EXISTS "company_pilot_passes" (
  "id" serial PRIMARY KEY,
  "code_hash" text NOT NULL,
  "code_last_four" varchar(4) NOT NULL,
  "company_name" text NOT NULL,
  "intended_contact_name" text NOT NULL,
  "intended_contact_email" text NOT NULL,
  "intended_email_domain" text,
  "status" text NOT NULL DEFAULT 'issued',
  "duration_days" integer NOT NULL DEFAULT 30,
  "learner_seat_limit" integer NOT NULL DEFAULT 10,
  "administrator_seat_limit" integer NOT NULL DEFAULT 1,
  "permitted_course_ids" integer[] NOT NULL DEFAULT '{}',
  "internal_sales_note" text,
  "starts_at" timestamp with time zone,
  "expires_at" timestamp with time zone,
  "retention_ends_at" timestamp with time zone,
  "redeemed_at" timestamp with time zone,
  "redeemed_by_user_id" text,
  "company_id" integer REFERENCES "companies"("id") ON DELETE SET NULL,
  "created_by_platform_admin_id" text NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  "revoked_at" timestamp with time zone,
  "revoked_by" text,
  "revocation_reason" text,
  "extended_at" timestamp with time zone,
  "extension_reason" text,
  "converted_at" timestamp with time zone,
  "converted_subscription_id" integer REFERENCES "company_subscriptions"("id") ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "pilot_pass_audit_logs" (
  "id" serial PRIMARY KEY,
  "pilot_pass_id" integer NOT NULL REFERENCES "company_pilot_passes"("id") ON DELETE CASCADE,
  "action" text NOT NULL,
  "performed_by" text NOT NULL,
  "details" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "uidx_company_pilot_passes_code_hash" ON "company_pilot_passes" ("code_hash");
CREATE INDEX IF NOT EXISTS "idx_company_pilot_passes_company_status" ON "company_pilot_passes" ("company_id", "status");
CREATE INDEX IF NOT EXISTS "idx_company_pilot_passes_status" ON "company_pilot_passes" ("status");
CREATE INDEX IF NOT EXISTS "idx_pilot_pass_audit_logs_pass_id" ON "pilot_pass_audit_logs" ("pilot_pass_id");
