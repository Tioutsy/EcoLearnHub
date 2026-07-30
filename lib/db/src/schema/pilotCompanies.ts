import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { companiesTable } from "./companies";

export const pilotCompaniesTable = pgTable("pilot_companies", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companiesTable.id, { onDelete: "cascade" }),
  pilotStatus: text("pilot_status").notNull().default("candidate"), // candidate, approved, active, completed, declined
  pilotStage: text("pilot_stage").notNull().default("initial_contact"), // initial_contact, configuration, active_learning, final_review
  approvedByUserId: text("approved_by_user_id"),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  plannedStartDate: timestamp("planned_start_date", { withTimezone: true }),
  actualStartDate: timestamp("actual_start_date", { withTimezone: true }),
  plannedEndDate: timestamp("planned_end_date", { withTimezone: true }),
  actualEndDate: timestamp("actual_end_date", { withTimezone: true }),
  targetLearnerCount: integer("target_learner_count").notNull().default(20),
  approvedLearnerLimit: integer("approved_learner_limit").notNull().default(50),
  selectedCourseIds: integer("selected_course_ids").array().notNull().default([]),
  primaryContactName: text("primary_contact_name"),
  primaryContactEmail: text("primary_contact_email"),
  internalOwnerUserId: text("internal_owner_user_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PilotCompany = typeof pilotCompaniesTable.$inferSelect;
