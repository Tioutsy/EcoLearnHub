-- 1. Add new columns as nullable or with defaults
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS code text;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS summary text DEFAULT '' NOT NULL;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS category text DEFAULT '' NOT NULL;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS linked_course_id integer REFERENCES courses(id) ON DELETE SET NULL;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS duration_label text DEFAULT '' NOT NULL;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS instructions text DEFAULT '' NOT NULL;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS evidence_prompt text DEFAULT '' NOT NULL;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true NOT NULL;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;

-- Unique constraint on code
ALTER TABLE challenges ADD CONSTRAINT challenges_code_key UNIQUE (code);

-- 2. Add columns to challenge_participants as nullable initially
ALTER TABLE challenge_participants ADD COLUMN IF NOT EXISTS company_id integer REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE challenge_participants ADD COLUMN IF NOT EXISTS status text DEFAULT 'in_progress' NOT NULL;
ALTER TABLE challenge_participants ADD COLUMN IF NOT EXISTS evidence_text text;
ALTER TABLE challenge_participants ADD COLUMN IF NOT EXISTS submitted_at timestamp with time zone;
ALTER TABLE challenge_participants ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone;
ALTER TABLE challenge_participants ADD COLUMN IF NOT EXISTS reviewed_by text;
ALTER TABLE challenge_participants ADD COLUMN IF NOT EXISTS review_note text;
ALTER TABLE challenge_participants ADD COLUMN IF NOT EXISTS points_awarded integer DEFAULT 0 NOT NULL;
ALTER TABLE challenge_participants ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE challenge_participants ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;

-- 3. Backfill company_id for any existing records to the default company (id = 1)
UPDATE challenge_participants SET company_id = 1 WHERE company_id IS NULL;

-- 4. Now make company_id NOT NULL
ALTER TABLE challenge_participants ALTER COLUMN company_id SET NOT NULL;

-- 5. Drop old unique constraint on challenge_participants if it exists, and add new one
ALTER TABLE challenge_participants DROP CONSTRAINT IF EXISTS challenge_participants_challenge_id_user_id_unique;
ALTER TABLE challenge_participants ADD CONSTRAINT uniq_participant_company UNIQUE (challenge_id, user_id, company_id);

-- 6. Add status and points check constraints
ALTER TABLE challenge_participants ADD CONSTRAINT chk_status CHECK (status IN ('in_progress', 'submitted', 'approved', 'rejected'));
ALTER TABLE challenge_participants ADD CONSTRAINT chk_points_awarded CHECK (points_awarded IN (0, 10));
