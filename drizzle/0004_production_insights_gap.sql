ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "author_title" text;
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "reading_time_minutes" integer DEFAULT 5 NOT NULL;
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "seo_title" text;
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "seo_description" text;
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "is_published" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "insight_category_id" integer;
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "scheduled_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "archived_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "review_date" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "created_by" integer;
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "updated_by" integer;
