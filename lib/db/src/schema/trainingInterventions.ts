import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const trainingInterventionsTable = pgTable(
  "training_interventions",
  {
    id: serial("id").primaryKey(),
    companyId: integer("company_id").notNull(),
    employeeId: integer("employee_id").notNull(),
    assignmentId: integer("assignment_id"),
    interventionType: text("intervention_type").notNull(), // invitation_resent, reminder_sent, due_date_extended, manager_check_in, assignment_waived, commitment_follow_up
    status: text("status").notNull().default("pending"), // pending, completed, cancelled
    initiatedByUserId: text("initiated_by_user_id").notNull(),
    initiatedAt: timestamp("initiated_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    dueAt: timestamp("due_at", { withTimezone: true }),
    reasonCode: text("reason_code"),
    internalNote: text("internal_note"),
    relatedNotificationLogId: integer("related_notification_log_id"),
    outcomeCode: text("outcome_code"), // learner_started, learner_resumed, learner_completed, no_response, support_required
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  }
);

export const insertTrainingInterventionSchema = createInsertSchema(trainingInterventionsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertTrainingIntervention = z.infer<typeof insertTrainingInterventionSchema>;
export type TrainingIntervention = typeof trainingInterventionsTable.$inferSelect;
