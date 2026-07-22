-- Drizzle Migration 0011: Repair Constraints and Schema Integrity

-- A. learning_paths.company_id
DO $$ 
BEGIN
    -- Check if any orphaned company_id references exist
    IF EXISTS (
        SELECT 1 FROM learning_paths WHERE company_id IS NOT NULL AND company_id NOT IN (SELECT id FROM companies)
    ) THEN
        RAISE EXCEPTION 'learning_paths contains orphaned company_id references';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'learning_paths_company_id_fk'
    ) THEN
        ALTER TABLE learning_paths 
        ADD CONSTRAINT learning_paths_company_id_fk 
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
    END IF;
END $$;

-- B. challenges.linked_course_id
-- Nullify references to missing courses
UPDATE challenges 
SET linked_course_id = NULL 
WHERE linked_course_id IS NOT NULL 
  AND linked_course_id NOT IN (SELECT id FROM courses);

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'challenges_linked_course_id_fk'
    ) THEN
        ALTER TABLE challenges 
        ADD CONSTRAINT challenges_linked_course_id_fk 
        FOREIGN KEY (linked_course_id) REFERENCES courses(id) ON DELETE SET NULL;
    END IF;
END $$;

-- C. challenges.code
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM challenges WHERE code IS NOT NULL GROUP BY code HAVING count(*) > 1
    ) THEN
        RAISE EXCEPTION 'Duplicate codes found in challenges table. Unsafe to apply constraint.';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'challenges_code_key'
    ) THEN
        ALTER TABLE challenges ADD CONSTRAINT challenges_code_key UNIQUE (code);
    END IF;
END $$;

-- D. challenge_participants.company_id
-- Backfill company_id from employees table if NULL
UPDATE challenge_participants cp
SET company_id = e.company_id
FROM employees e
WHERE cp.company_id IS NULL AND e.clerk_user_id = cp.user_id;

DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM challenge_participants WHERE company_id IS NULL
    ) THEN
        RAISE EXCEPTION 'challenge_participants has rows with NULL company_id that cannot be resolved via employees';
    END IF;

    IF EXISTS (
        SELECT 1 FROM challenge_participants WHERE company_id IS NOT NULL AND company_id NOT IN (SELECT id FROM companies)
    ) THEN
        RAISE EXCEPTION 'challenge_participants has orphaned company_id references';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'challenge_participants_company_id_fk'
    ) THEN
        ALTER TABLE challenge_participants 
        ADD CONSTRAINT challenge_participants_company_id_fk 
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
    END IF;
END $$;

-- E. challenge_participants unique constraint
-- Consolidate duplicate rows deterministically
WITH RankedParticipants AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY challenge_id, user_id, company_id
           ORDER BY 
             CASE status
               WHEN 'approved' THEN 4
               WHEN 'submitted' THEN 3
               WHEN 'rejected' THEN 2
               WHEN 'in_progress' THEN 1
               ELSE 0
             END DESC,
             points_awarded DESC,
             updated_at DESC,
             id DESC
         ) as rn
  FROM challenge_participants
)
DELETE FROM challenge_participants
WHERE id IN (
  SELECT id FROM RankedParticipants WHERE rn > 1
);

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uniq_participant_company'
    ) THEN
        ALTER TABLE challenge_participants 
        ADD CONSTRAINT uniq_participant_company UNIQUE (challenge_id, user_id, company_id);
    END IF;
END $$;

-- F. challenge_participants.status check constraint
UPDATE challenge_participants
SET status = LOWER(TRIM(status));

UPDATE challenge_participants
SET status = 'in_progress'
WHERE status = 'active';

UPDATE challenge_participants
SET status = CASE 
    WHEN points_awarded = 10 THEN 'approved'
    WHEN evidence_text IS NOT NULL AND evidence_text <> '' THEN 'submitted'
    ELSE 'in_progress'
END
WHERE status = 'completed';

UPDATE challenge_participants
SET status = CASE 
    WHEN evidence_text IS NOT NULL AND evidence_text <> '' THEN 'submitted'
    ELSE 'in_progress'
END
WHERE status = 'pending';

DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM challenge_participants 
        WHERE status NOT IN ('in_progress', 'submitted', 'approved', 'rejected')
    ) THEN
        RAISE EXCEPTION 'challenge_participants has rows with invalid status value';
    END IF;

    ALTER TABLE challenge_participants DROP CONSTRAINT IF EXISTS chk_status;
    ALTER TABLE challenge_participants ADD CONSTRAINT chk_status CHECK (status IN ('in_progress', 'submitted', 'approved', 'rejected'));
END $$;

-- G. challenge_participants.points_awarded check constraint
UPDATE challenge_participants
SET points_awarded = 10
WHERE status = 'approved' AND points_awarded <> 10;

UPDATE challenge_participants
SET points_awarded = 0
WHERE status IN ('in_progress', 'submitted', 'rejected') AND points_awarded <> 0;

UPDATE challenge_participants
SET points_awarded = CASE WHEN status = 'approved' THEN 10 ELSE 0 END
WHERE points_awarded NOT IN (0, 10);

DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM challenge_participants WHERE points_awarded NOT IN (0, 10)
    ) THEN
        RAISE EXCEPTION 'challenge_participants has invalid points_awarded values';
    END IF;

    ALTER TABLE challenge_participants DROP CONSTRAINT IF EXISTS chk_points_awarded;
    ALTER TABLE challenge_participants ADD CONSTRAINT chk_points_awarded CHECK (points_awarded IN (0, 10));
END $$;

-- H. badge_definitions.code unique constraint
-- Consolidate duplicate badge definitions
DO $$
DECLARE
    r RECORD;
    canonical_id INT;
BEGIN
    FOR r IN (
        SELECT code, count(*) 
        FROM badge_definitions 
        GROUP BY code 
        HAVING count(*) > 1
    ) LOOP
        -- Select canonical ID (oldest id)
        SELECT id INTO canonical_id 
        FROM badge_definitions 
        WHERE code = r.code 
        ORDER BY id ASC 
        LIMIT 1;

        -- Repoint employee_badges
        UPDATE employee_badges
        SET badge_id = canonical_id
        WHERE badge_id IN (
            SELECT id FROM badge_definitions WHERE code = r.code AND id <> canonical_id
        );

        -- Delete duplicate definitions
        DELETE FROM badge_definitions
        WHERE code = r.code AND id <> canonical_id;
    END LOOP;
END $$;

DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM badge_definitions WHERE code IS NULL OR code = ''
    ) THEN
        RAISE EXCEPTION 'badge_definitions has NULL or empty code';
    END IF;

    IF EXISTS (
        SELECT 1 FROM badge_definitions GROUP BY code HAVING count(*) > 1
    ) THEN
        RAISE EXCEPTION 'badge_definitions has duplicate codes';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'badge_definitions_code_key'
    ) THEN
        ALTER TABLE badge_definitions ADD CONSTRAINT badge_definitions_code_key UNIQUE (code);
    END IF;
END $$;

-- I. employee_badges foreign keys
-- Backfill company_id from employee
UPDATE employee_badges eb
SET company_id = e.company_id
FROM employees e
WHERE eb.employee_id = e.id AND (eb.company_id IS NULL OR eb.company_id <> e.company_id);

DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM employee_badges WHERE employee_id NOT IN (SELECT id FROM employees)
    ) THEN
        RAISE EXCEPTION 'employee_badges contains orphaned employee_id references';
    END IF;

    IF EXISTS (
        SELECT 1 FROM employee_badges WHERE company_id NOT IN (SELECT id FROM companies)
    ) THEN
        RAISE EXCEPTION 'employee_badges contains orphaned company_id references';
    END IF;

    IF EXISTS (
        SELECT 1 FROM employee_badges WHERE badge_id NOT IN (SELECT id FROM badge_definitions)
    ) THEN
        RAISE EXCEPTION 'employee_badges contains orphaned badge_id references';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'employee_badges_employee_id_fk'
    ) THEN
        ALTER TABLE employee_badges ADD CONSTRAINT employee_badges_employee_id_fk FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'employee_badges_company_id_fk'
    ) THEN
        ALTER TABLE employee_badges ADD CONSTRAINT employee_badges_company_id_fk FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'employee_badges_badge_id_fk'
    ) THEN
        ALTER TABLE employee_badges ADD CONSTRAINT employee_badges_badge_id_fk FOREIGN KEY (badge_id) REFERENCES badge_definitions(id) ON DELETE CASCADE;
    END IF;
END $$;

-- J. employee_badges uniqueness
-- Consolidate duplicate awards
DO $$
DECLARE
    r RECORD;
    earliest_earned TIMESTAMP WITH TIME ZONE;
    keep_id INT;
BEGIN
    FOR r IN (
        SELECT employee_id, badge_id, count(*) 
        FROM employee_badges 
        GROUP BY employee_id, badge_id 
        HAVING count(*) > 1
    ) LOOP
        -- Get the earliest earned_at
        SELECT MIN(earned_at) INTO earliest_earned 
        FROM employee_badges 
        WHERE employee_id = r.employee_id AND badge_id = r.badge_id;

        -- Get the row to keep (oldest id)
        SELECT id INTO keep_id 
        FROM employee_badges 
        WHERE employee_id = r.employee_id AND badge_id = r.badge_id 
        ORDER BY id ASC 
        LIMIT 1;

        -- Update kept row
        UPDATE employee_badges
        SET earned_at = earliest_earned
        WHERE id = keep_id;

        -- Delete duplicate rows
        DELETE FROM employee_badges
        WHERE employee_id = r.employee_id AND badge_id = r.badge_id AND id <> keep_id;
    END LOOP;
END $$;

DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM employee_badges GROUP BY employee_id, badge_id HAVING count(*) > 1
    ) THEN
        RAISE EXCEPTION 'employee_badges has duplicates on (employee_id, badge_id)';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uniq_employee_badge'
    ) THEN
        ALTER TABLE employee_badges ADD CONSTRAINT uniq_employee_badge UNIQUE (employee_id, badge_id);
    END IF;
END $$;
