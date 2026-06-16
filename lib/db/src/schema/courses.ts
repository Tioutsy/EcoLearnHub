import { pgTable, text, serial, integer, numeric, boolean, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const coursesTable = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").unique(),
  description: text("description").notNull(),
  categoryId: integer("category_id").notNull(),
  durationMinutes: integer("duration_minutes").notNull().default(60),
  priceUsd: numeric("price_usd", { precision: 10, scale: 2 }).notNull().default("0"),
  level: text("level").notNull().default("beginner"),
  isFeatured: boolean("is_featured").notNull().default(false),
  thumbnailUrl: text("thumbnail_url"),
  previewVideoUrl: text("preview_video_url"),
  learningObjectives: text("learning_objectives").array().notNull().default([]),
  enrollmentCount: integer("enrollment_count").notNull().default(0),
  rating: numeric("rating", { precision: 3, scale: 1 }),
  includesCertificate: boolean("includes_certificate").notNull().default(true),
  passingScore: integer("passing_score").notNull().default(70),
  isPublished: boolean("is_published").notNull().default(true),
  isMandatory: boolean("is_mandatory").notNull().default(false),
  validityMonths: integer("validity_months"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const lessonsTable = pgTable("lessons", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  title: text("title").notNull(),
  orderIndex: integer("order_index").notNull().default(0),
  durationMinutes: integer("duration_minutes").notNull().default(10),
  videoUrl: text("video_url"),
  pdfUrl: text("pdf_url"),
  content: text("content"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  lessonsCourseOrderUnique: unique("lessons_course_order_unique").on(t.courseId, t.orderIndex),
}));

export const insertCourseSchema = createInsertSchema(coursesTable).omit({ id: true, createdAt: true, updatedAt: true, enrollmentCount: true });
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof coursesTable.$inferSelect;

export const insertLessonSchema = createInsertSchema(lessonsTable).omit({ id: true, createdAt: true });
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type Lesson = typeof lessonsTable.$inferSelect;
