import { pgTable, text, serial, integer, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const notificationDeliveryLogsTable = pgTable(
  "notification_delivery_logs",
  {
    id: serial("id").primaryKey(),
    companyId: integer("company_id").notNull(),
    employeeId: integer("employee_id"),
    userId: text("user_id"),
    assignmentId: integer("assignment_id"),
    notificationType: text("notification_type").notNull(),
    channel: text("channel").notNull().default("email"),
    recipient: text("recipient").notNull(),
    deduplicationKey: text("deduplication_key").notNull().unique(),
    scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
    attemptedAt: timestamp("attempted_at", { withTimezone: true }),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    status: text("status").notNull().default("pending"), // pending, processing, delivered, failed, skipped, cancelled
    retryCount: integer("retry_count").notNull().default(0),
    failureCode: text("failure_code"),
    failureMessage: text("failure_message"),
    providerMessageId: text("provider_message_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (t) => ({
    dedupIdx: uniqueIndex("notification_delivery_logs_dedup_idx").on(t.deduplicationKey),
  })
);

export const insertNotificationDeliveryLogSchema = createInsertSchema(notificationDeliveryLogsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertNotificationDeliveryLog = z.infer<typeof insertNotificationDeliveryLogSchema>;
export type NotificationDeliveryLog = typeof notificationDeliveryLogsTable.$inferSelect;
