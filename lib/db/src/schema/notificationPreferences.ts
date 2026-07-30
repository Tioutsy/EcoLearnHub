import { pgTable, text, serial, integer, boolean, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const notificationPreferencesTable = pgTable(
  "notification_preferences",
  {
    id: serial("id").primaryKey(),
    companyId: integer("company_id").notNull(),
    employeeId: integer("employee_id"),
    userId: text("user_id"),
    optionalEngagementReminders: boolean("optional_engagement_reminders").notNull().default(true),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (t) => ({
    userPrefIdx: uniqueIndex("notification_preferences_emp_idx").on(t.companyId, t.employeeId),
  })
);

export const insertNotificationPreferenceSchema = createInsertSchema(notificationPreferencesTable).omit({
  id: true,
  updatedAt: true,
});
export type InsertNotificationPreference = z.infer<typeof insertNotificationPreferenceSchema>;
export type NotificationPreference = typeof notificationPreferencesTable.$inferSelect;
