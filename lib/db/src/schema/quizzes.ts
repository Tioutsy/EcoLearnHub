import { pgTable, text, serial, integer, boolean, timestamp, unique, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const quizQuestionsTable = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  question: text("question").notNull(),
  options: text("options").array().notNull().default([]),
  correctOption: integer("correct_option").notNull().default(0),
  orderIndex: integer("order_index").notNull().default(0),
  isArchived: boolean("is_archived").notNull().default(false),
  correctExplanation: text("correct_explanation"),
  incorrectExplanation: text("incorrect_explanation"),
  optionFeedback: text("option_feedback").array(),
  practicalTakeaway: text("practical_takeaway"),
  competencyArea: text("competency_area"),
  sourceCourseId: integer("source_course_id"),
  learningOutcome: text("learning_outcome"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  quizQuestionsCourseOrderUnique: unique("quiz_questions_course_order_unique").on(t.courseId, t.orderIndex),
}));

export const quizAttemptsTable = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  courseId: integer("course_id").notNull(),
  courseVersion: integer("course_version").notNull().default(1),
  score: integer("score").notNull().default(0),
  totalQuestions: integer("total_questions").notNull().default(0),
  correctAnswers: integer("correct_answers").notNull().default(0),
  passed: boolean("passed").notNull().default(false),
  competencyScores: jsonb("competency_scores"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertQuizQuestionSchema = createInsertSchema(quizQuestionsTable).omit({ id: true, createdAt: true });
export type InsertQuizQuestion = z.infer<typeof insertQuizQuestionSchema>;
export type QuizQuestion = typeof quizQuestionsTable.$inferSelect;
