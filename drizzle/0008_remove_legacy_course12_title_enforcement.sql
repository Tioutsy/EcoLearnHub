-- Drop the trigger from the courses table
DROP TRIGGER IF EXISTS "enforce_course12_title_trigger" ON "courses";

-- Drop the check constraint from the courses table
ALTER TABLE "courses" DROP CONSTRAINT IF EXISTS "check_course12_title";

-- Drop the trigger function (safely assuming no other trigger uses it)
DROP FUNCTION IF EXISTS "enforce_course12_title"();

-- Update Course 12's title to the canonical product title
UPDATE "courses" SET "title" = 'Final Sustainability Certification' WHERE "id" = 12;
