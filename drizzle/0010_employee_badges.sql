-- 1. Add 'code' column to 'badge_definitions'
ALTER TABLE badge_definitions ADD COLUMN IF NOT EXISTS code text;

-- 2. Backfill 'code' based on existing slugs
UPDATE badge_definitions SET code = 'COURSE_ELH_01_COMPLETE' WHERE slug IN ('sustainability-champion', 'sustainability-foundations');
UPDATE badge_definitions SET code = 'COURSE_ELH_02_COMPLETE' WHERE slug IN ('waste-warrior', 'waste-sorting');
UPDATE badge_definitions SET code = 'COURSE_ELH_03_COMPLETE' WHERE slug IN ('energy-saver', 'energy-efficiency-at-work');
UPDATE badge_definitions SET code = 'COURSE_ELH_04_COMPLETE' WHERE slug IN ('water-wise-at-work', 'water-conservation');
UPDATE badge_definitions SET code = 'COURSE_ELH_05_COMPLETE' WHERE slug IN ('sustainable-procurement-champion', 'sustainable-procurement');
UPDATE badge_definitions SET code = 'COURSE_ELH_06_COMPLETE' WHERE slug IN ('green-office-champion', 'green-office-practices');
UPDATE badge_definitions SET code = 'COURSE_ELH_07_COMPLETE' WHERE slug IN ('carbon-neutral-champion', 'carbon-footprint-awareness');
UPDATE badge_definitions SET code = 'COURSE_ELH_08_COMPLETE' WHERE slug IN ('biodiversity-champion', 'biodiversity-in-mauritius');
UPDATE badge_definitions SET code = 'COURSE_ELH_09_COMPLETE' WHERE slug IN ('esg-champion', 'esg-basics');
UPDATE badge_definitions SET code = 'COURSE_ELH_10_COMPLETE' WHERE slug IN ('environmental-compliance-champion', 'environmental-compliance');
UPDATE badge_definitions SET code = 'COURSE_ELH_11_COMPLETE' WHERE slug IN ('circular-economy-champion', 'circular-economy');
UPDATE badge_definitions SET code = 'COURSE_ELH_12_COMPLETE' WHERE slug IN ('core-sustainability-certified', 'final-sustainability-certification');

-- Populate any default/fallback code for other badges
UPDATE badge_definitions SET code = UPPER(REPLACE(slug, '-', '_')) WHERE code IS NULL;

-- 3. Add uniqueness constraint to 'code' in 'badge_definitions'
ALTER TABLE badge_definitions ADD CONSTRAINT badge_definitions_code_key UNIQUE (code);

-- 4. Create 'employee_badges' table
CREATE TABLE IF NOT EXISTS "employee_badges" (
  "id" serial PRIMARY KEY,
  "employee_id" integer NOT NULL REFERENCES "employees"("id") ON DELETE CASCADE,
  "company_id" integer NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
  "badge_id" integer NOT NULL REFERENCES "badge_definitions"("id") ON DELETE CASCADE,
  "earned_at" timestamp with time zone NOT NULL DEFAULT now(),
  "award_source" text NOT NULL,
  CONSTRAINT "uniq_employee_badge" UNIQUE ("employee_id", "badge_id")
);
