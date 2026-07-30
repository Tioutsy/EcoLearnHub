import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const learnerCommitmentsTable = pgTable(
  "learner_commitments",
  {
    id: serial("id").primaryKey(),
    companyId: integer("company_id").notNull(),
    employeeId: integer("employee_id").notNull(),
    courseId: integer("course_id").notNull(),
    courseVersion: integer("course_version").notNull().default(1),
    enrollmentId: integer("enrollment_id"),
    commitmentType: text("commitment_type").notNull().default("suggested"), // suggested, custom
    commitmentText: text("commitment_text").notNull(),
    targetDate: timestamp("target_date", { withTimezone: true }),
    status: text("status").notNull().default("planned"), // planned, in_progress, completed_self_reported, completed_manager_confirmed, not_applicable, cancelled, overdue
    completedAt: timestamp("completed_at", { withTimezone: true }),
    learnerReflection: text("learner_reflection"),
    managerConfirmationStatus: text("manager_confirmation_status").notNull().default("unrequested"), // unrequested, pending, confirmed, rejected
    managerConfirmedByUserId: text("manager_confirmed_by_user_id"),
    managerConfirmedAt: timestamp("manager_confirmed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  }
);

export const insertLearnerCommitmentSchema = createInsertSchema(learnerCommitmentsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertLearnerCommitment = z.infer<typeof insertLearnerCommitmentSchema>;
export type LearnerCommitment = typeof learnerCommitmentsTable.$inferSelect;
