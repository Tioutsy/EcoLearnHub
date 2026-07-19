ALTER TABLE "quiz_attempts" ADD COLUMN "competency_scores" jsonb;--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD COLUMN "competency_area" text;--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD COLUMN "source_course_id" integer;--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD COLUMN "learning_outcome" text;--> statement-breakpoint
ALTER TABLE "certificates" ADD COLUMN "certificate_title" text;