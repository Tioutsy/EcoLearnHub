import { db, plansTable } from "@workspace/db";
import { logger } from "./logger";

export async function ensurePlans(): Promise<void> {
  try {
    const existing = await db.select().from(plansTable).limit(1);
    if (existing.length > 0) {
      logger.info("Plans seeder: Plans already exist, skipping.");
      return;
    }

    const plans = [
      {
        name: "Up to 25 employees",
        slug: "plan-25",
        maxEmployees: 25,
        priceMonthly: "3000.00",
        priceAnnual: "30000.00",
        features: [
          "Access to full sustainability training library",
          "Company dashboard for tracking engagement",
          "Printable certificates for all learners",
          "Basic compliance reporting"
        ]
      },
      {
        name: "26–50 employees",
        slug: "plan-50",
        maxEmployees: 50,
        priceMonthly: "4500.00",
        priceAnnual: "45000.00",
        features: [
          "Access to full sustainability training library",
          "Company dashboard for tracking engagement",
          "Printable certificates for all learners",
          "Basic compliance reporting"
        ]
      },
      {
        name: "51–80 employees",
        slug: "plan-80",
        maxEmployees: 80,
        priceMonthly: "5000.00",
        priceAnnual: "50000.00",
        features: [
          "Access to full sustainability training library",
          "Company dashboard for tracking engagement",
          "Printable certificates for all learners",
          "Basic compliance reporting"
        ]
      },
      {
        name: "81–120 employees",
        slug: "plan-120",
        maxEmployees: 120,
        priceMonthly: "6250.00",
        priceAnnual: "62500.00",
        features: [
          "Access to full sustainability training library",
          "Company dashboard for tracking engagement",
          "Printable certificates for all learners",
          "Basic compliance reporting"
        ]
      }
    ];

    for (const plan of plans) {
      await db.insert(plansTable).values(plan);
    }

    logger.info("Seeded plans successfully.");
  } catch (err) {
    logger.error({ err }, "Failed to seed plans");
    throw err;
  }
}
