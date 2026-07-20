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
    `ALTER TABLE "courses" ADD CONSTRAINT "courses_course_code_unique" UNIQUE("course_code");`
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
