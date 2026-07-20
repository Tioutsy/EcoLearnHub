import { db, companiesTable } from "@workspace/db";
import { logger } from "./logger";

export async function ensureDefaultCompany(): Promise<void> {
  try {
    const existing = await db.select().from(companiesTable).limit(1);
    if (existing.length > 0) {
      logger.info({ count: existing.length }, "Default company seeder: Companies already exist, skipping.");
      return;
    }

    const [company] = await db
      .insert(companiesTable)
      .values({
        name: "EcoLearn Mauritius",
        slug: "ecolearn-mauritius",
        industry: "Corporate Training & Sustainability Solutions",
        logoUrl: "/images/companies/ecolearn-mauritius-logo.png",
        planId: null,
      })
      .returning();

    logger.info({ id: company.id, name: company.name }, "Seeded default company successfully.");
  } catch (err) {
    logger.error({ err }, "Failed to execute default company seeder");
    throw err;
  }
}
