import {
  db,
  subscriptionPlansTable,
  employeeBandsTable,
  planPricesTable,
  planCourseEntitlementsTable,
  planFeatureEntitlementsTable,
  companySubscriptionsTable,
  companiesTable,
  coursesTable,
  categoriesTable,
} from "@workspace/db";
import { eq, and, inArray } from "drizzle-orm";
import { logger } from "./logger";

export const PLANS_CONFIG = [
  {
    code: "ESSENTIAL",
    name: "Essential",
    description: "Core sustainability learning and credible employee training records.",
    tagline: "Core sustainability learning for every employee.",
    displayOrder: 1,
  },
  {
    code: "PROFESSIONAL",
    name: "Professional",
    description: "Practical sustainability implementation across teams and departments.",
    tagline: "Practical learning for workplace action and departments.",
    displayOrder: 2,
  },
  {
    code: "COMPLETE",
    name: "Complete",
    description: "Complete sustainability learning, leadership development and advanced organisational reporting.",
    tagline: "Full learning access for sustainability leadership and reporting.",
    displayOrder: 3,
  },
];

export const BANDS_CONFIG = [
  {
    code: "UP_TO_25",
    label: "Up to 25 employees",
    minimumEmployees: 1,
    maximumEmployees: 25,
    displayOrder: 1,
    requiresTailoredQuote: false,
  },
  {
    code: "FROM_26_TO_50",
    label: "26–50 employees",
    minimumEmployees: 26,
    maximumEmployees: 50,
    displayOrder: 2,
    requiresTailoredQuote: false,
  },
  {
    code: "FROM_51_TO_80",
    label: "51–80 employees",
    minimumEmployees: 51,
    maximumEmployees: 80,
    displayOrder: 3,
    requiresTailoredQuote: false,
  },
  {
    code: "FROM_81_TO_120",
    label: "81–120 employees",
    minimumEmployees: 81,
    maximumEmployees: 120,
    displayOrder: 4,
    requiresTailoredQuote: false,
  },
  {
    code: "OVER_120",
    label: "Over 120 employees",
    minimumEmployees: 121,
    maximumEmployees: null,
    displayOrder: 5,
    requiresTailoredQuote: true,
  },
];

export const PRICING_MATRIX: Record<string, Record<string, number | null>> = {
  ESSENTIAL: {
    UP_TO_25: 3000,
    FROM_26_TO_50: 4500,
    FROM_51_TO_80: 5000,
    FROM_81_TO_120: 6250,
    OVER_120: null,
  },
  PROFESSIONAL: {
    UP_TO_25: 4500,
    FROM_26_TO_50: 6500,
    FROM_51_TO_80: 7500,
    FROM_81_TO_120: 9000,
    OVER_120: null,
  },
  COMPLETE: {
    UP_TO_25: 6000,
    FROM_26_TO_50: 9000,
    FROM_51_TO_80: 11000,
    FROM_81_TO_120: 13500,
    OVER_120: null,
  },
};

import { ensureSchemaModifications } from "./ensureSchemaModifications";

