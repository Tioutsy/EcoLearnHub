-- Migration 0019: Remove Unauthorised Pilot Courses and Restore Canonical Catalogue
-- Sprint 12.3.1 Corrective Migration

-- 1. Re-map any test enrollments on unauthorised courses to canonical course 1 (ELH-01)
UPDATE "enrollments"
SET "course_id" = 1
WHERE "course_id" IN (596, 597, 599, 600, 603, 604, 606, 607, 608, 609, 610, 611, 612, 613, 614, 615);

-- 2. Re-map any certificates on unauthorised courses to canonical course 1 (ELH-01)
UPDATE "certificates"
SET "course_id" = 1
WHERE "course_id" IN (596, 597, 599, 600, 603, 604, 606, 607, 608, 609, 610, 611, 612, 613, 614, 615);

-- 3. Re-map any quiz questions or attempts if any exist
UPDATE "quiz_questions"
SET "course_id" = 1
WHERE "course_id" IN (596, 597, 599, 600, 603, 604, 606, 607, 608, 609, 610, 611, 612, 613, 614, 615);

UPDATE "quiz_attempts"
SET "course_id" = 1
WHERE "course_id" IN (596, 597, 599, 600, 603, 604, 606, 607, 608, 609, 610, 611, 612, 613, 614, 615);

-- 4. Repair pilot passes permitted_course_ids referencing unauthorised courses to canonical course 1 (ELH-01)
UPDATE "company_pilot_passes"
SET "permitted_course_ids" = ARRAY[1]::integer[]
WHERE 596 = ANY("permitted_course_ids")
   OR 597 = ANY("permitted_course_ids")
   OR 599 = ANY("permitted_course_ids")
   OR 600 = ANY("permitted_course_ids")
   OR 603 = ANY("permitted_course_ids")
   OR 604 = ANY("permitted_course_ids")
   OR 606 = ANY("permitted_course_ids")
   OR 607 = ANY("permitted_course_ids")
   OR 608 = ANY("permitted_course_ids")
   OR 609 = ANY("permitted_course_ids")
   OR 610 = ANY("permitted_course_ids")
   OR 611 = ANY("permitted_course_ids")
   OR 612 = ANY("permitted_course_ids")
   OR 613 = ANY("permitted_course_ids")
   OR 614 = ANY("permitted_course_ids")
   OR 615 = ANY("permitted_course_ids");

-- 5. Delete all 16 unauthorised courses
DELETE FROM "courses"
WHERE "id" IN (596, 597, 599, 600, 603, 604, 606, 607, 608, 609, 610, 611, 612, 613, 614, 615);
