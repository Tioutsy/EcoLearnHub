import { pgTable, text, serial, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const courseCommitmentsTable = pgTable(
  "course_commitments",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    courseId: integer("course_id").notNull(),
    courseVersion: integer("course_version").notNull().default(1),
    commitment: text("commitment").notNull(),
    status: text("status").notNull().default("selected"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uniqueUserCourseCommitment: unique().on(t.userId, t.courseId, t.commitment),
  }),
);

export const insertCourseCommitmentSchema = createInsertSchema(courseCommitmentsTable).omit({ id: true, createdAt: true });
export type InsertCourseCommitment = z.infer<typeof insertCourseCommitmentSchema>;
export type CourseCommitment = typeof courseCommitmentsTable.$inferSelect;
