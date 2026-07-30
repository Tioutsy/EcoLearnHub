import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { companiesTable } from "./companies";

export const pilotIssuesTable = pgTable("pilot_issues", {
  id: serial("id").primaryKey(),
  pilotCompanyId: integer("pilot_company_id"),
  companyId: integer("company_id").notNull().references(() => companiesTable.id, { onDelete: "cascade" }),
  reportedByUserId: text("reported_by_user_id").notNull(),
  issueType: text("issue_type").notNull().default("content"), // content, quiz, access, notification, progress, reporting, mobile
  severity: text("severity").notNull().default("medium"), // critical, high, medium, low
  status: text("status").notNull().default("new"), // new, triaged, investigating, resolved, closed
  title: text("title").notNull(),
  description: text("description"),
  affectedCourseId: integer("affected_course_id"),
  assignedOwnerUserId: text("assigned_owner_user_id"),
  reportedAt: timestamp("reported_at", { withTimezone: true }).notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  resolutionSummary: text("resolution_summary"),
  releaseBlocking: boolean("release_blocking").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PilotIssue = typeof pilotIssuesTable.$inferSelect;
