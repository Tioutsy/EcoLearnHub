import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const certificatesTable = pgTable("certificates", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  companyId: integer("company_id"),
  employeeId: integer("employee_id"),
  employeeName: text("employee_name"),
  companyName: text("company_name"),
  courseId: integer("course_id").notNull(),
  courseVersion: integer("course_version").notNull().default(1),
  uniqueCode: text("unique_code").notNull().unique(),
  pdfUrl: text("pdf_url"),
  certificateTitle: text("certificate_title"),
  issuedAt: timestamp("issued_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCertificateSchema = createInsertSchema(certificatesTable).omit({ id: true, issuedAt: true });
export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type Certificate = typeof certificatesTable.$inferSelect;
