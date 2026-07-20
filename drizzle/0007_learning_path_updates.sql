ALTER TABLE "learning_paths" ADD COLUMN IF NOT EXISTS "level" text DEFAULT 'beginner' NOT NULL;
--> statement-breakpoint
ALTER TABLE "learning_paths" ADD COLUMN IF NOT EXISTS "provider_label" text DEFAULT 'EcoLearnHub' NOT NULL;
--> statement-breakpoint
ALTER TABLE "learning_paths" ADD COLUMN IF NOT EXISTS "is_system_managed" boolean DEFAULT true NOT NULL;
--> statement-breakpoint
ALTER TABLE "learning_paths" ADD COLUMN IF NOT EXISTS "company_id" integer;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "learning_paths" ADD CONSTRAINT "learning_paths_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "course_code" text;
--> statement-breakpoint
UPDATE "courses" SET "course_code" = 'ELH-01' WHERE "slug" = 'sustainability-foundations';
--> statement-breakpoint
UPDATE "courses" SET "course_code" = 'ELH-02' WHERE "slug" IN ('waste-sorting', 'waste-sorting-mauritian-bin-system');
--> statement-breakpoint
UPDATE "courses" SET "course_code" = 'ELH-03' WHERE "slug" = 'energy-efficiency-at-work';
--> statement-breakpoint
UPDATE "courses" SET "course_code" = 'ELH-04' WHERE "slug" = 'water-conservation';
--> statement-breakpoint
UPDATE "courses" SET "course_code" = 'ELH-05' WHERE "slug" = 'sustainable-procurement';
--> statement-breakpoint
UPDATE "courses" SET "course_code" = 'ELH-06' WHERE "slug" = 'green-office-practices';
--> statement-breakpoint
UPDATE "courses" SET "course_code" = 'ELH-07' WHERE "slug" = 'carbon-footprint-awareness';
--> statement-breakpoint
UPDATE "courses" SET "course_code" = 'ELH-08' WHERE "slug" = 'biodiversity-in-mauritius';
--> statement-breakpoint
UPDATE "courses" SET "course_code" = 'ELH-09' WHERE "slug" = 'esg-basics';
--> statement-breakpoint
UPDATE "courses" SET "course_code" = 'ELH-10' WHERE "slug" = 'environmental-compliance';
--> statement-breakpoint
UPDATE "courses" SET "course_code" = 'ELH-11' WHERE "slug" = 'circular-economy';
--> statement-breakpoint
UPDATE "courses" SET "course_code" = 'ELH-12' WHERE "slug" = 'final-sustainability-certification';
--> statement-breakpoint
ALTER TABLE "courses" DROP CONSTRAINT IF EXISTS "courses_course_code_unique";
--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_course_code_unique" UNIQUE("course_code");
