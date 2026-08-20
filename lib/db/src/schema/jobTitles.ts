import { pgTable, text, serial, integer, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { companiesTable } from "./companies";

export const jobTitlesTable = pgTable(
  "job_titles",
  {
    id: serial("id").primaryKey(),
    companyId: integer("company_id")
      .notNull()
      .references(() => companiesTable.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    code: text("code"),
    status: text("status").notNull().default("active"), // "active" | "archived"
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    companyJobTitleUidx: uniqueIndex("uidx_job_titles_company_name").on(
      table.companyId,
      table.name
    ),
  })
);

export const insertJobTitleSchema = createInsertSchema(jobTitlesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertJobTitle = z.infer<typeof insertJobTitleSchema>;
export type JobTitle = typeof jobTitlesTable.$inferSelect;
