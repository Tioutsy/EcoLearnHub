-- Migration: 0018_add_pilot_lifecycle_and_upgrade_requests.sql
-- Description: Adds company_upgrade_requests, pilot_notifications, and upgrade_request_audit_logs tables for Sprint 12.3

CREATE TABLE IF NOT EXISTS "company_upgrade_requests" (
  "id" serial PRIMARY KEY,
  "company_id" integer NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
  "pilot_pass_id" integer REFERENCES "company_pilot_passes"("id") ON DELETE SET NULL,
  "selected_plan_code" text NOT NULL,
  "selected_employee_band_code" text NOT NULL,
  "billing_interval" text NOT NULL DEFAULT 'MONTHLY',
  "billing_contact_name" text NOT NULL,
  "billing_contact_email" text NOT NULL,
  "company_note" text,
  "status" text NOT NULL DEFAULT 'REQUESTED',
  "requested_by_user_id" text NOT NULL,
  "requested_at" timestamp with time zone NOT NULL DEFAULT now(),
  "payment_reference" text,
  "payment_date" timestamp with time zone,
  "payment_amount_mur" integer,
  "payment_method" text,
  "payment_internal_note" text,
  "payment_confirmed_by_platform_admin_id" text,
  "payment_confirmed_at" timestamp with time zone,
  "converted_subscription_id" integer REFERENCES "company_subscriptions"("id") ON DELETE SET NULL,
  "converted_at" timestamp with time zone,
  "converted_by" text,
  "cancelled_at" timestamp with time zone,
  "cancelled_by" text,
  "cancellation_reason" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_company_upgrade_requests_company_status" ON "company_upgrade_requests" ("company_id", "status");
CREATE INDEX IF NOT EXISTS "idx_company_upgrade_requests_status" ON "company_upgrade_requests" ("status");

CREATE TABLE IF NOT EXISTS "pilot_notifications" (
  "id" serial PRIMARY KEY,
  "pilot_pass_id" integer NOT NULL REFERENCES "company_pilot_passes"("id") ON DELETE CASCADE,
  "company_id" integer NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
  "notification_type" text NOT NULL,
  "recipient_email" text NOT NULL,
  "recipient_name" text,
  "milestone_cycle_key" text NOT NULL UNIQUE,
  "scheduled_for" timestamp with time zone NOT NULL,
  "sent_at" timestamp with time zone,
  "delivery_status" text NOT NULL DEFAULT 'PENDING',
  "provider_reference" text,
  "sanitized_error" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_pilot_notifications_status" ON "pilot_notifications" ("delivery_status");
CREATE INDEX IF NOT EXISTS "idx_pilot_notifications_pass_id" ON "pilot_notifications" ("pilot_pass_id");

CREATE TABLE IF NOT EXISTS "upgrade_request_audit_logs" (
  "id" serial PRIMARY KEY,
  "upgrade_request_id" integer NOT NULL REFERENCES "company_upgrade_requests"("id") ON DELETE CASCADE,
  "from_status" text,
  "to_status" text NOT NULL,
  "action" text NOT NULL,
  "performed_by" text NOT NULL,
  "details" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_upgrade_request_audit_logs_request_id" ON "upgrade_request_audit_logs" ("upgrade_request_id");
