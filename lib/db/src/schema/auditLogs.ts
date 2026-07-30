import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const auditLogsTable = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  actorUserId: text("actor_user_id").notNull(),
  actorRole: text("actor_role").notNull(),
  action: text("action").notNull(), // e.g. "employee.created", "course.assigned", "invitation.sent"
  targetType: text("target_type").notNull(), // e.g. "employee", "course_assignment", "department"
  targetId: text("target_id"),
  metadata: text("metadata"), // Stringified JSON or text
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAuditLogSchema = createInsertSchema(auditLogsTable).omit({ id: true, createdAt: true });
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogsTable.$inferSelect;
