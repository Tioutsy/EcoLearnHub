ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "name" text;
--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "slug" text;
--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "description" text;
--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "icon_name" text;
--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "course_count" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "course_prerequisites" ADD COLUMN IF NOT EXISTS "course_id" integer;
--> statement-breakpoint
ALTER TABLE "course_prerequisites" ADD COLUMN IF NOT EXISTS "prerequisite_course_id" integer;
--> statement-breakpoint
ALTER TABLE "course_prerequisites" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "title" text;
--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "slug" text;
--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "description" text;
--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "category_id" integer;
--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "duration_minutes" integer DEFAULT 60 NOT NULL;
--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "price_usd" numeric(10, 2) DEFAULT '0' NOT NULL;
--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "level" text DEFAULT 'beginner' NOT NULL;
--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "is_featured" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "thumbnail_url" text;
--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "preview_video_url" text;
--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "learning_objectives" text[] DEFAULT '{}' NOT NULL;
--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "enrollment_count" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "rating" numeric(3, 1);
--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "includes_certificate" boolean DEFAULT true NOT NULL;
--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "passing_score" integer DEFAULT 70 NOT NULL;
--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "is_published" boolean DEFAULT true NOT NULL;
--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "is_mandatory" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "validity_months" integer;
--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "intended_roles" text[] DEFAULT '{}' NOT NULL;
--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "version" integer DEFAULT 1 NOT NULL;
--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "review_date" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "recommended_next_course_id" integer;
--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "course_id" integer;
--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "title" text;
--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "order_index" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "duration_minutes" integer DEFAULT 10 NOT NULL;
--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "video_url" text;
--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "pdf_url" text;
--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "content" text;
--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "name" text;
--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "slug" text;
--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "industry" text;
--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "logo_url" text;
--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "plan_id" integer;
--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "employee_count" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "max_employees" integer;
--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "completion_rate" numeric(5, 2);
--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "certificates_issued" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "badges" text[] DEFAULT '{}' NOT NULL;
--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "is_public_profile" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "leaderboard_enabled" boolean DEFAULT true NOT NULL;
--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "stripe_customer_id" text;
--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "recycling_service_status" text DEFAULT 'NOT_CLIENT' NOT NULL;
--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "recyclean_customer_ref" text;
--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "recycling_service_start_date" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "default_collection_site_name" text;
--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "recycling_service_frequency" text;
--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "recycling_internal_notes" text;
--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "company_id" integer;
--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "clerk_user_id" text;
--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "email" text;
--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "name" text;
--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "department" text;
--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "job_title" text;
--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "role" text DEFAULT 'employee' NOT NULL;
--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "invitation_status" text DEFAULT 'not_invited' NOT NULL;
--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "invitation_token" text;
--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "invitation_sent_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "invitation_accepted_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "enrolled_courses" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "completed_courses" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "certificates" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "avg_score" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "learning_minutes" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "last_active_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN IF NOT EXISTS "name" text;
--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN IF NOT EXISTS "slug" text;
--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN IF NOT EXISTS "max_employees" integer;
--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN IF NOT EXISTS "price_monthly" numeric(10, 2) DEFAULT '0' NOT NULL;
--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN IF NOT EXISTS "price_annual" numeric(10, 2) DEFAULT '0' NOT NULL;
--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN IF NOT EXISTS "features" text[] DEFAULT '{}' NOT NULL;
--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN IF NOT EXISTS "is_popular" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN IF NOT EXISTS "stripe_price_id_monthly" text;
--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN IF NOT EXISTS "stripe_price_id_annual" text;
--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "company_id" integer;
--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "plan_id" integer;
--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'active' NOT NULL;
--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "current_period_start" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "current_period_end" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "stripe_subscription_id" text;
--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "cancel_at_period_end" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN IF NOT EXISTS "user_id" text;
--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN IF NOT EXISTS "company_id" integer;
--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN IF NOT EXISTS "employee_id" integer;
--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN IF NOT EXISTS "course_id" integer;
--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN IF NOT EXISTS "assigned_by_user_id" text;
--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN IF NOT EXISTS "assignment_source" text DEFAULT 'self' NOT NULL;
--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN IF NOT EXISTS "due_date" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'active' NOT NULL;
--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN IF NOT EXISTS "progress_pct" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN IF NOT EXISTS "last_accessed_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN IF NOT EXISTS "completed_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD COLUMN IF NOT EXISTS "enrollment_id" integer;
--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD COLUMN IF NOT EXISTS "lesson_id" integer;
--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD COLUMN IF NOT EXISTS "completed" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD COLUMN IF NOT EXISTS "watched_seconds" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD COLUMN IF NOT EXISTS "completed_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD COLUMN IF NOT EXISTS "user_id" text;
--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD COLUMN IF NOT EXISTS "course_id" integer;
--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD COLUMN IF NOT EXISTS "score" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD COLUMN IF NOT EXISTS "total_questions" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD COLUMN IF NOT EXISTS "correct_answers" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD COLUMN IF NOT EXISTS "passed" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD COLUMN IF NOT EXISTS "course_id" integer;
--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD COLUMN IF NOT EXISTS "question" text;
--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD COLUMN IF NOT EXISTS "options" text[] DEFAULT '{}' NOT NULL;
--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD COLUMN IF NOT EXISTS "correct_option" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD COLUMN IF NOT EXISTS "order_index" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "certificates" ADD COLUMN IF NOT EXISTS "user_id" text;
--> statement-breakpoint
ALTER TABLE "certificates" ADD COLUMN IF NOT EXISTS "company_id" integer;
--> statement-breakpoint
ALTER TABLE "certificates" ADD COLUMN IF NOT EXISTS "employee_id" integer;
--> statement-breakpoint
ALTER TABLE "certificates" ADD COLUMN IF NOT EXISTS "employee_name" text;
--> statement-breakpoint
ALTER TABLE "certificates" ADD COLUMN IF NOT EXISTS "company_name" text;
--> statement-breakpoint
ALTER TABLE "certificates" ADD COLUMN IF NOT EXISTS "course_id" integer;
--> statement-breakpoint
ALTER TABLE "certificates" ADD COLUMN IF NOT EXISTS "unique_code" text;
--> statement-breakpoint
ALTER TABLE "certificates" ADD COLUMN IF NOT EXISTS "pdf_url" text;
--> statement-breakpoint
ALTER TABLE "certificates" ADD COLUMN IF NOT EXISTS "issued_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "badges" ADD COLUMN IF NOT EXISTS "company_id" integer;
--> statement-breakpoint
ALTER TABLE "badges" ADD COLUMN IF NOT EXISTS "name" text;
--> statement-breakpoint
ALTER TABLE "badges" ADD COLUMN IF NOT EXISTS "slug" text;
--> statement-breakpoint
ALTER TABLE "badges" ADD COLUMN IF NOT EXISTS "description" text;
--> statement-breakpoint
ALTER TABLE "badges" ADD COLUMN IF NOT EXISTS "icon_url" text;
--> statement-breakpoint
ALTER TABLE "badges" ADD COLUMN IF NOT EXISTS "awarded_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "title" text;
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "slug" text;
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "excerpt" text;
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "content" text;
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "author_name" text;
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "author_title" text;
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "thumbnail_url" text;
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "image_alt" text;
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "source_references" jsonb DEFAULT '[]'::jsonb NOT NULL;
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "reading_time_minutes" integer DEFAULT 5 NOT NULL;
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "seo_title" text;
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "seo_description" text;
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "tags" text[] DEFAULT '{}' NOT NULL;
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "is_published" boolean DEFAULT true NOT NULL;
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'draft' NOT NULL;
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "insight_category_id" integer;
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "scheduled_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "published_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "archived_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "review_date" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "created_by" text;
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "updated_by" text;
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "insight_categories" ADD COLUMN IF NOT EXISTS "slug" text;
--> statement-breakpoint
ALTER TABLE "insight_categories" ADD COLUMN IF NOT EXISTS "name" text;
--> statement-breakpoint
ALTER TABLE "insight_categories" ADD COLUMN IF NOT EXISTS "description" text;
--> statement-breakpoint
ALTER TABLE "insight_categories" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'active' NOT NULL;
--> statement-breakpoint
ALTER TABLE "insight_categories" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "insight_categories" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN IF NOT EXISTS "author_name" text;
--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN IF NOT EXISTS "author_title" text;
--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN IF NOT EXISTS "company" text;
--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN IF NOT EXISTS "text" text;
--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN IF NOT EXISTS "rating" serial;
--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN IF NOT EXISTS "avatar_url" text;
--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN IF NOT EXISTS "is_published" boolean DEFAULT true NOT NULL;
--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "learning_path_courses" ADD COLUMN IF NOT EXISTS "path_id" integer;
--> statement-breakpoint
ALTER TABLE "learning_path_courses" ADD COLUMN IF NOT EXISTS "course_id" integer;
--> statement-breakpoint
ALTER TABLE "learning_path_courses" ADD COLUMN IF NOT EXISTS "order_index" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "learning_path_courses" ADD COLUMN IF NOT EXISTS "position" integer;
--> statement-breakpoint
ALTER TABLE "learning_path_courses" ADD COLUMN IF NOT EXISTS "is_required" boolean DEFAULT true NOT NULL;
--> statement-breakpoint
ALTER TABLE "learning_paths" ADD COLUMN IF NOT EXISTS "slug" text;
--> statement-breakpoint
ALTER TABLE "learning_paths" ADD COLUMN IF NOT EXISTS "title" text;
--> statement-breakpoint
ALTER TABLE "learning_paths" ADD COLUMN IF NOT EXISTS "description" text;
--> statement-breakpoint
ALTER TABLE "learning_paths" ADD COLUMN IF NOT EXISTS "audience" text;
--> statement-breakpoint
ALTER TABLE "learning_paths" ADD COLUMN IF NOT EXISTS "icon" text DEFAULT 'route' NOT NULL;
--> statement-breakpoint
ALTER TABLE "learning_paths" ADD COLUMN IF NOT EXISTS "order_index" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "learning_paths" ADD COLUMN IF NOT EXISTS "difficulty" text DEFAULT 'beginner' NOT NULL;
--> statement-breakpoint
ALTER TABLE "learning_paths" ADD COLUMN IF NOT EXISTS "intended_roles" text[] DEFAULT '{}' NOT NULL;
--> statement-breakpoint
ALTER TABLE "learning_paths" ADD COLUMN IF NOT EXISTS "estimated_duration_minutes" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "learning_paths" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'draft' NOT NULL;
--> statement-breakpoint
ALTER TABLE "learning_paths" ADD COLUMN IF NOT EXISTS "version" integer DEFAULT 1 NOT NULL;
--> statement-breakpoint
ALTER TABLE "learning_paths" ADD COLUMN IF NOT EXISTS "completion_criteria" text;
--> statement-breakpoint
ALTER TABLE "learning_paths" ADD COLUMN IF NOT EXISTS "certificate_eligibility" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "learning_paths" ADD COLUMN IF NOT EXISTS "recommended_next_path_id" integer;
--> statement-breakpoint
ALTER TABLE "learning_paths" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "learning_paths" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "badge_definitions" ADD COLUMN IF NOT EXISTS "slug" text;
--> statement-breakpoint
ALTER TABLE "badge_definitions" ADD COLUMN IF NOT EXISTS "name" text;
--> statement-breakpoint
ALTER TABLE "badge_definitions" ADD COLUMN IF NOT EXISTS "description" text;
--> statement-breakpoint
ALTER TABLE "badge_definitions" ADD COLUMN IF NOT EXISTS "icon" text DEFAULT 'award' NOT NULL;
--> statement-breakpoint
ALTER TABLE "badge_definitions" ADD COLUMN IF NOT EXISTS "criteria_type" text;
--> statement-breakpoint
ALTER TABLE "badge_definitions" ADD COLUMN IF NOT EXISTS "threshold" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "badge_definitions" ADD COLUMN IF NOT EXISTS "course_ids" integer[] DEFAULT '{}' NOT NULL;
--> statement-breakpoint
ALTER TABLE "badge_definitions" ADD COLUMN IF NOT EXISTS "order_index" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "challenge_participants" ADD COLUMN IF NOT EXISTS "challenge_id" integer;
--> statement-breakpoint
ALTER TABLE "challenge_participants" ADD COLUMN IF NOT EXISTS "user_id" text;
--> statement-breakpoint
ALTER TABLE "challenge_participants" ADD COLUMN IF NOT EXISTS "progress" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "challenge_participants" ADD COLUMN IF NOT EXISTS "completed" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "challenge_participants" ADD COLUMN IF NOT EXISTS "points_earned" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "challenge_participants" ADD COLUMN IF NOT EXISTS "joined_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "challenge_participants" ADD COLUMN IF NOT EXISTS "completed_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN IF NOT EXISTS "slug" text;
--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN IF NOT EXISTS "title" text;
--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN IF NOT EXISTS "description" text;
--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN IF NOT EXISTS "icon" text;
--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN IF NOT EXISTS "theme" text DEFAULT 'green' NOT NULL;
--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN IF NOT EXISTS "focus" text;
--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN IF NOT EXISTS "unit" text DEFAULT 'actions' NOT NULL;
--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN IF NOT EXISTS "goal_target" integer DEFAULT 1 NOT NULL;
--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN IF NOT EXISTS "points" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN IF NOT EXISTS "badge_name" text;
--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN IF NOT EXISTS "start_date" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN IF NOT EXISTS "end_date" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN IF NOT EXISTS "order_index" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "course_assignments" ADD COLUMN IF NOT EXISTS "company_id" integer;
--> statement-breakpoint
ALTER TABLE "course_assignments" ADD COLUMN IF NOT EXISTS "employee_id" integer;
--> statement-breakpoint
ALTER TABLE "course_assignments" ADD COLUMN IF NOT EXISTS "course_id" integer;
--> statement-breakpoint
ALTER TABLE "course_assignments" ADD COLUMN IF NOT EXISTS "assigned_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "course_assignments" ADD COLUMN IF NOT EXISTS "due_date" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "course_assignments" ADD COLUMN IF NOT EXISTS "completed_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "course_assignments" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "training_reminders" ADD COLUMN IF NOT EXISTS "company_id" integer;
--> statement-breakpoint
ALTER TABLE "training_reminders" ADD COLUMN IF NOT EXISTS "employee_id" integer;
--> statement-breakpoint
ALTER TABLE "training_reminders" ADD COLUMN IF NOT EXISTS "course_id" integer;
--> statement-breakpoint
ALTER TABLE "training_reminders" ADD COLUMN IF NOT EXISTS "type" text DEFAULT 'reminder' NOT NULL;
--> statement-breakpoint
ALTER TABLE "training_reminders" ADD COLUMN IF NOT EXISTS "message" text;
--> statement-breakpoint
ALTER TABLE "training_reminders" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "name" text;
--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "email" text;
--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "company_name" text;
--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "phone" text;
--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "industry" text;
--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "employee_range" text;
--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "interest" text DEFAULT 'trial' NOT NULL;
--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "message" text;
--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "plan_id" integer;
--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'new' NOT NULL;
--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "course_commitments" ADD COLUMN IF NOT EXISTS "user_id" text;
--> statement-breakpoint
ALTER TABLE "course_commitments" ADD COLUMN IF NOT EXISTS "course_id" integer;
--> statement-breakpoint
ALTER TABLE "course_commitments" ADD COLUMN IF NOT EXISTS "commitment" text;
--> statement-breakpoint
ALTER TABLE "course_commitments" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "recycling_collections" ADD COLUMN IF NOT EXISTS "company_id" integer;
--> statement-breakpoint
ALTER TABLE "recycling_collections" ADD COLUMN IF NOT EXISTS "site_name" text;
--> statement-breakpoint
ALTER TABLE "recycling_collections" ADD COLUMN IF NOT EXISTS "collection_date" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "recycling_collections" ADD COLUMN IF NOT EXISTS "reporting_month" text;
--> statement-breakpoint
ALTER TABLE "recycling_collections" ADD COLUMN IF NOT EXISTS "paper_cardboard_kg" numeric(12, 3) DEFAULT '0' NOT NULL;
--> statement-breakpoint
ALTER TABLE "recycling_collections" ADD COLUMN IF NOT EXISTS "plastic_kg" numeric(12, 3) DEFAULT '0' NOT NULL;
--> statement-breakpoint
ALTER TABLE "recycling_collections" ADD COLUMN IF NOT EXISTS "glass_kg" numeric(12, 3) DEFAULT '0' NOT NULL;
--> statement-breakpoint
ALTER TABLE "recycling_collections" ADD COLUMN IF NOT EXISTS "aluminium_metal_kg" numeric(12, 3) DEFAULT '0' NOT NULL;
--> statement-breakpoint
ALTER TABLE "recycling_collections" ADD COLUMN IF NOT EXISTS "other_kg" numeric(12, 3) DEFAULT '0' NOT NULL;
--> statement-breakpoint
ALTER TABLE "recycling_collections" ADD COLUMN IF NOT EXISTS "total_kg" numeric(12, 3);
--> statement-breakpoint
ALTER TABLE "recycling_collections" ADD COLUMN IF NOT EXISTS "internal_comment" text;
--> statement-breakpoint
ALTER TABLE "recycling_collections" ADD COLUMN IF NOT EXISTS "created_by_user_id" text;
--> statement-breakpoint
ALTER TABLE "recycling_collections" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "recycling_collections" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "recycling_conversion_factors" ADD COLUMN IF NOT EXISTS "material_type" text DEFAULT 'total' NOT NULL;
--> statement-breakpoint
ALTER TABLE "recycling_conversion_factors" ADD COLUMN IF NOT EXISTS "metric_name" text;
--> statement-breakpoint
ALTER TABLE "recycling_conversion_factors" ADD COLUMN IF NOT EXISTS "metric_label" text;
--> statement-breakpoint
ALTER TABLE "recycling_conversion_factors" ADD COLUMN IF NOT EXISTS "factor_value" numeric(16, 6);
--> statement-breakpoint
ALTER TABLE "recycling_conversion_factors" ADD COLUMN IF NOT EXISTS "factor_unit" text;
--> statement-breakpoint
ALTER TABLE "recycling_conversion_factors" ADD COLUMN IF NOT EXISTS "source_name" text;
--> statement-breakpoint
ALTER TABLE "recycling_conversion_factors" ADD COLUMN IF NOT EXISTS "source_reference" text;
--> statement-breakpoint
ALTER TABLE "recycling_conversion_factors" ADD COLUMN IF NOT EXISTS "effective_date" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "recycling_conversion_factors" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true NOT NULL;
--> statement-breakpoint
ALTER TABLE "recycling_conversion_factors" ADD COLUMN IF NOT EXISTS "internal_notes" text;
--> statement-breakpoint
ALTER TABLE "recycling_conversion_factors" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "recycling_conversion_factors" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "recycling_enquiries" ADD COLUMN IF NOT EXISTS "company_id" integer;
--> statement-breakpoint
ALTER TABLE "recycling_enquiries" ADD COLUMN IF NOT EXISTS "company_name" text;
--> statement-breakpoint
ALTER TABLE "recycling_enquiries" ADD COLUMN IF NOT EXISTS "contact_name" text;
--> statement-breakpoint
ALTER TABLE "recycling_enquiries" ADD COLUMN IF NOT EXISTS "email" text;
--> statement-breakpoint
ALTER TABLE "recycling_enquiries" ADD COLUMN IF NOT EXISTS "phone" text;
--> statement-breakpoint
ALTER TABLE "recycling_enquiries" ADD COLUMN IF NOT EXISTS "site_location" text;
--> statement-breakpoint
ALTER TABLE "recycling_enquiries" ADD COLUMN IF NOT EXISTS "current_arrangement" text;
--> statement-breakpoint
ALTER TABLE "recycling_enquiries" ADD COLUMN IF NOT EXISTS "message" text;
--> statement-breakpoint
ALTER TABLE "recycling_enquiries" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'new' NOT NULL;
--> statement-breakpoint
ALTER TABLE "recycling_enquiries" ADD COLUMN IF NOT EXISTS "created_by_user_id" text;
--> statement-breakpoint
ALTER TABLE "recycling_enquiries" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "recycling_enquiries" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "blog_post_sectors" ADD COLUMN IF NOT EXISTS "blog_post_id" integer;
--> statement-breakpoint
ALTER TABLE "blog_post_sectors" ADD COLUMN IF NOT EXISTS "sector_id" integer;
--> statement-breakpoint
ALTER TABLE "company_sectors" ADD COLUMN IF NOT EXISTS "company_id" integer;
--> statement-breakpoint
ALTER TABLE "company_sectors" ADD COLUMN IF NOT EXISTS "sector_id" integer;
--> statement-breakpoint
ALTER TABLE "course_sectors" ADD COLUMN IF NOT EXISTS "course_id" integer;
--> statement-breakpoint
ALTER TABLE "course_sectors" ADD COLUMN IF NOT EXISTS "sector_id" integer;
--> statement-breakpoint
ALTER TABLE "learning_path_sectors" ADD COLUMN IF NOT EXISTS "path_id" integer;
--> statement-breakpoint
ALTER TABLE "learning_path_sectors" ADD COLUMN IF NOT EXISTS "sector_id" integer;
--> statement-breakpoint
ALTER TABLE "scenario_sectors" ADD COLUMN IF NOT EXISTS "scenario_id" integer;
--> statement-breakpoint
ALTER TABLE "scenario_sectors" ADD COLUMN IF NOT EXISTS "sector_id" integer;
--> statement-breakpoint
ALTER TABLE "sectors" ADD COLUMN IF NOT EXISTS "slug" text;
--> statement-breakpoint
ALTER TABLE "sectors" ADD COLUMN IF NOT EXISTS "name" text;
--> statement-breakpoint
ALTER TABLE "sectors" ADD COLUMN IF NOT EXISTS "description" text;
--> statement-breakpoint
ALTER TABLE "sectors" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'active' NOT NULL;
--> statement-breakpoint
ALTER TABLE "sectors" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "sectors" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "workplace_scenarios" ADD COLUMN IF NOT EXISTS "slug" text;
--> statement-breakpoint
ALTER TABLE "workplace_scenarios" ADD COLUMN IF NOT EXISTS "title" text;
--> statement-breakpoint
ALTER TABLE "workplace_scenarios" ADD COLUMN IF NOT EXISTS "content" text;
--> statement-breakpoint
ALTER TABLE "workplace_scenarios" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "workplace_scenarios" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "blog_post_sdg_contributions" ADD COLUMN IF NOT EXISTS "blog_post_id" integer;
--> statement-breakpoint
ALTER TABLE "blog_post_sdg_contributions" ADD COLUMN IF NOT EXISTS "sdg_contribution_id" integer;
--> statement-breakpoint
ALTER TABLE "company_action_sdg_contributions" ADD COLUMN IF NOT EXISTS "action_id" integer;
--> statement-breakpoint
ALTER TABLE "company_action_sdg_contributions" ADD COLUMN IF NOT EXISTS "sdg_contribution_id" integer;
--> statement-breakpoint
ALTER TABLE "company_actions" ADD COLUMN IF NOT EXISTS "company_id" integer;
--> statement-breakpoint
ALTER TABLE "company_actions" ADD COLUMN IF NOT EXISTS "title" text;
--> statement-breakpoint
ALTER TABLE "company_actions" ADD COLUMN IF NOT EXISTS "description" text;
--> statement-breakpoint
ALTER TABLE "company_actions" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "company_actions" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "course_sdg_contributions" ADD COLUMN IF NOT EXISTS "course_id" integer;
--> statement-breakpoint
ALTER TABLE "course_sdg_contributions" ADD COLUMN IF NOT EXISTS "sdg_contribution_id" integer;
--> statement-breakpoint
ALTER TABLE "learning_path_sdg_contributions" ADD COLUMN IF NOT EXISTS "path_id" integer;
--> statement-breakpoint
ALTER TABLE "learning_path_sdg_contributions" ADD COLUMN IF NOT EXISTS "sdg_contribution_id" integer;
--> statement-breakpoint
ALTER TABLE "recycling_sdg_contributions" ADD COLUMN IF NOT EXISTS "material_key" text;
--> statement-breakpoint
ALTER TABLE "recycling_sdg_contributions" ADD COLUMN IF NOT EXISTS "sdg_contribution_id" integer;
--> statement-breakpoint
ALTER TABLE "sdg_contributions" ADD COLUMN IF NOT EXISTS "sdg_target_id" integer;
--> statement-breakpoint
ALTER TABLE "sdg_contributions" ADD COLUMN IF NOT EXISTS "contribution_category" text;
--> statement-breakpoint
ALTER TABLE "sdg_contributions" ADD COLUMN IF NOT EXISTS "rationale" text;
--> statement-breakpoint
ALTER TABLE "sdg_contributions" ADD COLUMN IF NOT EXISTS "evidence_required" text;
--> statement-breakpoint
ALTER TABLE "sdg_contributions" ADD COLUMN IF NOT EXISTS "evidence_strength" text DEFAULT 'medium' NOT NULL;
--> statement-breakpoint
ALTER TABLE "sdg_contributions" ADD COLUMN IF NOT EXISTS "is_direct" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "sdg_contributions" ADD COLUMN IF NOT EXISTS "source_reference" text;
--> statement-breakpoint
ALTER TABLE "sdg_contributions" ADD COLUMN IF NOT EXISTS "methodology_version" text;
--> statement-breakpoint
ALTER TABLE "sdg_contributions" ADD COLUMN IF NOT EXISTS "limitations" text;
--> statement-breakpoint
ALTER TABLE "sdg_contributions" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'active' NOT NULL;
--> statement-breakpoint
ALTER TABLE "sdg_contributions" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "sdg_contributions" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "sdg_goals" ADD COLUMN IF NOT EXISTS "goal_number" integer;
--> statement-breakpoint
ALTER TABLE "sdg_goals" ADD COLUMN IF NOT EXISTS "title" text;
--> statement-breakpoint
ALTER TABLE "sdg_goals" ADD COLUMN IF NOT EXISTS "official_reference" text;
--> statement-breakpoint
ALTER TABLE "sdg_goals" ADD COLUMN IF NOT EXISTS "source_version" text;
--> statement-breakpoint
ALTER TABLE "sdg_goals" ADD COLUMN IF NOT EXISTS "reviewed_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "sdg_goals" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true NOT NULL;
--> statement-breakpoint
ALTER TABLE "sdg_targets" ADD COLUMN IF NOT EXISTS "sdg_goal_id" integer;
--> statement-breakpoint
ALTER TABLE "sdg_targets" ADD COLUMN IF NOT EXISTS "target_code" text;
--> statement-breakpoint
ALTER TABLE "sdg_targets" ADD COLUMN IF NOT EXISTS "official_or_approved_summary" text;
--> statement-breakpoint
ALTER TABLE "sdg_targets" ADD COLUMN IF NOT EXISTS "official_reference" text;
--> statement-breakpoint
ALTER TABLE "sdg_targets" ADD COLUMN IF NOT EXISTS "source_version" text;
--> statement-breakpoint
ALTER TABLE "sdg_targets" ADD COLUMN IF NOT EXISTS "reviewed_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "sdg_targets" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true NOT NULL;
--> statement-breakpoint
ALTER TABLE "company_services" ADD COLUMN IF NOT EXISTS "company_id" integer;
--> statement-breakpoint
ALTER TABLE "company_services" ADD COLUMN IF NOT EXISTS "service_type" text;
--> statement-breakpoint
ALTER TABLE "company_services" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'active' NOT NULL;
--> statement-breakpoint
ALTER TABLE "company_services" ADD COLUMN IF NOT EXISTS "start_date" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "company_services" ADD COLUMN IF NOT EXISTS "inactive_date" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "company_services" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "company_services" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;
