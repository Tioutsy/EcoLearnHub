import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const employeesTable = pgTable("employees", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  clerkUserId: text("clerk_user_id"),
  email: text("email").notNull(),
  name: text("name").notNull(),
  department: text("department"),
  jobTitle: text("job_title"),
  role: text("role").notNull().default("employee"),
  invitationStatus: text("invitation_status").notNull().default("not_invited"),
  invitationToken: text("invitation_token"),
  invitationSentAt: timestamp("invitation_sent_at", { withTimezone: true }),
  invitationAcceptedAt: timestamp("invitation_accepted_at", { withTimezone: true }),
  enrolledCourses: integer("enrolled_courses").notNull().default(0),
  completedCourses: integer("completed_courses").notNull().default(0),
  certificates: integer("certificates").notNull().default(0),
  avgScore: integer("avg_score").notNull().default(0),
  learningMinutes: integer("learning_minutes").notNull().default(0),
  lastActiveAt: timestamp("last_active_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertEmployeeSchema = createInsertSchema(employeesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employeesTable.$inferSelect;
