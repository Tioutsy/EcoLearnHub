-- Migration: 0020_amend_remediation_audit_and_cleanup.sql
-- Sprint 12.3.1 Final Production Readiness:
-- 1. Ensure catalogue_remediation_audit_logs table with batch_id, source, and indexes.
-- 2. Explicit authorised catalogue validation for ELH-01 through ELH-34.
-- 3. Snapshot and delete obsolete draft Course ID 234 and related draft artifacts.
-- 4. Audit and remove orphaned/invalid enrollments and certificates (zero remapping).
-- 5. Prune deleted course IDs from pilot passes and suspend passes with 0 valid courses.

CREATE TABLE IF NOT EXISTS "catalogue_remediation_audit_logs" (
  "id" serial PRIMARY KEY,
  "batch_id" text NOT NULL DEFAULT 'batch-sprint-12-3-1',
  "entity_type" text NOT NULL,
  "entity_id" integer,
  "original_data" jsonb NOT NULL,
  "action_taken" text NOT NULL,
  "reason" text NOT NULL,
  "source" text NOT NULL DEFAULT 'system:remediation',
  "performed_by" text NOT NULL DEFAULT 'system:remediation',
  "created_at" timestamp with time zone NOT NULL DEFAULT NOW()
);

-- Ensure batch_id and source columns exist if table was created in an earlier run
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'catalogue_remediation_audit_logs' AND column_name = 'batch_id') THEN
    ALTER TABLE "catalogue_remediation_audit_logs" ADD COLUMN "batch_id" text NOT NULL DEFAULT 'batch-sprint-12-3-1';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'catalogue_remediation_audit_logs' AND column_name = 'source') THEN
    ALTER TABLE "catalogue_remediation_audit_logs" ADD COLUMN "source" text NOT NULL DEFAULT 'system:remediation';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_catalogue_remediation_batch_id" ON "catalogue_remediation_audit_logs" ("batch_id");
CREATE INDEX IF NOT EXISTS "idx_catalogue_remediation_entity_type" ON "catalogue_remediation_audit_logs" ("entity_type");
CREATE INDEX IF NOT EXISTS "idx_catalogue_remediation_action_taken" ON "catalogue_remediation_audit_logs" ("action_taken");

CREATE OR REPLACE FUNCTION prevent_catalogue_audit_log_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'catalogue_remediation_audit_logs is append-only: UPDATE and DELETE operations are forbidden at database level.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_catalogue_audit_log_mutation ON "catalogue_remediation_audit_logs";
CREATE TRIGGER trg_prevent_catalogue_audit_log_mutation
BEFORE UPDATE OR DELETE ON "catalogue_remediation_audit_logs"
FOR EACH ROW EXECUTE FUNCTION prevent_catalogue_audit_log_mutation();

DO $$
DECLARE
  authorised_codes text[] := ARRAY[
    'ELH-01', 'ELH-02', 'ELH-03', 'ELH-04', 'ELH-05', 'ELH-06', 'ELH-07', 'ELH-08', 'ELH-09', 'ELH-10',
    'ELH-11', 'ELH-12', 'ELH-13', 'ELH-14', 'ELH-15', 'ELH-16', 'ELH-17', 'ELH-18', 'ELH-19', 'ELH-20',
    'ELH-21', 'ELH-22', 'ELH-23', 'ELH-24', 'ELH-25', 'ELH-26', 'ELH-27', 'ELH-28', 'ELH-29', 'ELH-30',
    'ELH-31', 'ELH-32', 'ELH-33', 'ELH-34'
  ];
  valid_ids integer[];
  enr_record RECORD;
  cert_record RECORD;
  pass_record RECORD;
  draft_record RECORD;
  quiz_record RECORD;
  prereq_record RECORD;
  pruned_ids integer[];
  cid integer;
  now_ts timestamp with time zone := NOW();
  batch_tag text := 'batch-sprint-12-3-1';
