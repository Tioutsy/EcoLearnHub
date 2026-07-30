import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { companiesTable } from "./companies";

export const pilotLearningPlansTable = pgTable("pilot_learning_plans", {
  id: serial("id").primaryKey(),
  pilotCompanyId: integer("pilot_company_id").notNull(),
  companyId: integer("company_id").notNull().references(() => companiesTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  courseIds: integer("course_ids").array().notNull().default([]),
  requiredCourseIds: integer("required_course_ids").array().notNull().default([]),
  defaultDueDays: integer("default_due_days").notNull().default(30),
  commitmentEnabled: boolean("commitment_enabled").notNull().default(true),
  createdByUserId: text("created_by_user_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PilotLearningPlan = typeof pilotLearningPlansTable.$inferSelect;
