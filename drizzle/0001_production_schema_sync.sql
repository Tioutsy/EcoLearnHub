CREATE TABLE IF NOT EXISTS "system_seeds" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"run_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "system_seeds_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mauritius_resources" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"resource_type" text NOT NULL,
	"short_summary" text NOT NULL,
	"main_explanation" text NOT NULL,
	"official_name" text,
	"resource_number" text,
	"responsible_authority" text,
	"relevant_sector" text,
	"date_issued" timestamp with time zone,
	"effective_date" timestamp with time zone,
	"official_source_link" text,
	"downloadable_doc_link" text,
	"compliance_relevance" text,
	"practical_implications" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"disclaimer" text DEFAULT 'This content is provided for general educational purposes and does not constitute legal advice. Users should refer to the official legislation and seek professional advice where required.' NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"related_resources" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mauritius_resources_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "full_description" text;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "badge_name" text;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "badge_description" text;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "completion_message" text;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "is_archived" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "content_blocks" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN IF NOT EXISTS "completed_version" integer;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD COLUMN IF NOT EXISTS "course_version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD COLUMN IF NOT EXISTS "is_archived" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD COLUMN IF NOT EXISTS "correct_explanation" text;--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD COLUMN IF NOT EXISTS "incorrect_explanation" text;--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD COLUMN IF NOT EXISTS "option_feedback" text[];--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD COLUMN IF NOT EXISTS "practical_takeaway" text;--> statement-breakpoint
ALTER TABLE "certificates" ADD COLUMN IF NOT EXISTS "course_version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "course_commitments" ADD COLUMN IF NOT EXISTS "course_version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "course_commitments" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'selected' NOT NULL;
