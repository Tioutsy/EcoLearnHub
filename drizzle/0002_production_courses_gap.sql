ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "is_mandatory" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "validity_months" integer;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "intended_roles" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "review_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "recommended_next_course_id" integer;--> statement-breakpoint

ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "duration_minutes" integer DEFAULT 10 NOT NULL;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "video_url" text;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "pdf_url" text;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "content" text;--> statement-breakpoint

ALTER TABLE "quiz_attempts" ADD COLUMN IF NOT EXISTS "passed" boolean DEFAULT false NOT NULL;--> statement-breakpoint

ALTER TABLE "quiz_questions" ADD COLUMN IF NOT EXISTS "options" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD COLUMN IF NOT EXISTS "correct_option" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD COLUMN IF NOT EXISTS "order_index" integer DEFAULT 0 NOT NULL;
