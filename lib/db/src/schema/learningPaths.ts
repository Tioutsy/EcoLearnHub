import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const learningPathsTable = pgTable("learning_paths", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  audience: text("audience").notNull(),
  icon: text("icon").notNull().default("route"),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const learningPathCoursesTable = pgTable("learning_path_courses", {
  id: serial("id").primaryKey(),
  pathId: integer("path_id").notNull(),
  courseId: integer("course_id").notNull(),
  orderIndex: integer("order_index").notNull().default(0),
});

export const insertLearningPathSchema = createInsertSchema(learningPathsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertLearningPath = z.infer<typeof insertLearningPathSchema>;
export type LearningPath = typeof learningPathsTable.$inferSelect;

export const insertLearningPathCourseSchema = createInsertSchema(learningPathCoursesTable).omit({ id: true });
export type InsertLearningPathCourse = z.infer<typeof insertLearningPathCourseSchema>;
export type LearningPathCourse = typeof learningPathCoursesTable.$inferSelect;
