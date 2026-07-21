import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./logger";

export async function ensureSchemaModifications() {
  logger.info("Checking for missing schema modifications...");

  const queries = [
    `ALTER TABLE "quiz_attempts" ADD COLUMN IF NOT EXISTS "competency_scores" jsonb;`,
    `ALTER TABLE "quiz_questions" ADD COLUMN IF NOT EXISTS "competency_area" text;`,
    `ALTER TABLE "quiz_questions" ADD COLUMN IF NOT EXISTS "source_course_id" integer;`,
    `ALTER TABLE "quiz_questions" ADD COLUMN IF NOT EXISTS "learning_outcome" text;`,
    `ALTER TABLE "certificates" ADD COLUMN IF NOT EXISTS "certificate_title" text;`,
    `ALTER TABLE "learning_paths" ADD COLUMN IF NOT EXISTS "level" text DEFAULT 'beginner' NOT NULL;`,
    `ALTER TABLE "learning_paths" ADD COLUMN IF NOT EXISTS "provider_label" text DEFAULT 'EcoLearnHub' NOT NULL;`,
    `ALTER TABLE "learning_paths" ADD COLUMN IF NOT EXISTS "is_system_managed" boolean DEFAULT true NOT NULL;`,
    `ALTER TABLE "learning_paths" ADD COLUMN IF NOT EXISTS "company_id" integer;`,
    `ALTER TABLE "learning_paths" ADD CONSTRAINT "learning_paths_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE cascade ON UPDATE no action;`,
    `ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "course_code" text;`,
    `UPDATE "courses" SET "course_code" = 'ELH-01' WHERE "slug" = 'sustainability-foundations';`,
    `UPDATE "courses" SET "course_code" = 'ELH-02' WHERE "slug" IN ('waste-sorting', 'waste-sorting-mauritian-bin-system');`,
    `UPDATE "courses" SET "course_code" = 'ELH-03' WHERE "slug" = 'energy-efficiency-at-work';`,
    `UPDATE "courses" SET "course_code" = 'ELH-04' WHERE "slug" = 'water-conservation';`,
    `UPDATE "courses" SET "course_code" = 'ELH-05' WHERE "slug" = 'sustainable-procurement';`,
    `UPDATE "courses" SET "course_code" = 'ELH-06' WHERE "slug" = 'green-office-practices';`,
    `UPDATE "courses" SET "course_code" = 'ELH-07' WHERE "slug" = 'carbon-footprint-awareness';`,
    `UPDATE "courses" SET "course_code" = 'ELH-08' WHERE "slug" = 'biodiversity-in-mauritius';`,
    `UPDATE "courses" SET "course_code" = 'ELH-09' WHERE "slug" = 'esg-basics';`,
    `UPDATE "courses" SET "course_code" = 'ELH-10' WHERE "slug" = 'environmental-compliance';`,
    `UPDATE "courses" SET "course_code" = 'ELH-11' WHERE "slug" = 'circular-economy';`,
    `UPDATE "courses" SET "course_code" = 'ELH-12' WHERE "slug" = 'final-sustainability-certification';`,
    `ALTER TABLE "courses" DROP CONSTRAINT IF EXISTS "courses_course_code_unique";`,
    `ALTER TABLE "courses" ADD CONSTRAINT "courses_course_code_unique" UNIQUE("course_code");`,

    // Challenges extensions schema modifications (Sprint 6C)
    `ALTER TABLE "challenges" ADD COLUMN IF NOT EXISTS "code" text;`,
    `ALTER TABLE "challenges" ADD COLUMN IF NOT EXISTS "summary" text DEFAULT '' NOT NULL;`,
    `ALTER TABLE "challenges" ADD COLUMN IF NOT EXISTS "category" text DEFAULT '' NOT NULL;`,
    `ALTER TABLE "challenges" ADD COLUMN IF NOT EXISTS "linked_course_id" integer;`,
    `ALTER TABLE "challenges" ADD CONSTRAINT "challenges_linked_course_id_fk" FOREIGN KEY ("linked_course_id") REFERENCES "courses"("id") ON DELETE SET NULL;`,
    `ALTER TABLE "challenges" ADD COLUMN IF NOT EXISTS "duration_label" text DEFAULT '' NOT NULL;`,
    `ALTER TABLE "challenges" ADD COLUMN IF NOT EXISTS "instructions" text DEFAULT '' NOT NULL;`,
    `ALTER TABLE "challenges" ADD COLUMN IF NOT EXISTS "evidence_prompt" text DEFAULT '' NOT NULL;`,
    `ALTER TABLE "challenges" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true NOT NULL;`,
    `ALTER TABLE "challenges" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;`,
    `ALTER TABLE "challenges" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;`,
    `ALTER TABLE "challenges" ADD CONSTRAINT "challenges_code_key" UNIQUE ("code");`,

    `ALTER TABLE "challenge_participants" ADD COLUMN IF NOT EXISTS "company_id" integer;`,
    `ALTER TABLE "challenge_participants" ADD CONSTRAINT "challenge_participants_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE;`,
    `ALTER TABLE "challenge_participants" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'in_progress' NOT NULL;`,
    `ALTER TABLE "challenge_participants" ADD COLUMN IF NOT EXISTS "evidence_text" text;`,
    `ALTER TABLE "challenge_participants" ADD COLUMN IF NOT EXISTS "submitted_at" timestamp with time zone;`,
    `ALTER TABLE "challenge_participants" ADD COLUMN IF NOT EXISTS "reviewed_at" timestamp with time zone;`,
    `ALTER TABLE "challenge_participants" ADD COLUMN IF NOT EXISTS "reviewed_by" text;`,
    `ALTER TABLE "challenge_participants" ADD COLUMN IF NOT EXISTS "review_note" text;`,
    `ALTER TABLE "challenge_participants" ADD COLUMN IF NOT EXISTS "points_awarded" integer DEFAULT 0 NOT NULL;`,
    `ALTER TABLE "challenge_participants" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;`,
    `ALTER TABLE "challenge_participants" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;`,

    `UPDATE "challenge_participants" SET "company_id" = 1 WHERE "company_id" IS NULL;`,
    `ALTER TABLE "challenge_participants" ALTER COLUMN "company_id" SET NOT NULL;`,

    `ALTER TABLE "challenge_participants" DROP CONSTRAINT IF EXISTS "challenge_participants_challenge_id_user_id_unique";`,
    `ALTER TABLE "challenge_participants" ADD CONSTRAINT "uniq_participant_company" UNIQUE ("challenge_id", "user_id", "company_id");`,
    `ALTER TABLE "challenge_participants" ADD CONSTRAINT "chk_status" CHECK ("status" IN ('in_progress', 'submitted', 'approved', 'rejected'));`,
    `ALTER TABLE "challenge_participants" ADD CONSTRAINT "chk_points_awarded" CHECK ("points_awarded" IN (0, 10));`,

    // Achievements extensions (Sprint 6D)
    `ALTER TABLE "badge_definitions" ADD COLUMN IF NOT EXISTS "code" text;`,
    `UPDATE "badge_definitions" SET "code" = 'COURSE_ELH_01_COMPLETE' WHERE "slug" IN ('sustainability-starter', 'sustainability-champion', 'sustainability-foundations');`,
    `UPDATE "badge_definitions" SET "code" = 'COURSE_ELH_02_COMPLETE' WHERE "slug" IN ('sorting-champion', 'waste-warrior', 'waste-sorting');`,
    `UPDATE "badge_definitions" SET "code" = 'COURSE_ELH_03_COMPLETE' WHERE "slug" IN ('energy-saver', 'energy-efficiency-at-work');`,
    `UPDATE "badge_definitions" SET "code" = 'COURSE_ELH_04_COMPLETE' WHERE "slug" IN ('water-wise-at-work', 'water-conservation');`,
    `UPDATE "badge_definitions" SET "code" = 'COURSE_ELH_05_COMPLETE' WHERE "slug" IN ('responsible-purchasing', 'sustainable-procurement-badge', 'sustainable-procurement-champion', 'sustainable-procurement');`,
    `UPDATE "badge_definitions" SET "code" = 'COURSE_ELH_06_COMPLETE' WHERE "slug" IN ('green-office-champion', 'green-office-practitioner', 'green-office-practices');`,
    `UPDATE "badge_definitions" SET "code" = 'COURSE_ELH_07_COMPLETE' WHERE "slug" IN ('carbon-aware', 'carbon-neutral-champion', 'carbon-footprint-awareness');`,
    `UPDATE "badge_definitions" SET "code" = 'COURSE_ELH_08_COMPLETE' WHERE "slug" IN ('biodiversity-aware', 'biodiversity-champion', 'biodiversity-in-mauritius');`,
    `UPDATE "badge_definitions" SET "code" = 'COURSE_ELH_09_COMPLETE' WHERE "slug" IN ('esg-fundamentals', 'esg-champion', 'esg-basics');`,
    `UPDATE "badge_definitions" SET "code" = 'COURSE_ELH_10_COMPLETE' WHERE "slug" IN ('compliance-aware', 'environmental-responsibility', 'environmental-compliance-champion', 'environmental-compliance');`,
    `UPDATE "badge_definitions" SET "code" = 'COURSE_ELH_11_COMPLETE' WHERE "slug" IN ('circular-economy-practitioner', 'circular-economy-badge', 'circular-economy-champion', 'circular-economy');`,
    `UPDATE "badge_definitions" SET "code" = 'COURSE_ELH_12_COMPLETE' WHERE "slug" IN ('core-sustainability-certified', 'final-sustainability-certification');`,
    `UPDATE "badge_definitions" SET "code" = UPPER(REPLACE("slug", '-', '_')) WHERE "code" IS NULL;`,
    `ALTER TABLE "badge_definitions" ADD CONSTRAINT "badge_definitions_code_key" UNIQUE ("code");`,

    `CREATE TABLE IF NOT EXISTS "employee_badges" (
      "id" serial PRIMARY KEY,
      "employee_id" integer NOT NULL,
      "company_id" integer NOT NULL,
      "badge_id" integer NOT NULL,
      "earned_at" timestamp with time zone NOT NULL DEFAULT now(),
      "award_source" text NOT NULL
    );`,
    `ALTER TABLE "employee_badges" ADD CONSTRAINT "employee_badges_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE;`,
    `ALTER TABLE "employee_badges" ADD CONSTRAINT "employee_badges_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE;`,
    `ALTER TABLE "employee_badges" ADD CONSTRAINT "employee_badges_badge_id_fk" FOREIGN KEY ("badge_id") REFERENCES "badge_definitions"("id") ON DELETE CASCADE;`,
    `ALTER TABLE "employee_badges" ADD CONSTRAINT "uniq_employee_badge" UNIQUE ("employee_id", "badge_id");`
  ];

  for (const q of queries) {
    try {
      await db.execute(sql.raw(q));
    } catch (e: any) {
      logger.warn(`Failed to execute schema modification: ${q}. Error: ${e.message}`);
    }
  }

  logger.info("Schema modifications applied successfully.");
}
