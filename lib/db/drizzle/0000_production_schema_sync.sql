CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"icon_name" text,
	"course_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "course_prerequisites" (
	"course_id" integer NOT NULL,
	"prerequisite_course_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "course_prerequisites_course_id_prerequisite_course_id_pk" PRIMARY KEY("course_id","prerequisite_course_id")
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text,
	"description" text NOT NULL,
	"full_description" text,
	"category_id" integer NOT NULL,
	"duration_minutes" integer DEFAULT 60 NOT NULL,
	"price_usd" numeric(10, 2) DEFAULT '0' NOT NULL,
	"level" text DEFAULT 'beginner' NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"thumbnail_url" text,
	"preview_video_url" text,
	"learning_objectives" text[] DEFAULT '{}' NOT NULL,
	"enrollment_count" integer DEFAULT 0 NOT NULL,
	"rating" numeric(3, 1),
	"includes_certificate" boolean DEFAULT true NOT NULL,
	"passing_score" integer DEFAULT 70 NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"is_mandatory" boolean DEFAULT false NOT NULL,
	"validity_months" integer,
	"intended_roles" text[] DEFAULT '{}' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"review_date" timestamp with time zone,
	"recommended_next_course_id" integer,
	"badge_name" text,
	"badge_description" text,
	"completion_message" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "courses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" integer NOT NULL,
	"title" text NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"duration_minutes" integer DEFAULT 10 NOT NULL,
	"video_url" text,
	"pdf_url" text,
	"content" text,
	"is_archived" boolean DEFAULT false NOT NULL,
	"content_blocks" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lessons_course_order_unique" UNIQUE("course_id","order_index")
);
--> statement-breakpoint
CREATE TABLE "system_seeds" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"run_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "system_seeds_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"industry" text,
	"logo_url" text,
	"plan_id" integer,
	"employee_count" integer DEFAULT 0 NOT NULL,
	"max_employees" integer,
	"completion_rate" numeric(5, 2),
	"certificates_issued" integer DEFAULT 0 NOT NULL,
	"badges" text[] DEFAULT '{}' NOT NULL,
	"is_public_profile" boolean DEFAULT false NOT NULL,
	"leaderboard_enabled" boolean DEFAULT true NOT NULL,
	"stripe_customer_id" text,
	"recycling_service_status" text DEFAULT 'NOT_CLIENT' NOT NULL,
	"recyclean_customer_ref" text,
	"recycling_service_start_date" timestamp with time zone,
	"default_collection_site_name" text,
	"recycling_service_frequency" text,
	"recycling_internal_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "companies_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"clerk_user_id" text,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"department" text,
	"job_title" text,
	"role" text DEFAULT 'employee' NOT NULL,
	"invitation_status" text DEFAULT 'not_invited' NOT NULL,
	"invitation_token" text,
	"invitation_sent_at" timestamp with time zone,
	"invitation_accepted_at" timestamp with time zone,
	"enrolled_courses" integer DEFAULT 0 NOT NULL,
	"completed_courses" integer DEFAULT 0 NOT NULL,
	"certificates" integer DEFAULT 0 NOT NULL,
	"avg_score" integer DEFAULT 0 NOT NULL,
	"learning_minutes" integer DEFAULT 0 NOT NULL,
	"last_active_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"max_employees" integer,
	"price_monthly" numeric(10, 2) DEFAULT '0' NOT NULL,
	"price_annual" numeric(10, 2) DEFAULT '0' NOT NULL,
	"features" text[] DEFAULT '{}' NOT NULL,
	"is_popular" boolean DEFAULT false NOT NULL,
	"stripe_price_id_monthly" text,
	"stripe_price_id_annual" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "plans_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"plan_id" integer NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"current_period_start" timestamp with time zone,
	"current_period_end" timestamp with time zone NOT NULL,
	"stripe_subscription_id" text,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enrollments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"company_id" integer,
	"employee_id" integer,
	"course_id" integer NOT NULL,
	"assigned_by_user_id" text,
	"assignment_source" text DEFAULT 'self' NOT NULL,
	"due_date" timestamp with time zone,
	"status" text DEFAULT 'active' NOT NULL,
	"progress_pct" integer DEFAULT 0 NOT NULL,
	"last_accessed_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"completed_version" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"enrollment_id" integer NOT NULL,
	"lesson_id" integer NOT NULL,
	"completed" integer DEFAULT 0 NOT NULL,
	"watched_seconds" integer DEFAULT 0 NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"course_id" integer NOT NULL,
	"course_version" integer DEFAULT 1 NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"total_questions" integer DEFAULT 0 NOT NULL,
	"correct_answers" integer DEFAULT 0 NOT NULL,
	"passed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" integer NOT NULL,
	"question" text NOT NULL,
	"options" text[] DEFAULT '{}' NOT NULL,
	"correct_option" integer DEFAULT 0 NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"correct_explanation" text,
	"incorrect_explanation" text,
	"option_feedback" text[],
	"practical_takeaway" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quiz_questions_course_order_unique" UNIQUE("course_id","order_index")
);
--> statement-breakpoint
CREATE TABLE "certificates" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"company_id" integer,
	"employee_id" integer,
	"employee_name" text,
	"company_name" text,
	"course_id" integer NOT NULL,
	"course_version" integer DEFAULT 1 NOT NULL,
	"unique_code" text NOT NULL,
	"pdf_url" text,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "certificates_unique_code_unique" UNIQUE("unique_code")
);
--> statement-breakpoint
CREATE TABLE "badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"icon_url" text,
	"awarded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text NOT NULL,
	"content" text NOT NULL,
	"author_name" text NOT NULL,
	"author_title" text,
	"thumbnail_url" text,
	"image_alt" text,
	"source_references" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"reading_time_minutes" integer DEFAULT 5 NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"insight_category_id" integer,
	"scheduled_at" timestamp with time zone,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	"review_date" timestamp with time zone,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "insight_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "insight_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "mauritius_resources" (
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
CREATE TABLE "testimonials" (
	"id" serial PRIMARY KEY NOT NULL,
	"author_name" text NOT NULL,
	"author_title" text NOT NULL,
	"company" text NOT NULL,
	"text" text NOT NULL,
	"rating" serial NOT NULL,
	"avatar_url" text,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning_path_courses" (
	"id" serial PRIMARY KEY NOT NULL,
	"path_id" integer NOT NULL,
	"course_id" integer NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"position" integer,
	"is_required" boolean DEFAULT true NOT NULL,
	CONSTRAINT "learning_path_courses_path_course_unique" UNIQUE("path_id","course_id"),
	CONSTRAINT "learning_path_courses_path_position_unique" UNIQUE("path_id","position")
);
--> statement-breakpoint
CREATE TABLE "learning_paths" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"audience" text NOT NULL,
	"icon" text DEFAULT 'route' NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"difficulty" text DEFAULT 'beginner' NOT NULL,
	"intended_roles" text[] DEFAULT '{}' NOT NULL,
	"estimated_duration_minutes" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"completion_criteria" text,
	"certificate_eligibility" boolean DEFAULT false NOT NULL,
	"recommended_next_path_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "learning_paths_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "badge_definitions" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"icon" text DEFAULT 'award' NOT NULL,
	"criteria_type" text NOT NULL,
	"threshold" integer DEFAULT 0 NOT NULL,
	"course_ids" integer[] DEFAULT '{}' NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "badge_definitions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "challenge_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"challenge_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"points_earned" integer DEFAULT 0 NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	CONSTRAINT "challenge_participants_challenge_id_user_id_unique" UNIQUE("challenge_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "challenges" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"icon" text NOT NULL,
	"theme" text DEFAULT 'green' NOT NULL,
	"focus" text NOT NULL,
	"unit" text DEFAULT 'actions' NOT NULL,
	"goal_target" integer DEFAULT 1 NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"badge_name" text,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "challenges_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "course_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"employee_id" integer NOT NULL,
	"course_id" integer NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"due_date" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "course_assignments_employee_id_course_id_unique" UNIQUE("employee_id","course_id")
);
--> statement-breakpoint
CREATE TABLE "training_reminders" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"employee_id" integer NOT NULL,
	"course_id" integer,
	"type" text DEFAULT 'reminder' NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"company_name" text NOT NULL,
	"phone" text,
	"industry" text,
	"employee_range" text,
	"interest" text DEFAULT 'trial' NOT NULL,
	"message" text,
	"plan_id" integer,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_commitments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"course_id" integer NOT NULL,
	"course_version" integer DEFAULT 1 NOT NULL,
	"commitment" text NOT NULL,
	"status" text DEFAULT 'selected' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "course_commitments_user_id_course_id_commitment_unique" UNIQUE("user_id","course_id","commitment")
);
--> statement-breakpoint
CREATE TABLE "recycling_collections" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"site_name" text NOT NULL,
	"collection_date" timestamp with time zone NOT NULL,
	"reporting_month" text NOT NULL,
	"paper_cardboard_kg" numeric(12, 3) DEFAULT '0' NOT NULL,
	"plastic_kg" numeric(12, 3) DEFAULT '0' NOT NULL,
	"glass_kg" numeric(12, 3) DEFAULT '0' NOT NULL,
	"aluminium_metal_kg" numeric(12, 3) DEFAULT '0' NOT NULL,
	"other_kg" numeric(12, 3) DEFAULT '0' NOT NULL,
	"total_kg" numeric(12, 3) NOT NULL,
	"internal_comment" text,
	"created_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recycling_conversion_factors" (
	"id" serial PRIMARY KEY NOT NULL,
	"material_type" text DEFAULT 'total' NOT NULL,
	"metric_name" text NOT NULL,
	"metric_label" text NOT NULL,
	"factor_value" numeric(16, 6) NOT NULL,
	"factor_unit" text NOT NULL,
	"source_name" text NOT NULL,
	"source_reference" text,
	"effective_date" timestamp with time zone NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"internal_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recycling_enquiries" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"company_name" text NOT NULL,
	"contact_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"site_location" text,
	"current_arrangement" text,
	"message" text,
	"status" text DEFAULT 'new' NOT NULL,
	"created_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_post_sectors" (
	"blog_post_id" integer NOT NULL,
	"sector_id" integer NOT NULL,
	CONSTRAINT "blog_post_sectors_blog_post_id_sector_id_pk" PRIMARY KEY("blog_post_id","sector_id")
);
--> statement-breakpoint
CREATE TABLE "company_sectors" (
	"company_id" integer NOT NULL,
	"sector_id" integer NOT NULL,
	CONSTRAINT "company_sectors_company_id_sector_id_pk" PRIMARY KEY("company_id","sector_id")
);
--> statement-breakpoint
CREATE TABLE "course_sectors" (
	"course_id" integer NOT NULL,
	"sector_id" integer NOT NULL,
	CONSTRAINT "course_sectors_course_id_sector_id_pk" PRIMARY KEY("course_id","sector_id")
);
--> statement-breakpoint
CREATE TABLE "learning_path_sectors" (
	"path_id" integer NOT NULL,
	"sector_id" integer NOT NULL,
	CONSTRAINT "learning_path_sectors_path_id_sector_id_pk" PRIMARY KEY("path_id","sector_id")
);
--> statement-breakpoint
CREATE TABLE "scenario_sectors" (
	"scenario_id" integer NOT NULL,
	"sector_id" integer NOT NULL,
	CONSTRAINT "scenario_sectors_scenario_id_sector_id_pk" PRIMARY KEY("scenario_id","sector_id")
);
--> statement-breakpoint
CREATE TABLE "sectors" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sectors_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "workplace_scenarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workplace_scenarios_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "blog_post_sdg_contributions" (
	"blog_post_id" integer NOT NULL,
	"sdg_contribution_id" integer NOT NULL,
	CONSTRAINT "blog_post_sdg_contributions_blog_post_id_sdg_contribution_id_pk" PRIMARY KEY("blog_post_id","sdg_contribution_id")
);
--> statement-breakpoint
CREATE TABLE "company_action_sdg_contributions" (
	"action_id" integer NOT NULL,
	"sdg_contribution_id" integer NOT NULL,
	CONSTRAINT "company_action_sdg_contributions_action_id_sdg_contribution_id_pk" PRIMARY KEY("action_id","sdg_contribution_id")
);
--> statement-breakpoint
CREATE TABLE "company_actions" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_sdg_contributions" (
	"course_id" integer NOT NULL,
	"sdg_contribution_id" integer NOT NULL,
	CONSTRAINT "course_sdg_contributions_course_id_sdg_contribution_id_pk" PRIMARY KEY("course_id","sdg_contribution_id")
);
--> statement-breakpoint
CREATE TABLE "learning_path_sdg_contributions" (
	"path_id" integer NOT NULL,
	"sdg_contribution_id" integer NOT NULL,
	CONSTRAINT "learning_path_sdg_contributions_path_id_sdg_contribution_id_pk" PRIMARY KEY("path_id","sdg_contribution_id")
);
--> statement-breakpoint
CREATE TABLE "recycling_sdg_contributions" (
	"material_key" text NOT NULL,
	"sdg_contribution_id" integer NOT NULL,
	CONSTRAINT "recycling_sdg_contributions_material_key_sdg_contribution_id_pk" PRIMARY KEY("material_key","sdg_contribution_id")
);
--> statement-breakpoint
CREATE TABLE "sdg_contributions" (
	"id" serial PRIMARY KEY NOT NULL,
	"sdg_target_id" integer NOT NULL,
	"contribution_category" text NOT NULL,
	"rationale" text NOT NULL,
	"evidence_required" text,
	"evidence_strength" text DEFAULT 'medium' NOT NULL,
	"is_direct" boolean DEFAULT false NOT NULL,
	"source_reference" text,
	"methodology_version" text,
	"limitations" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sdg_goals" (
	"id" serial PRIMARY KEY NOT NULL,
	"goal_number" integer NOT NULL,
	"title" text NOT NULL,
	"official_reference" text,
	"source_version" text,
	"reviewed_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "sdg_goals_goal_number_unique" UNIQUE("goal_number")
);
--> statement-breakpoint
CREATE TABLE "sdg_targets" (
	"id" serial PRIMARY KEY NOT NULL,
	"sdg_goal_id" integer NOT NULL,
	"target_code" text NOT NULL,
	"official_or_approved_summary" text NOT NULL,
	"official_reference" text,
	"source_version" text,
	"reviewed_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "sdg_targets_target_code_unique" UNIQUE("target_code")
);
--> statement-breakpoint
CREATE TABLE "company_services" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"service_type" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"start_date" timestamp with time zone DEFAULT now() NOT NULL,
	"inactive_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "company_services_unique_company_service" UNIQUE("company_id","service_type")
);
--> statement-breakpoint
ALTER TABLE "course_prerequisites" ADD CONSTRAINT "course_prerequisites_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_prerequisites" ADD CONSTRAINT "course_prerequisites_prerequisite_course_id_fk" FOREIGN KEY ("prerequisite_course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_insight_category_id_insight_categories_id_fk" FOREIGN KEY ("insight_category_id") REFERENCES "public"."insight_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_participants" ADD CONSTRAINT "challenge_participants_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_assignments" ADD CONSTRAINT "course_assignments_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_reminders" ADD CONSTRAINT "training_reminders_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_post_sectors" ADD CONSTRAINT "blog_post_sectors_blog_post_id_fk" FOREIGN KEY ("blog_post_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_post_sectors" ADD CONSTRAINT "blog_post_sectors_sector_id_fk" FOREIGN KEY ("sector_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_sectors" ADD CONSTRAINT "company_sectors_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_sectors" ADD CONSTRAINT "company_sectors_sector_id_fk" FOREIGN KEY ("sector_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_sectors" ADD CONSTRAINT "course_sectors_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_sectors" ADD CONSTRAINT "course_sectors_sector_id_fk" FOREIGN KEY ("sector_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_path_sectors" ADD CONSTRAINT "learning_path_sectors_path_id_fk" FOREIGN KEY ("path_id") REFERENCES "public"."learning_paths"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_path_sectors" ADD CONSTRAINT "learning_path_sectors_sector_id_fk" FOREIGN KEY ("sector_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scenario_sectors" ADD CONSTRAINT "scenario_sectors_scenario_id_fk" FOREIGN KEY ("scenario_id") REFERENCES "public"."workplace_scenarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scenario_sectors" ADD CONSTRAINT "scenario_sectors_sector_id_fk" FOREIGN KEY ("sector_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_post_sdg_contributions" ADD CONSTRAINT "blog_post_sdg_contributions_blog_post_id_fk" FOREIGN KEY ("blog_post_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_post_sdg_contributions" ADD CONSTRAINT "blog_post_sdg_contributions_contribution_id_fk" FOREIGN KEY ("sdg_contribution_id") REFERENCES "public"."sdg_contributions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_action_sdg_contributions" ADD CONSTRAINT "company_action_sdg_contributions_action_id_fk" FOREIGN KEY ("action_id") REFERENCES "public"."company_actions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_action_sdg_contributions" ADD CONSTRAINT "company_action_sdg_contributions_contribution_id_fk" FOREIGN KEY ("sdg_contribution_id") REFERENCES "public"."sdg_contributions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_actions" ADD CONSTRAINT "company_actions_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_sdg_contributions" ADD CONSTRAINT "course_sdg_contributions_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_sdg_contributions" ADD CONSTRAINT "course_sdg_contributions_contribution_id_fk" FOREIGN KEY ("sdg_contribution_id") REFERENCES "public"."sdg_contributions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_path_sdg_contributions" ADD CONSTRAINT "learning_path_sdg_contributions_path_id_fk" FOREIGN KEY ("path_id") REFERENCES "public"."learning_paths"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_path_sdg_contributions" ADD CONSTRAINT "learning_path_sdg_contributions_contribution_id_fk" FOREIGN KEY ("sdg_contribution_id") REFERENCES "public"."sdg_contributions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recycling_sdg_contributions" ADD CONSTRAINT "recycling_sdg_contributions_contribution_id_fk" FOREIGN KEY ("sdg_contribution_id") REFERENCES "public"."sdg_contributions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sdg_contributions" ADD CONSTRAINT "sdg_contributions_sdg_target_id_fk" FOREIGN KEY ("sdg_target_id") REFERENCES "public"."sdg_targets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sdg_targets" ADD CONSTRAINT "sdg_targets_sdg_goal_id_fk" FOREIGN KEY ("sdg_goal_id") REFERENCES "public"."sdg_goals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_services" ADD CONSTRAINT "company_services_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "recycling_collections_company_month_idx" ON "recycling_collections" USING btree ("company_id","reporting_month");--> statement-breakpoint
CREATE INDEX "recycling_collections_company_date_idx" ON "recycling_collections" USING btree ("company_id","collection_date");--> statement-breakpoint
CREATE INDEX "recycling_collections_company_site_idx" ON "recycling_collections" USING btree ("company_id","site_name");--> statement-breakpoint
CREATE INDEX "recycling_conversion_factors_active_metric_idx" ON "recycling_conversion_factors" USING btree ("metric_name","is_active");--> statement-breakpoint
CREATE INDEX "recycling_enquiries_company_idx" ON "recycling_enquiries" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "recycling_enquiries_status_idx" ON "recycling_enquiries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "company_services_company_id_idx" ON "company_services" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "company_services_service_type_idx" ON "company_services" USING btree ("service_type");--> statement-breakpoint
CREATE INDEX "company_services_status_idx" ON "company_services" USING btree ("status");