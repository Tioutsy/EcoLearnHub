import {
  pgTable,
  serial,
  integer,
  text,
  varchar,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { companiesTable } from "./companies";

export const employeeInvitationsTable = pgTable(
  "employee_invitations",
  {
    id: serial("id").primaryKey(),
    companyId: integer("company_id")
      .notNull()
      .references(() => companiesTable.id, { onDelete: "cascade" }),
    batchId: integer("batch_id"),
    email: text("email").notNull(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    department: text("department"),
    jobTitle: text("job_title"),
    departmentId: integer("department_id"),
    jobTitleId: integer("job_title_id"),
    intendedRole: text("intended_role").notNull().default("employee"),
    tokenHash: text("token_hash").notNull(),
    displayCodeHash: text("display_code_hash").notNull(),
    displayCodeLastFour: varchar("display_code_last_four", { length: 4 }).notNull(),
    status: text("status").notNull().default("pending"), // pending, accepted, expired, revoked
    invitedBy: text("invited_by"), // Clerk user ID of administrator
    acceptedBy: text("accepted_by"), // Clerk user ID of employee
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    companyIdIdx: index("idx_employee_invitations_company_id").on(table.companyId),
    batchIdIdx: index("idx_employee_invitations_batch_id").on(table.batchId),
    tokenHashUidx: uniqueIndex("uidx_employee_invitations_token_hash").on(table.tokenHash),
    displayCodeHashUidx: uniqueIndex("uidx_employee_invitations_display_code_hash").on(table.displayCodeHash),
    statusIdx: index("idx_employee_invitations_status").on(table.status),
    companyStatusIdx: index("idx_employee_invitations_company_status").on(table.companyId, table.status),
  })
);

export type EmployeeInvitation = typeof employeeInvitationsTable.$inferSelect;
export type NewEmployeeInvitation = typeof employeeInvitationsTable.$inferInsert;
