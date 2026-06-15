import { pgTable, serial, integer, text, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { employeesTable } from "./employees";

export const courseAssignmentsTable = pgTable(
  "course_assignments",
  {
    id: serial("id").primaryKey(),
    companyId: integer("company_id").notNull(),
    employeeId: integer("employee_id")
      .notNull()
      .references(() => employeesTable.id, { onDelete: "cascade" }),
    courseId: integer("course_id").notNull(),
    assignedAt: timestamp("assigned_at", { withTimezone: true }).notNull().defaultNow(),
    dueDate: timestamp("due_date", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.employeeId, table.courseId)],
);

export const trainingRemindersTable = pgTable("training_reminders", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  employeeId: integer("employee_id")
    .notNull()
    .references(() => employeesTable.id, { onDelete: "cascade" }),
  courseId: integer("course_id"),
  type: text("type").notNull().default("reminder"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCourseAssignmentSchema = createInsertSchema(courseAssignmentsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertCourseAssignment = z.infer<typeof insertCourseAssignmentSchema>;
export type CourseAssignment = typeof courseAssignmentsTable.$inferSelect;

export const insertTrainingReminderSchema = createInsertSchema(trainingRemindersTable).omit({
  id: true,
  createdAt: true,
});
export type InsertTrainingReminder = z.infer<typeof insertTrainingReminderSchema>;
export type TrainingReminder = typeof trainingRemindersTable.$inferSelect;
