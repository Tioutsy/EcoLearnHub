-- Migration 0014: Add Yearly Subscription Payment Option Fields
ALTER TABLE "company_subscriptions" ADD COLUMN IF NOT EXISTS "billing_interval" text NOT NULL DEFAULT 'MONTHLY';
ALTER TABLE "company_subscriptions" ADD COLUMN IF NOT EXISTS "discount_percentage" numeric(5, 2) NOT NULL DEFAULT '0';
ALTER TABLE "company_subscriptions" ADD COLUMN IF NOT EXISTS "agreed_yearly_amount" numeric(10, 2);
