import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./logger";

export async function syncSequences(): Promise<void> {
  try {
    logger.info("Synchronizing database sequences...");
    await db.execute(sql`SELECT setval('courses_id_seq', COALESCE((SELECT MAX(id) + 1 FROM courses), 1), false);`);
    await db.execute(sql`SELECT setval('lessons_id_seq', COALESCE((SELECT MAX(id) + 1 FROM lessons), 1), false);`);
    await db.execute(sql`SELECT setval('quiz_questions_id_seq', COALESCE((SELECT MAX(id) + 1 FROM quiz_questions), 1), false);`);
    await db.execute(sql`SELECT setval('categories_id_seq', COALESCE((SELECT MAX(id) + 1 FROM categories), 1), false);`);
    logger.info("Sequences synchronized successfully.");
  } catch (err) {
    logger.error({ err }, "Failed to synchronize sequences. Proceeding anyway...");
  }
}