BEGIN
  -- 1. Resolve canonical published course IDs strictly from the authorised codes array
  SELECT ARRAY_AGG(id) INTO valid_ids
  FROM "courses"
  WHERE "course_code" = ANY(authorised_codes)
    AND "is_published" = true;

  IF valid_ids IS NULL THEN
    valid_ids := ARRAY[]::integer[];
  END IF;

  -- 2. Snapshot and Delete Obsolete Draft Course ID 234 and its orphaned quiz questions / prerequisites
  FOR draft_record IN 
    SELECT * FROM "courses" 
    WHERE "id" = 234 OR ("is_published" = false AND ("course_code" IS NULL OR NOT ("course_code" = ANY(authorised_codes))))
  LOOP
    -- Snapshot and clean draft quiz questions for this course
    FOR quiz_record IN SELECT * FROM "quiz_questions" WHERE "course_id" = draft_record.id LOOP
      INSERT INTO "catalogue_remediation_audit_logs" (
        "batch_id", "entity_type", "entity_id", "original_data", "action_taken", "reason", "source", "performed_by", "created_at"
      ) VALUES (
        batch_tag, 'quiz_question', quiz_record.id, row_to_json(quiz_record)::jsonb,
        'deleted_obsolete_draft_quiz', 'Quiz question attached to obsolete draft course ID ' || draft_record.id,
        'system:sprint-12-3-1-cleanup', 'system:remediation', now_ts
      );
      DELETE FROM "quiz_questions" WHERE "id" = quiz_record.id;
    END LOOP;

    -- Snapshot and clean draft prerequisites for this course
    FOR prereq_record IN SELECT * FROM "course_prerequisites" WHERE "course_id" = draft_record.id OR "prerequisite_course_id" = draft_record.id LOOP
      INSERT INTO "catalogue_remediation_audit_logs" (
        "batch_id", "entity_type", "entity_id", "original_data", "action_taken", "reason", "source", "performed_by", "created_at"
      ) VALUES (
        batch_tag, 'course_prerequisite', prereq_record.course_id, row_to_json(prereq_record)::jsonb,
        'deleted_obsolete_draft_prereq', 'Prerequisite relation attached to obsolete draft course ID ' || draft_record.id,
        'system:sprint-12-3-1-cleanup', 'system:remediation', now_ts
      );
      DELETE FROM "course_prerequisites" 
      WHERE "course_id" = prereq_record.course_id 
        AND "prerequisite_course_id" = prereq_record.prerequisite_course_id;
    END LOOP;

    -- Snapshot and clean course record
    INSERT INTO "catalogue_remediation_audit_logs" (
      "batch_id", "entity_type", "entity_id", "original_data", "action_taken", "reason", "source", "performed_by", "created_at"
    ) VALUES (
      batch_tag, 'course', draft_record.id, row_to_json(draft_record)::jsonb,
      'deleted_obsolete_draft', 'Obsolete draft course ID ' || draft_record.id || ' superseded by canonical course ELH-23',
      'system:sprint-12-3-1-cleanup', 'system:remediation', now_ts
    );

    DELETE FROM "courses" WHERE "id" = draft_record.id;
  END LOOP;

  -- 3. Audit and Delete Orphaned / Non-canonical Enrollments (Zero remapping to ELH-01)
  FOR enr_record IN 
    SELECT * FROM "enrollments" 
    WHERE NOT ("course_id" = ANY(valid_ids))
  LOOP
    INSERT INTO "catalogue_remediation_audit_logs" (
      "batch_id", "entity_type", "entity_id", "original_data", "action_taken", "reason", "source", "performed_by", "created_at"
    ) VALUES (
      batch_tag, 'enrollment', enr_record.id, row_to_json(enr_record)::jsonb,
      'deleted_orphan', 'Enrollment referenced non-canonical or non-existent course ID ' || enr_record.course_id,
      'system:sprint-12-3-1-cleanup', 'system:remediation', now_ts
    );

    DELETE FROM "enrollments" WHERE "id" = enr_record.id;
  END LOOP;

  -- 4. Audit and Revoke / Remove Non-canonical Certificates (Zero remapping to ELH-01)
  FOR cert_record IN 
    SELECT * FROM "certificates" 
    WHERE NOT ("course_id" = ANY(valid_ids))
  LOOP
    INSERT INTO "catalogue_remediation_audit_logs" (
      "batch_id", "entity_type", "entity_id", "original_data", "action_taken", "reason", "source", "performed_by", "created_at"
    ) VALUES (
      batch_tag, 'certificate', cert_record.id, row_to_json(cert_record)::jsonb,
      'revoked_certificate', 'Certificate was issued for non-canonical course ID ' || cert_record.course_id || ' and has been revoked',
      'system:sprint-12-3-1-cleanup', 'system:remediation', now_ts
    );

    DELETE FROM "certificates" WHERE "id" = cert_record.id;
  END LOOP;

  -- 5. Prune Pilot Passes and Suspend Passes with 0 Valid Canonical Courses
  FOR pass_record IN 
    SELECT * FROM "company_pilot_passes"
  LOOP
    pruned_ids := ARRAY[]::integer[];
    
    IF pass_record.permitted_course_ids IS NOT NULL AND cardinality(pass_record.permitted_course_ids) > 0 THEN
      FOREACH cid IN ARRAY pass_record.permitted_course_ids
      LOOP
        IF cid = ANY(valid_ids) THEN
          pruned_ids := array_append(pruned_ids, cid);
        END IF;
      END LOOP;
    END IF;

    -- Case A: No valid courses remaining in permitted list
    IF cardinality(pruned_ids) = 0 OR pruned_ids IS NULL THEN
      IF pass_record.status != 'suspended' AND pass_record.status != 'revoked' AND pass_record.status != 'converted' THEN
        INSERT INTO "catalogue_remediation_audit_logs" (
          "batch_id", "entity_type", "entity_id", "original_data", "action_taken", "reason", "source", "performed_by", "created_at"
        ) VALUES (
          batch_tag, 'pilot_pass', pass_record.id, row_to_json(pass_record)::jsonb,
          'suspended_pilot_pass', 'Pilot pass has 0 valid canonical courses remaining. Suspended and flagged for Platform Admin review.',
          'system:sprint-12-3-1-cleanup', 'system:remediation', now_ts
        );

        UPDATE "company_pilot_passes"
        SET "permitted_course_ids" = ARRAY[]::integer[],
            "status" = 'suspended',
            "internal_sales_note" = CASE 
              WHEN "internal_sales_note" IS NULL OR "internal_sales_note" = '' 
              THEN '[REQUIRES REVIEW - NO VALID COURSES REMAINING]'
              WHEN "internal_sales_note" LIKE '%[REQUIRES REVIEW - NO VALID COURSES REMAINING]%'
              THEN "internal_sales_note"
              ELSE '[REQUIRES REVIEW - NO VALID COURSES REMAINING] ' || "internal_sales_note"
            END,
            "updated_at" = now_ts
        WHERE "id" = pass_record.id;
      ELSE
        UPDATE "company_pilot_passes"
        SET "permitted_course_ids" = ARRAY[]::integer[],
            "updated_at" = now_ts
        WHERE "id" = pass_record.id;
      END IF;

    -- Case B: Pruned some invalid courses, but valid courses still remain
    ELSIF pruned_ids != pass_record.permitted_course_ids THEN
      INSERT INTO "catalogue_remediation_audit_logs" (
        "batch_id", "entity_type", "entity_id", "original_data", "action_taken", "reason", "source", "performed_by", "created_at"
      ) VALUES (
        batch_tag, 'pilot_pass', pass_record.id, row_to_json(pass_record)::jsonb,
        'pruned_courses', 'Removed non-canonical course IDs from pilot pass. Kept valid courses: ' || array_to_string(pruned_ids, ', '),
        'system:sprint-12-3-1-cleanup', 'system:remediation', now_ts
      );

      UPDATE "company_pilot_passes"
      SET "permitted_course_ids" = pruned_ids,
          "updated_at" = now_ts
      WHERE "id" = pass_record.id;
    END IF;
  END LOOP;

  -- 6. Cleanly delete any residual unauthorised test courses
  DELETE FROM "courses"
  WHERE "course_code" LIKE 'PILOT-%'
     OR "slug" LIKE 'pilot-test-%'
     OR "slug" LIKE 'sprint-12-3-module-%';

END $$;
