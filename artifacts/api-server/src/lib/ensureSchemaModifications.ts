import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./logger";
import { detectAndResolveDuplicateCompanySubscriptions } from "./subscriptionDiagnostics";

async function columnExists(table: string, column: string): Promise<boolean> {
  try {
    const res = await db.execute(sql.raw(`
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = '${table}' AND column_name = '${column}'
    `));
    return res.rows.length > 0;
  } catch {
    return false;
  }
}

async function tableExists(table: string): Promise<boolean> {
  try {
    const res = await db.execute(sql.raw(`
      SELECT 1 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = '${table}'
    `));
    return res.rows.length > 0;
  } catch {
    return false;
  }
}

async function constraintExists(constraintName: string): Promise<boolean> {
  try {
    const res = await db.execute(sql.raw(`
      SELECT 1 
      FROM pg_constraint 
      WHERE conname = '${constraintName}'
    `));
    if (res.rows.length > 0) return true;

    const idxRes = await db.execute(sql.raw(`
      SELECT 1 
      FROM pg_class 
      WHERE relname = '${constraintName}'
    `));
    return idxRes.rows.length > 0;
  } catch {
    return false;
  }
}

async function courseCodeExists(slug: string, expectedCode: string): Promise<boolean> {
  try {
    const res = await db.execute(sql.raw(`
      SELECT 1 
      FROM "courses" 
      WHERE "slug" = '${slug}' AND "course_code" = '${expectedCode}'
    `));
    return res.rows.length > 0;
  } catch {
    return false;
  }
}

interface SchemaOperation {
  name: string;
  check: () => Promise<boolean>;
  execute: () => Promise<any>;
}

