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
    `ALTER TABLE "certificates" ADD COLUMN IF NOT EXISTS "certificate_title" text;`
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