export async function ensureHybridSubscriptions(): Promise<void> {
  try {
    await ensureSchemaModifications();

    // 1. Ensure Subscription Plans
    const planIdMap = new Map<string, number>();
    for (const p of PLANS_CONFIG) {
      const existing = await db
        .select()
        .from(subscriptionPlansTable)
        .where(eq(subscriptionPlansTable.code, p.code))
        .limit(1)
        .then(r => r[0]);

      if (existing) {
        await db
          .update(subscriptionPlansTable)
          .set({
            name: p.name,
            description: p.description,
            tagline: p.tagline,
            displayOrder: p.displayOrder,
          })
          .where(eq(subscriptionPlansTable.id, existing.id));
        planIdMap.set(p.code, existing.id);
      } else {
        const inserted = await db
          .insert(subscriptionPlansTable)
          .values({
            code: p.code,
            name: p.name,
            description: p.description,
            tagline: p.tagline,
            displayOrder: p.displayOrder,
          })
          .returning({ id: subscriptionPlansTable.id });
        planIdMap.set(p.code, inserted[0]!.id);
      }
    }

    // 2. Ensure Employee Bands
    const bandIdMap = new Map<string, number>();
    for (const b of BANDS_CONFIG) {
      const existing = await db
        .select()
        .from(employeeBandsTable)
        .where(eq(employeeBandsTable.code, b.code))
        .limit(1)
        .then(r => r[0]);

      if (existing) {
        await db
          .update(employeeBandsTable)
          .set({
            label: b.label,
            minimumEmployees: b.minimumEmployees,
            maximumEmployees: b.maximumEmployees,
            displayOrder: b.displayOrder,
            requiresTailoredQuote: b.requiresTailoredQuote,
          })
          .where(eq(employeeBandsTable.id, existing.id));
        bandIdMap.set(b.code, existing.id);
      } else {
        const inserted = await db
          .insert(employeeBandsTable)
          .values({
            code: b.code,
            label: b.label,
            minimumEmployees: b.minimumEmployees,
            maximumEmployees: b.maximumEmployees,
            displayOrder: b.displayOrder,
            requiresTailoredQuote: b.requiresTailoredQuote,
          })
          .returning({ id: employeeBandsTable.id });
        bandIdMap.set(b.code, inserted[0]!.id);
      }
    }

    // 3. Ensure Plan Prices
    for (const planCode of Object.keys(PRICING_MATRIX)) {
      const planId = planIdMap.get(planCode);
      if (!planId) continue;

      for (const bandCode of Object.keys(PRICING_MATRIX[planCode]!)) {
        const bandId = bandIdMap.get(bandCode);
        if (!bandId) continue;

        const amount = PRICING_MATRIX[planCode]![bandCode];
        const isTailored = amount === null;

        const existingPrice = await db
          .select()
          .from(planPricesTable)
          .where(
            and(
              eq(planPricesTable.subscriptionPlanId, planId),
              eq(planPricesTable.employeeBandId, bandId),
              eq(planPricesTable.isActive, true)
            )
          )
          .limit(1)
          .then(r => r[0]);

        if (existingPrice) {
          await db
            .update(planPricesTable)
            .set({
              monthlyAmount: isTailored ? null : String(amount),
              requiresTailoredQuote: isTailored,
            })
            .where(eq(planPricesTable.id, existingPrice.id));
        } else {
          await db.insert(planPricesTable).values({
            subscriptionPlanId: planId,
            employeeBandId: bandId,
            currency: "MUR",
            monthlyAmount: isTailored ? null : String(amount),
            requiresTailoredQuote: isTailored,
            isActive: true,
          });
        }
      }
    }

    // 4. Seed Course Entitlements
    const allCourses = await db.select({
      id: coursesTable.id,
      courseCode: coursesTable.courseCode,
      categoryId: coursesTable.categoryId,
    }).from(coursesTable);

    const essentialPlanId = planIdMap.get("ESSENTIAL")!;
    const professionalPlanId = planIdMap.get("PROFESSIONAL")!;
    const completePlanId = planIdMap.get("COMPLETE")!;

    // Category slugs
    const coreCategory = await db.select().from(categoriesTable).where(eq(categoriesTable.slug, "core-sustainability-certificate")).then(r => r[0]);
    const actionCategory = await db.select().from(categoriesTable).where(eq(categoriesTable.slug, "sustainability-in-action")).then(r => r[0]);
    const departmentCategory = await db.select().from(categoriesTable).where(eq(categoriesTable.slug, "sustainability-by-department")).then(r => r[0]);
    const leadershipCategory = await db.select().from(categoriesTable).where(eq(categoriesTable.slug, "leadership-and-sustainability-management")).then(r => r[0]);

    for (const course of allCourses) {
      const code = course.courseCode || "";
      const isCore = (code >= "ELH-01" && code <= "ELH-12") || course.categoryId === coreCategory?.id;

      // Essential Plan: Core courses (ELH-01..12)
      if (isCore) {
        await upsertCourseEntitlement(essentialPlanId, course.id);
      }

      // Professional Plan: Essential + Action + Department
      const isAction = (code >= "ELH-13" && code <= "ELH-23") || course.categoryId === actionCategory?.id;
      const isDepartment = (code >= "ELH-24" && code <= "ELH-30") || course.categoryId === departmentCategory?.id;
      if (isCore || isAction || isDepartment) {
        await upsertCourseEntitlement(professionalPlanId, course.id);
      }

      // Complete Plan: All courses
      await upsertCourseEntitlement(completePlanId, course.id);
    }

    // 5. Seed Feature Entitlements
    const featureMappings: Record<string, string[]> = {
      ESSENTIAL: ["STANDARD_REPORTING", "EXPORT_TRAINING_RECORDS"],
      PROFESSIONAL: ["STANDARD_REPORTING", "EXPORT_TRAINING_RECORDS", "DEPARTMENT_REPORTING", "CATEGORY_PROGRESS"],
      COMPLETE: ["STANDARD_REPORTING", "EXPORT_TRAINING_RECORDS", "DEPARTMENT_REPORTING", "CATEGORY_PROGRESS", "LEADERSHIP_PATHS", "ADVANCED_REPORTING", "FULL_STANDARD_CATALOGUE"],
    };

    for (const [planCode, features] of Object.entries(featureMappings)) {
      const planId = planIdMap.get(planCode);
      if (!planId) continue;

      for (const featCode of features) {
        const existing = await db
          .select()
          .from(planFeatureEntitlementsTable)
          .where(
            and(
              eq(planFeatureEntitlementsTable.subscriptionPlanId, planId),
              eq(planFeatureEntitlementsTable.featureCode, featCode)
            )
          )
          .limit(1)
          .then(r => r[0]);

        if (!existing) {
          await db.insert(planFeatureEntitlementsTable).values({
            subscriptionPlanId: planId,
            featureCode: featCode,
            isEnabled: true,
          });
        }
      }
    }

    // 6. Existing Companies Migration
    const companies = await db.select().from(companiesTable);
    for (const comp of companies) {
      const existingSub = await db
        .select()
        .from(companySubscriptionsTable)
        .where(eq(companySubscriptionsTable.companyId, comp.id))
        .limit(1)
        .then(r => r[0]);

      if (!existingSub) {
        // Resolve band from employeeCount
        const bandCode = resolveBandCodeFromEmployeeCount(comp.employeeCount || 25);
        const bandId = bandIdMap.get(bandCode) || bandIdMap.get("UP_TO_25")!;

        try {
          await db
            .insert(companySubscriptionsTable)
            .values({
              companyId: comp.id,
              subscriptionPlanId: completePlanId, // Migrate existing companies to COMPLETE as protected legacy subscription
              employeeBandId: bandId,
              status: "ACTIVE",
              currency: "MUR",
              agreedMonthlyAmount: "0.00",
              pricingSource: "LEGACY",
            })
            .onConflictDoNothing({ target: companySubscriptionsTable.companyId });
          logger.info({ companyId: comp.id, name: comp.name }, "Migrated existing company to COMPLETE legacy subscription");
        } catch (subErr) {
          // Ignore duplicate conflict if inserted concurrently by another test process
        }
      }
    }

    logger.info("Successfully ensured hybrid subscription plans, bands, prices, entitlements, and company migrations.");
  } catch (err) {
    logger.error({ err }, "Error in ensureHybridSubscriptions");
    throw err;
  }
}

