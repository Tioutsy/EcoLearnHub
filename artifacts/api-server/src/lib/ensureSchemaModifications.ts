import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./logger";

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
    }
  ];

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
