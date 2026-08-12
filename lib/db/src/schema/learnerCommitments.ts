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
    actionCategory: text("action_category").notNull().default("workplace-practice"), // waste, energy, water, procurement, biodiversity, workplace-practice, governance, social, other
    targetDate: timestamp("target_date", { withTimezone: true }),
    status: text("status").notNull().default("committed"), // committed, planned, in_progress, action-reported, completed_self_reported, manager-confirmed, completed_manager_confirmed, follow-up-requested, closed-without-confirmation, cancelled, overdue
    completedAt: timestamp("completed_at", { withTimezone: true }),
    employeeProgressNote: text("employee_progress_note"),
    learnerReflection: text("learner_reflection"),
    managerResponseNote: text("manager_response_note"),
    managerConfirmationStatus: text("manager_confirmation_status").notNull().default("unrequested"), // unrequested, pending, confirmed, rejected, follow-up-requested
    managerConfirmedByUserId: text("manager_confirmed_by_user_id"),
    managerConfirmedAt: timestamp("manager_confirmed_at", { withTimezone: true }),
    employeeSubmittedAt: timestamp("employee_submitted_at", { withTimezone: true }).defaultNow(),
    actionReportedAt: timestamp("action_reported_at", { withTimezone: true }),
    managerReviewedAt: timestamp("manager_reviewed_at", { withTimezone: true }),
    reviewedByEmployeeId: integer("reviewed_by_employee_id"),
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