async function upsertCourseEntitlement(subscriptionPlanId: number, courseId: number) {
  const [course] = await db.select({ id: coursesTable.id }).from(coursesTable).where(eq(coursesTable.id, courseId)).limit(1);
  if (!course) return;

  const existing = await db
    .select()
    .from(planCourseEntitlementsTable)
    .where(
      and(
        eq(planCourseEntitlementsTable.subscriptionPlanId, subscriptionPlanId),
        eq(planCourseEntitlementsTable.courseId, courseId)
      )
    )
    .limit(1)
    .then(r => r[0]);

  if (!existing) {
    try {
      await db
        .insert(planCourseEntitlementsTable)
        .values({
          subscriptionPlanId,
          courseId,
          accessType: "INCLUDED",
        })
        .onConflictDoNothing();
    } catch (e) {
      // Ignore conflict or deleted temporary test course foreign key constraint error during parallel test execution
    }
  }
}

export function resolveBandCodeFromEmployeeCount(count: number): string {
  if (count <= 0) return "UP_TO_25";
  if (count <= 25) return "UP_TO_25";
  if (count <= 50) return "FROM_26_TO_50";
  if (count <= 80) return "FROM_51_TO_80";
  if (count <= 120) return "FROM_81_TO_120";
  return "OVER_120";
}
