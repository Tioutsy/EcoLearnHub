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
    `DO $$ BEGIN ALTER TABLE "learning_paths" ADD CONSTRAINT "learning_paths_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;`,
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
    `DO $$ BEGIN ALTER TABLE "challenges" ADD CONSTRAINT "challenges_linked_course_id_fk" FOREIGN KEY ("linked_course_id") REFERENCES "courses"("id") ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    `ALTER TABLE "challenges" ADD COLUMN IF NOT EXISTS "duration_label" text DEFAULT '' NOT NULL;`,
    `ALTER TABLE "challenges" ADD COLUMN IF NOT EXISTS "instructions" text DEFAULT '' NOT NULL;`,
    `ALTER TABLE "challenges" ADD COLUMN IF NOT EXISTS "evidence_prompt" text DEFAULT '' NOT NULL;`,
    `ALTER TABLE "challenges" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true NOT NULL;`,
    `ALTER TABLE "challenges" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;`,
    `ALTER TABLE "challenges" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;`,
    `DO $$ BEGIN ALTER TABLE "challenges" ADD CONSTRAINT "challenges_code_key" UNIQUE ("code"); EXCEPTION WHEN duplicate_object OR duplicate_table THEN null; END $$;`,

    `ALTER TABLE "challenge_participants" ADD COLUMN IF NOT EXISTS "company_id" integer;`,
    `DO $$ BEGIN ALTER TABLE "challenge_participants" ADD CONSTRAINT "challenge_participants_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;`,
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
    `DO $$ BEGIN ALTER TABLE "challenge_participants" ADD CONSTRAINT "uniq_participant_company" UNIQUE ("challenge_id", "user_id", "company_id"); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    `DO $$ BEGIN ALTER TABLE "challenge_participants" ADD CONSTRAINT "chk_status" CHECK ("status" IN ('in_progress', 'submitted', 'approved', 'rejected')); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    `DO $$ BEGIN ALTER TABLE "challenge_participants" ADD CONSTRAINT "chk_points_awarded" CHECK ("points_awarded" IN (0, 10)); EXCEPTION WHEN duplicate_object THEN null; END $$;`
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
