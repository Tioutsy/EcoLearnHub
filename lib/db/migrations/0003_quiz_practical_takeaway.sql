-- Add practical_takeaway column to quiz_questions table
ALTER TABLE "quiz_questions" ADD COLUMN IF NOT EXISTS "practical_takeaway" text;