export async function ensureSchemaModifications() {
  logger.info("Checking for missing schema modifications...");

  const operations: SchemaOperation[] = [
    {
      name: "Add competency_scores to quiz_attempts",
      check: () => columnExists("quiz_attempts", "competency_scores"),
      execute: () => db.execute(sql`ALTER TABLE "quiz_attempts" ADD COLUMN IF NOT EXISTS "competency_scores" jsonb;`)
    },
    {
      name: "Add competency_area to quiz_questions",
      check: () => columnExists("quiz_questions", "competency_area"),
      execute: () => db.execute(sql`ALTER TABLE "quiz_questions" ADD COLUMN IF NOT EXISTS "competency_area" text;`)
    },
    {
      name: "Add source_course_id to quiz_questions",
      check: () => columnExists("quiz_questions", "source_course_id"),
      execute: () => db.execute(sql`ALTER TABLE "quiz_questions" ADD COLUMN IF NOT EXISTS "source_course_id" integer;`)
    },
    {
      name: "Add learning_outcome to quiz_questions",
      check: () => columnExists("quiz_questions", "learning_outcome"),
      execute: () => db.execute(sql`ALTER TABLE "quiz_questions" ADD COLUMN IF NOT EXISTS "learning_outcome" text;`)
    },
    {
      name: "Add certificate_title to certificates",
      check: () => columnExists("certificates", "certificate_title"),
      execute: () => db.execute(sql`ALTER TABLE "certificates" ADD COLUMN IF NOT EXISTS "certificate_title" text;`)
    },
    {
      name: "Add level to learning_paths",
      check: () => columnExists("learning_paths", "level"),
      execute: () => db.execute(sql`ALTER TABLE "learning_paths" ADD COLUMN IF NOT EXISTS "level" text DEFAULT 'beginner' NOT NULL;`)
    },
    {
      name: "Add provider_label to learning_paths",
      check: () => columnExists("learning_paths", "provider_label"),
      execute: () => db.execute(sql`ALTER TABLE "learning_paths" ADD COLUMN IF NOT EXISTS "provider_label" text DEFAULT 'EcoLearnHub' NOT NULL;`)
    },
    {
      name: "Add is_system_managed to learning_paths",
      check: () => columnExists("learning_paths", "is_system_managed"),
      execute: () => db.execute(sql`ALTER TABLE "learning_paths" ADD COLUMN IF NOT EXISTS "is_system_managed" boolean DEFAULT true NOT NULL;`)
    },
    {
      name: "Add company_id to learning_paths",
      check: () => columnExists("learning_paths", "company_id"),
      execute: () => db.execute(sql`ALTER TABLE "learning_paths" ADD COLUMN IF NOT EXISTS "company_id" integer;`)
    },
    {
      name: "Add course_code to courses",
      check: () => columnExists("courses", "course_code"),
      execute: () => db.execute(sql`ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "course_code" text;`)
    },
    {
      name: "Backfill course code ELH-01",
      check: () => courseCodeExists("sustainability-foundations", "ELH-01"),
      execute: () => db.execute(sql`UPDATE "courses" SET "course_code" = 'ELH-01' WHERE "slug" = 'sustainability-foundations';`)
    },
    {
      name: "Backfill course code ELH-02",
      check: () => courseCodeExists("waste-sorting", "ELH-02"),
      execute: () => db.execute(sql`UPDATE "courses" SET "course_code" = 'ELH-02' WHERE "slug" IN ('waste-sorting', 'waste-sorting-mauritian-bin-system');`)
    },
    {
      name: "Backfill course code ELH-03",
      check: () => courseCodeExists("energy-efficiency-at-work", "ELH-03"),
      execute: () => db.execute(sql`UPDATE "courses" SET "course_code" = 'ELH-03' WHERE "slug" = 'energy-efficiency-at-work';`)
    },
    {
      name: "Backfill course code ELH-04",
      check: () => courseCodeExists("water-conservation", "ELH-04"),
      execute: () => db.execute(sql`UPDATE "courses" SET "course_code" = 'ELH-04' WHERE "slug" = 'water-conservation';`)
    },
    {
      name: "Backfill course code ELH-05",
      check: () => courseCodeExists("sustainable-procurement", "ELH-05"),
      execute: () => db.execute(sql`UPDATE "courses" SET "course_code" = 'ELH-05' WHERE "slug" = 'sustainable-procurement';`)
    },
    {
      name: "Backfill course code ELH-06",
      check: () => courseCodeExists("green-office-practices", "ELH-06"),
      execute: () => db.execute(sql`UPDATE "courses" SET "course_code" = 'ELH-06' WHERE "slug" = 'green-office-practices';`)
    },
    {
      name: "Backfill course code ELH-07",
      check: () => courseCodeExists("carbon-footprint-awareness", "ELH-07"),
      execute: () => db.execute(sql`UPDATE "courses" SET "course_code" = 'ELH-07' WHERE "slug" = 'carbon-footprint-awareness';`)
    },
    {
      name: "Backfill course code ELH-08",
      check: () => courseCodeExists("biodiversity-in-mauritius", "ELH-08"),
      execute: () => db.execute(sql`UPDATE "courses" SET "course_code" = 'ELH-08' WHERE "slug" = 'biodiversity-in-mauritius';`)
    },
    {
      name: "Backfill course code ELH-09",
      check: () => courseCodeExists("esg-basics", "ELH-09"),
      execute: () => db.execute(sql`UPDATE "courses" SET "course_code" = 'ELH-09' WHERE "slug" = 'esg-basics';`)
    },
    {
      name: "Backfill course code ELH-10",
      check: () => courseCodeExists("environmental-compliance", "ELH-10"),
      execute: () => db.execute(sql`UPDATE "courses" SET "course_code" = 'ELH-10' WHERE "slug" = 'environmental-compliance';`)
    },
    {
      name: "Backfill course code ELH-11",
      check: () => courseCodeExists("circular-economy", "ELH-11"),
      execute: () => db.execute(sql`UPDATE "courses" SET "course_code" = 'ELH-11' WHERE "slug" = 'circular-economy';`)
    },
    {
      name: "Backfill course code ELH-12",
      check: () => courseCodeExists("final-sustainability-certification", "ELH-12"),
      execute: () => db.execute(sql`UPDATE "courses" SET "course_code" = 'ELH-12' WHERE "slug" = 'final-sustainability-certification';`)
    },
    {
      name: "Add code to challenges",
      check: () => columnExists("challenges", "code"),
      execute: () => db.execute(sql`ALTER TABLE "challenges" ADD COLUMN IF NOT EXISTS "code" text;`)
    },
    {
      name: "Add summary to challenges",
      check: () => columnExists("challenges", "summary"),
      execute: () => db.execute(sql`ALTER TABLE "challenges" ADD COLUMN IF NOT EXISTS "summary" text DEFAULT '' NOT NULL;`)
    },
    {
      name: "Add category to challenges",
      check: () => columnExists("challenges", "category"),
      execute: () => db.execute(sql`ALTER TABLE "challenges" ADD COLUMN IF NOT EXISTS "category" text DEFAULT '' NOT NULL;`)
    },
    {
      name: "Add linked_course_id to challenges",
      check: () => columnExists("challenges", "linked_course_id"),
      execute: () => db.execute(sql`ALTER TABLE "challenges" ADD COLUMN IF NOT EXISTS "linked_course_id" integer;`)
    },
    {
      name: "Add duration_label to challenges",
      check: () => columnExists("challenges", "duration_label"),
      execute: () => db.execute(sql`ALTER TABLE "challenges" ADD COLUMN IF NOT EXISTS "duration_label" text DEFAULT '' NOT NULL;`)
    },
    {
      name: "Add instructions to challenges",
      check: () => columnExists("challenges", "instructions"),
      execute: () => db.execute(sql`ALTER TABLE "challenges" ADD COLUMN IF NOT EXISTS "instructions" text DEFAULT '' NOT NULL;`)
    },
    {
      name: "Add evidence_prompt to challenges",
      check: () => columnExists("challenges", "evidence_prompt"),
      execute: () => db.execute(sql`ALTER TABLE "challenges" ADD COLUMN IF NOT EXISTS "evidence_prompt" text DEFAULT '' NOT NULL;`)
    },
    {
      name: "Add is_active to challenges",
      check: () => columnExists("challenges", "is_active"),
      execute: () => db.execute(sql`ALTER TABLE "challenges" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true NOT NULL;`)
    },
    {
      name: "Add created_at to challenges",
      check: () => columnExists("challenges", "created_at"),
      execute: () => db.execute(sql`ALTER TABLE "challenges" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;`)
    },
    {
      name: "Add updated_at to challenges",
      check: () => columnExists("challenges", "updated_at"),
      execute: () => db.execute(sql`ALTER TABLE "challenges" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;`)
    },
    {
      name: "Add company_id to challenge_participants",
      check: () => columnExists("challenge_participants", "company_id"),
      execute: () => db.execute(sql`ALTER TABLE "challenge_participants" ADD COLUMN IF NOT EXISTS "company_id" integer;`)
    },
    {
      name: "Add status to challenge_participants",
      check: () => columnExists("challenge_participants", "status"),
      execute: () => db.execute(sql`ALTER TABLE "challenge_participants" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'in_progress' NOT NULL;`)
    },
    {
      name: "Add evidence_text to challenge_participants",
      check: () => columnExists("challenge_participants", "evidence_text"),
      execute: () => db.execute(sql`ALTER TABLE "challenge_participants" ADD COLUMN IF NOT EXISTS "evidence_text" text;`)
    },
    {
      name: "Add submitted_at to challenge_participants",
      check: () => columnExists("challenge_participants", "submitted_at"),
      execute: () => db.execute(sql`ALTER TABLE "challenge_participants" ADD COLUMN IF NOT EXISTS "submitted_at" timestamp with time zone;`)
    },
    {
      name: "Add reviewed_at to challenge_participants",
      check: () => columnExists("challenge_participants", "reviewed_at"),
      execute: () => db.execute(sql`ALTER TABLE "challenge_participants" ADD COLUMN IF NOT EXISTS "reviewed_at" timestamp with time zone;`)
    },
    {
      name: "Add reviewed_by to challenge_participants",
      check: () => columnExists("challenge_participants", "reviewed_by"),
      execute: () => db.execute(sql`ALTER TABLE "challenge_participants" ADD COLUMN IF NOT EXISTS "reviewed_by" text;`)
    },
    {
      name: "Add review_note to challenge_participants",
      check: () => columnExists("challenge_participants", "review_note"),
      execute: () => db.execute(sql`ALTER TABLE "challenge_participants" ADD COLUMN IF NOT EXISTS "review_note" text;`)
    },
    {
      name: "Add points_awarded to challenge_participants",
      check: () => columnExists("challenge_participants", "points_awarded"),
      execute: () => db.execute(sql`ALTER TABLE "challenge_participants" ADD COLUMN IF NOT EXISTS "points_awarded" integer DEFAULT 0 NOT NULL;`)
    },
    {
      name: "Add created_at to challenge_participants",
      check: () => columnExists("challenge_participants", "created_at"),
      execute: () => db.execute(sql`ALTER TABLE "challenge_participants" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;`)
    },
    {
      name: "Add updated_at to challenge_participants",
      check: () => columnExists("challenge_participants", "updated_at"),
      execute: () => db.execute(sql`ALTER TABLE "challenge_participants" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;`)
    },
    {
      name: "Add code to badge_definitions",
      check: () => columnExists("badge_definitions", "code"),
      execute: () => db.execute(sql`ALTER TABLE "badge_definitions" ADD COLUMN IF NOT EXISTS "code" text;`)
    },
    {
      name: "Create employee_badges table",
      check: () => tableExists("employee_badges"),
      execute: () => db.execute(sql`
        CREATE TABLE IF NOT EXISTS "employee_badges" (
          "id" serial PRIMARY KEY,
          "employee_id" integer NOT NULL,
          "company_id" integer NOT NULL,
          "badge_id" integer NOT NULL,
          "earned_at" timestamp with time zone NOT NULL DEFAULT now(),
          "award_source" text NOT NULL
        );
      `)
    },
    {
      name: "Add linked_resource_slugs to blog_posts",
      check: () => columnExists("blog_posts", "linked_resource_slugs"),
      execute: () => db.execute(sql`ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "linked_resource_slugs" text[] DEFAULT '{}'::text[] NOT NULL;`)
    },
    {
      name: "Add last_verified_at to blog_posts",
      check: () => columnExists("blog_posts", "last_verified_at"),
      execute: () => db.execute(sql`ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "last_verified_at" timestamp with time zone DEFAULT now() NOT NULL;`)
    },
    {
      name: "Add next_review_at to blog_posts",
      check: () => columnExists("blog_posts", "next_review_at"),
      execute: () => db.execute(sql`ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "next_review_at" timestamp with time zone;`)
    },
    {
      name: "Add legal_status to mauritius_resources",
      check: () => columnExists("mauritius_resources", "legal_status"),
      execute: () => db.execute(sql`ALTER TABLE "mauritius_resources" ADD COLUMN IF NOT EXISTS "legal_status" text DEFAULT 'active' NOT NULL;`)
    },
    {
      name: "Add last_verified_at to mauritius_resources",
      check: () => columnExists("mauritius_resources", "last_verified_at"),
      execute: () => db.execute(sql`ALTER TABLE "mauritius_resources" ADD COLUMN IF NOT EXISTS "last_verified_at" timestamp with time zone DEFAULT now() NOT NULL;`)
    },
    {
      name: "Add next_review_at to mauritius_resources",
      check: () => columnExists("mauritius_resources", "next_review_at"),
      execute: () => db.execute(sql`ALTER TABLE "mauritius_resources" ADD COLUMN IF NOT EXISTS "next_review_at" timestamp with time zone;`)
    },
    {
      name: "Add display_order to categories",
      check: () => columnExists("categories", "display_order"),
      execute: () => db.execute(sql`ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "display_order" integer DEFAULT 0 NOT NULL;`)
    },
    {
      name: "Add is_visible to categories",
      check: () => columnExists("categories", "is_visible"),
      execute: () => db.execute(sql`ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "is_visible" boolean DEFAULT true NOT NULL;`)
    },
    {
      name: "Add updated_at to categories",
      check: () => columnExists("categories", "updated_at"),
      execute: () => db.execute(sql`ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;`)
    },
    {
      name: "Add requirement_type to course_prerequisites",
      check: () => columnExists("course_prerequisites", "requirement_type"),
      execute: () => db.execute(sql`ALTER TABLE "course_prerequisites" ADD COLUMN IF NOT EXISTS "requirement_type" text DEFAULT 'required' NOT NULL;`)
    },
    {
      name: "Create course_category_assignments table",
      check: () => tableExists("course_category_assignments"),
      execute: () => db.execute(sql`
        CREATE TABLE IF NOT EXISTS "course_category_assignments" (
          "id" serial PRIMARY KEY,
          "course_id" integer NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
          "category_id" integer NOT NULL REFERENCES "categories"("id") ON DELETE CASCADE,
          "display_order" integer DEFAULT 0 NOT NULL,
          "is_primary" boolean DEFAULT false NOT NULL,
          "created_at" timestamp with time zone DEFAULT now() NOT NULL,
          CONSTRAINT "unique_course_category" UNIQUE("course_id", "category_id")
        );
      `)
    },
    {
      name: "Create subscription_plans table",
      check: () => tableExists("subscription_plans"),
      execute: () => db.execute(sql`
        CREATE TABLE IF NOT EXISTS "subscription_plans" (
          "id" serial PRIMARY KEY,
          "code" text NOT NULL UNIQUE,
          "name" text NOT NULL,
          "description" text NOT NULL,
          "tagline" text,
          "display_order" integer DEFAULT 0 NOT NULL,
          "is_active" boolean DEFAULT true NOT NULL,
          "is_public" boolean DEFAULT true NOT NULL,
          "created_at" timestamp with time zone DEFAULT now() NOT NULL,
          "updated_at" timestamp with time zone DEFAULT now() NOT NULL
        );
      `)
    },
    {
      name: "Create employee_bands table",
      check: () => tableExists("employee_bands"),
      execute: () => db.execute(sql`
        CREATE TABLE IF NOT EXISTS "employee_bands" (
          "id" serial PRIMARY KEY,
          "code" text NOT NULL UNIQUE,
          "label" text NOT NULL,
          "minimum_employees" integer NOT NULL,
          "maximum_employees" integer,
          "display_order" integer DEFAULT 0 NOT NULL,
          "requires_tailored_quote" boolean DEFAULT false NOT NULL,
          "is_active" boolean DEFAULT true NOT NULL,
          "created_at" timestamp with time zone DEFAULT now() NOT NULL
        );
      `)
    },
    {
      name: "Create plan_prices table",
      check: () => tableExists("plan_prices"),
      execute: () => db.execute(sql`
        CREATE TABLE IF NOT EXISTS "plan_prices" (
          "id" serial PRIMARY KEY,
          "subscription_plan_id" integer NOT NULL REFERENCES "subscription_plans"("id") ON DELETE CASCADE,
          "employee_band_id" integer NOT NULL REFERENCES "employee_bands"("id") ON DELETE CASCADE,
          "currency" text DEFAULT 'MUR' NOT NULL,
          "monthly_amount" numeric(10,2),
          "requires_tailored_quote" boolean DEFAULT false NOT NULL,
          "is_active" boolean DEFAULT true NOT NULL,
          "effective_from" timestamp with time zone DEFAULT now() NOT NULL,
          "effective_until" timestamp with time zone,
          "created_at" timestamp with time zone DEFAULT now() NOT NULL,
          "updated_at" timestamp with time zone DEFAULT now() NOT NULL
        );
      `)
    },
    {
      name: "Create plan_course_entitlements table",
      check: () => tableExists("plan_course_entitlements"),
      execute: () => db.execute(sql`
        CREATE TABLE IF NOT EXISTS "plan_course_entitlements" (
          "id" serial PRIMARY KEY,
          "subscription_plan_id" integer NOT NULL REFERENCES "subscription_plans"("id") ON DELETE CASCADE,
          "course_id" integer NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
          "access_type" text DEFAULT 'INCLUDED' NOT NULL,
          "created_at" timestamp with time zone DEFAULT now() NOT NULL,
          CONSTRAINT "unique_plan_course" UNIQUE("subscription_plan_id", "course_id")
        );
      `)
    },
    {
      name: "Create plan_feature_entitlements table",
      check: () => tableExists("plan_feature_entitlements"),
      execute: () => db.execute(sql`
        CREATE TABLE IF NOT EXISTS "plan_feature_entitlements" (
          "id" serial PRIMARY KEY,
          "subscription_plan_id" integer NOT NULL REFERENCES "subscription_plans"("id") ON DELETE CASCADE,
          "feature_code" text NOT NULL,
          "is_enabled" boolean DEFAULT true NOT NULL,
          "limits_json" text,
          "created_at" timestamp with time zone DEFAULT now() NOT NULL,
          CONSTRAINT "unique_plan_feature" UNIQUE("subscription_plan_id", "feature_code")
        );
      `)
    },
    {
      name: "Create company_subscriptions table",
      check: () => tableExists("company_subscriptions"),
      execute: () => db.execute(sql`
        CREATE TABLE IF NOT EXISTS "company_subscriptions" (
          "id" serial PRIMARY KEY,
          "company_id" integer NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
          "subscription_plan_id" integer NOT NULL REFERENCES "subscription_plans"("id") ON DELETE CASCADE,
          "employee_band_id" integer NOT NULL REFERENCES "employee_bands"("id") ON DELETE CASCADE,
          "status" text DEFAULT 'ACTIVE' NOT NULL,
          "currency" text DEFAULT 'MUR' NOT NULL,
          "agreed_monthly_amount" numeric(10,2),
          "pricing_source" text DEFAULT 'STANDARD' NOT NULL,
          "starts_at" timestamp with time zone DEFAULT now() NOT NULL,
          "current_period_starts_at" timestamp with time zone,
          "current_period_ends_at" timestamp with time zone,
          "cancelled_at" timestamp with time zone,
          "access_ends_at" timestamp with time zone,
          "created_at" timestamp with time zone DEFAULT now() NOT NULL,
          "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
          CONSTRAINT "unique_company_subscription" UNIQUE("company_id")
        );
      `)
    },
    {
      name: "Ensure unique_company_subscription constraint",
      check: () => constraintExists("unique_company_subscription"),
      execute: async () => {
        await detectAndResolveDuplicateCompanySubscriptions();
        await db.execute(sql`
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_constraint WHERE conname = 'unique_company_subscription'
            ) AND NOT EXISTS (
              SELECT 1 FROM pg_class WHERE relname = 'unique_company_subscription'
            ) THEN
              ALTER TABLE "company_subscriptions" ADD CONSTRAINT "unique_company_subscription" UNIQUE("company_id");
            END IF;
          END $$;
        `);
      }
    },
    {
      name: "Ensure employees table status column",
      check: async () => await columnExists("employees", "status"),
      execute: async () => {
        await db.execute(sql`ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "status" text NOT NULL DEFAULT 'active';`);
      }
    },
    {
      name: "Ensure departments table",
      check: async () => await tableExists("departments"),
      execute: async () => {
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS "departments" (
            "id" serial PRIMARY KEY,
            "company_id" integer NOT NULL,
            "name" text NOT NULL,
            "code" text,
            "status" text NOT NULL DEFAULT 'active',
            "manager_employee_id" integer,
            "created_at" timestamp with time zone NOT NULL DEFAULT now(),
            "updated_at" timestamp with time zone NOT NULL DEFAULT now()
          );
        `);
      }
    },
    {
      name: "Ensure audit_logs table",
      check: async () => await tableExists("audit_logs"),
      execute: async () => {
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS "audit_logs" (
            "id" serial PRIMARY KEY,
            "company_id" integer NOT NULL,
            "actor_user_id" text NOT NULL,
            "actor_role" text NOT NULL,
            "action" text NOT NULL,
            "target_type" text NOT NULL,
            "target_id" text,
            "metadata" text,
            "created_at" timestamp with time zone NOT NULL DEFAULT now()
          );
        `);
      }
    },
    {
      name: "Ensure notification_delivery_logs table",
      check: async () => await tableExists("notification_delivery_logs"),
      execute: async () => {
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS "notification_delivery_logs" (
            "id" serial PRIMARY KEY,
            "company_id" integer NOT NULL,
            "employee_id" integer,
            "user_id" text,
            "assignment_id" integer,
            "notification_type" text NOT NULL,
            "channel" text NOT NULL DEFAULT 'email',
            "recipient" text NOT NULL,
            "deduplication_key" text NOT NULL UNIQUE,
            "scheduled_for" timestamp with time zone,
            "attempted_at" timestamp with time zone,
            "delivered_at" timestamp with time zone,
            "status" text NOT NULL DEFAULT 'pending',
            "retry_count" integer NOT NULL DEFAULT 0,
            "failure_code" text,
            "failure_message" text,
            "provider_message_id" text,
            "created_at" timestamp with time zone NOT NULL DEFAULT now(),
            "updated_at" timestamp with time zone NOT NULL DEFAULT now()
          );
        `);
      }
    },
    {
      name: "Ensure notification_preferences table",
      check: async () => await tableExists("notification_preferences"),
      execute: async () => {
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS "notification_preferences" (
            "id" serial PRIMARY KEY,
            "company_id" integer NOT NULL,
            "employee_id" integer,
            "user_id" text,
            "optional_engagement_reminders" boolean NOT NULL DEFAULT true,
            "updated_at" timestamp with time zone NOT NULL DEFAULT now()
          );
        `);
      }
    },
    {
      name: "Ensure training_interventions table",
      check: async () => await tableExists("training_interventions"),
      execute: async () => {
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS "training_interventions" (
            "id" serial PRIMARY KEY,
            "company_id" integer NOT NULL,
            "employee_id" integer NOT NULL,
            "assignment_id" integer,
            "intervention_type" text NOT NULL,
            "status" text NOT NULL DEFAULT 'pending',
            "initiated_by_user_id" text NOT NULL,
            "initiated_at" timestamp with time zone NOT NULL DEFAULT now(),
            "completed_at" timestamp with time zone,
            "due_at" timestamp with time zone,
            "reason_code" text,
            "internal_note" text,
            "related_notification_log_id" integer,
            "outcome_code" text,
            "created_at" timestamp with time zone NOT NULL DEFAULT now(),
            "updated_at" timestamp with time zone NOT NULL DEFAULT now()
          );
        `);
      }
    },
    {
      name: "Ensure learner_commitments table",
      check: async () => await tableExists("learner_commitments"),
      execute: async () => {
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS "learner_commitments" (
            "id" serial PRIMARY KEY,
            "company_id" integer NOT NULL,
            "employee_id" integer NOT NULL,
            "course_id" integer NOT NULL,
            "course_version" integer NOT NULL DEFAULT 1,
            "enrollment_id" integer,
            "commitment_type" text NOT NULL DEFAULT 'suggested',
            "commitment_text" text NOT NULL,
            "target_date" timestamp with time zone,
            "status" text NOT NULL DEFAULT 'planned',
            "completed_at" timestamp with time zone,
            "learner_reflection" text,
            "manager_confirmation_status" text NOT NULL DEFAULT 'unrequested',
            "manager_confirmed_by_user_id" text,
            "manager_confirmed_at" timestamp with time zone,
            "created_at" timestamp with time zone NOT NULL DEFAULT now(),
            "updated_at" timestamp with time zone NOT NULL DEFAULT now()
          );
        `);
      }
    },
    {
      name: "Ensure pilot_companies table",
      check: () => tableExists("pilot_companies"),
      execute: async () => {
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS "pilot_companies" (
            "id" serial PRIMARY KEY,
            "company_id" integer NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
            "pilot_status" text NOT NULL DEFAULT 'candidate',
            "pilot_stage" text NOT NULL DEFAULT 'initial_contact',
            "approved_by_user_id" text,
            "approved_at" timestamp with time zone,
            "planned_start_date" timestamp with time zone,
            "actual_start_date" timestamp with time zone,
            "planned_end_date" timestamp with time zone,
            "actual_end_date" timestamp with time zone,
            "target_learner_count" integer NOT NULL DEFAULT 20,
            "approved_learner_limit" integer NOT NULL DEFAULT 50,
            "selected_course_ids" integer[] NOT NULL DEFAULT '{}',
            "primary_contact_name" text,
            "primary_contact_email" text,
            "internal_owner_user_id" text,
            "created_at" timestamp with time zone NOT NULL DEFAULT now(),
            "updated_at" timestamp with time zone NOT NULL DEFAULT now()
          );
        `);
      }
    },
    {
      name: "Ensure pilot_learning_plans table",
      check: () => tableExists("pilot_learning_plans"),
      execute: async () => {
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS "pilot_learning_plans" (
            "id" serial PRIMARY KEY,
            "pilot_company_id" integer NOT NULL,
            "company_id" integer NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
            "name" text NOT NULL,
            "description" text,
            "course_ids" integer[] NOT NULL DEFAULT '{}',
            "required_course_ids" integer[] NOT NULL DEFAULT '{}',
            "default_due_days" integer NOT NULL DEFAULT 30,
            "commitment_enabled" boolean NOT NULL DEFAULT true,
            "created_by_user_id" text,
            "created_at" timestamp with time zone NOT NULL DEFAULT now()
          );
        `);
      }
    },
    {
      name: "Ensure pilot_feedback_responses table",
      check: () => tableExists("pilot_feedback_responses"),
      execute: async () => {
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS "pilot_feedback_responses" (
            "id" serial PRIMARY KEY,
            "pilot_company_id" integer,
            "company_id" integer NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
            "respondent_user_id" text NOT NULL,
            "respondent_role" text NOT NULL DEFAULT 'learner',
            "feedback_stage" text NOT NULL DEFAULT 'midpoint',
            "overall_rating" integer NOT NULL DEFAULT 5,
            "ease_of_use_rating" integer NOT NULL DEFAULT 5,
            "content_relevance_rating" integer NOT NULL DEFAULT 5,
            "reporting_usefulness_rating" integer,
            "free_text_feedback" text,
            "consent_for_follow_up" boolean NOT NULL DEFAULT false,
            "submitted_at" timestamp with time zone NOT NULL DEFAULT now()
          );
        `);
      }
    },
    {
      name: "Ensure pilot_issues table",
      check: () => tableExists("pilot_issues"),
      execute: async () => {
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS "pilot_issues" (
            "id" serial PRIMARY KEY,
            "pilot_company_id" integer,
            "company_id" integer NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
            "reported_by_user_id" text NOT NULL,
            "issue_type" text NOT NULL DEFAULT 'content',
            "severity" text NOT NULL DEFAULT 'medium',
            "status" text NOT NULL DEFAULT 'new',
            "title" text NOT NULL,
            "description" text,
            "affected_course_id" integer,
            "assigned_owner_user_id" text,
            "reported_at" timestamp with time zone NOT NULL DEFAULT now(),
            "resolved_at" timestamp with time zone,
            "resolution_summary" text,
            "release_blocking" boolean NOT NULL DEFAULT false,
            "created_at" timestamp with time zone NOT NULL DEFAULT now()
          );
        `);
      }
    }
  ];

  await detectAndResolveDuplicateCompanySubscriptions();

  const summary = {
    checked: 0,
    applied: 0,
    alreadyPresent: 0,
    skipped: 0,
    failed: 0,
  };

  for (const op of operations) {
    summary.checked++;
    try {
      const present = await op.check();
      if (present) {
        summary.alreadyPresent++;
      } else {
        await op.execute();
        summary.applied++;
        logger.info(`Schema modification applied: ${op.name}`);
      }
    } catch (e: any) {
      summary.failed++;
      logger.error({ err: e }, `Failed to execute schema modification: ${op.name}. Error: ${e.message}`);
    }
  }

  logger.info(summary, "Schema modifications check completed");

  if (summary.failed > 0) {
    throw new Error("One or more schema modifications failed to execute.");
  }
}
