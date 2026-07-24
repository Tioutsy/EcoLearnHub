CREATE TABLE "employee_badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"company_id" integer NOT NULL,
	"badge_id" integer NOT NULL,
	"earned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"award_source" text NOT NULL,
	CONSTRAINT "uniq_employee_badge" UNIQUE("employee_id","badge_id")
);
--> statement-breakpoint
ALTER TABLE "challenge_participants" DROP CONSTRAINT "challenge_participants_challenge_id_user_id_unique";--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "course_code" text;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN "linked_resource_slugs" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN "last_verified_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN "next_review_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "mauritius_resources" ADD COLUMN "legal_status" text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "mauritius_resources" ADD COLUMN "last_verified_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "mauritius_resources" ADD COLUMN "next_review_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "learning_paths" ADD COLUMN "level" text DEFAULT 'beginner' NOT NULL;--> statement-breakpoint
ALTER TABLE "learning_paths" ADD COLUMN "provider_label" text DEFAULT 'EcoLearnHub' NOT NULL;--> statement-breakpoint
ALTER TABLE "learning_paths" ADD COLUMN "is_system_managed" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "learning_paths" ADD COLUMN "company_id" integer;--> statement-breakpoint
ALTER TABLE "badge_definitions" ADD COLUMN "code" text;--> statement-breakpoint
ALTER TABLE "challenge_participants" ADD COLUMN "company_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "challenge_participants" ADD COLUMN "status" text DEFAULT 'in_progress' NOT NULL;--> statement-breakpoint
ALTER TABLE "challenge_participants" ADD COLUMN "evidence_text" text;--> statement-breakpoint
ALTER TABLE "challenge_participants" ADD COLUMN "submitted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "challenge_participants" ADD COLUMN "reviewed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "challenge_participants" ADD COLUMN "reviewed_by" text;--> statement-breakpoint
ALTER TABLE "challenge_participants" ADD COLUMN "review_note" text;--> statement-breakpoint
ALTER TABLE "challenge_participants" ADD COLUMN "points_awarded" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "challenge_participants" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "challenge_participants" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "code" text;--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "summary" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "category" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "linked_course_id" integer;--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "duration_label" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "instructions" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "evidence_prompt" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "employee_badges" ADD CONSTRAINT "employee_badges_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_badges" ADD CONSTRAINT "employee_badges_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_badges" ADD CONSTRAINT "employee_badges_badge_id_badge_definitions_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."badge_definitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_paths" ADD CONSTRAINT "learning_paths_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_participants" ADD CONSTRAINT "challenge_participants_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_linked_course_id_courses_id_fk" FOREIGN KEY ("linked_course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_course_code_unique" UNIQUE("course_code");--> statement-breakpoint
ALTER TABLE "badge_definitions" ADD CONSTRAINT "badge_definitions_code_unique" UNIQUE("code");--> statement-breakpoint
ALTER TABLE "challenge_participants" ADD CONSTRAINT "challenge_participants_challenge_id_user_id_company_id_unique" UNIQUE("challenge_id","user_id","company_id");--> statement-breakpoint
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_code_unique" UNIQUE("code");