import { Router } from "express";
import { db } from "@workspace/db";
import {
  subscriptionPlansTable,
  employeeBandsTable,
  planPricesTable,
  planCourseEntitlementsTable,
  planFeatureEntitlementsTable,
  companySubscriptionsTable,
  companiesTable,
  coursesTable,
} from "@workspace/db";
import { eq, and, asc, desc } from "drizzle-orm";
import { getCompanyAccess, CompanyAccess } from "../lib/access";
import { resolveBandCodeFromEmployeeCount } from "../lib/ensureHybridSubscriptions";

const router = Router();

// 1. GET /api/subscriptions/public-plans (for public pricing page & onboarding)
router.get("/public-plans", async (_req, res): Promise<void> => {
  const plans = await db
    .select()
    .from(subscriptionPlansTable)
    .where(eq(subscriptionPlansTable.isPublic, true))
    .orderBy(asc(subscriptionPlansTable.displayOrder));

  const bands = await db
    .select()
    .from(employeeBandsTable)
    .where(eq(employeeBandsTable.isActive, true))
    .orderBy(asc(employeeBandsTable.displayOrder));

  const prices = await db
    .select({
      id: planPricesTable.id,
      subscriptionPlanId: planPricesTable.subscriptionPlanId,
      employeeBandId: planPricesTable.employeeBandId,
      currency: planPricesTable.currency,
      monthlyAmount: planPricesTable.monthlyAmount,
      requiresTailoredQuote: planPricesTable.requiresTailoredQuote,
      planCode: subscriptionPlansTable.code,
      bandCode: employeeBandsTable.code,
    })
    .from(planPricesTable)
    .innerJoin(subscriptionPlansTable, eq(planPricesTable.subscriptionPlanId, subscriptionPlansTable.id))
    .innerJoin(employeeBandsTable, eq(planPricesTable.employeeBandId, employeeBandsTable.id))
    .where(eq(planPricesTable.isActive, true));

  const features = await db
    .select({
      subscriptionPlanId: planFeatureEntitlementsTable.subscriptionPlanId,
      featureCode: planFeatureEntitlementsTable.featureCode,
      isEnabled: planFeatureEntitlementsTable.isEnabled,
    })
    .from(planFeatureEntitlementsTable);

  res.json({
    plans: plans.map(p => ({
      ...p,
      features: features.filter(f => f.subscriptionPlanId === p.id && f.isEnabled).map(f => f.featureCode),
    })),
    employeeBands: bands,
    prices: prices.map(pr => ({
      ...pr,
      monthlyAmountMUR: pr.monthlyAmount ? parseFloat(pr.monthlyAmount) : null,
    })),
  });
});

// 2. GET /api/subscriptions/company (for company dashboard)
router.get("/company", async (req, res): Promise<void> => {
  let access: CompanyAccess | null = null;
  try {
    access = await getCompanyAccess(req);
  } catch (e) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (!access || !access.companyId) {
    res.status(404).json({ error: "No company associated with current account" });
    return;
  }

  const subscription = await db
    .select({
      id: companySubscriptionsTable.id,
      companyId: companySubscriptionsTable.companyId,
      status: companySubscriptionsTable.status,
      currency: companySubscriptionsTable.currency,
      agreedMonthlyAmount: companySubscriptionsTable.agreedMonthlyAmount,
      pricingSource: companySubscriptionsTable.pricingSource,
      startsAt: companySubscriptionsTable.startsAt,
      currentPeriodStartsAt: companySubscriptionsTable.currentPeriodStartsAt,
      currentPeriodEndsAt: companySubscriptionsTable.currentPeriodEndsAt,
      planId: subscriptionPlansTable.id,
      planCode: subscriptionPlansTable.code,
      planName: subscriptionPlansTable.name,
      planTagline: subscriptionPlansTable.tagline,
      bandId: employeeBandsTable.id,
      bandCode: employeeBandsTable.code,
      bandLabel: employeeBandsTable.label,
    })
    .from(companySubscriptionsTable)
    .innerJoin(subscriptionPlansTable, eq(companySubscriptionsTable.subscriptionPlanId, subscriptionPlansTable.id))
    .innerJoin(employeeBandsTable, eq(companySubscriptionsTable.employeeBandId, employeeBandsTable.id))
    .where(eq(companySubscriptionsTable.companyId, access.companyId))
    .limit(1)
    .then(r => r[0]);

  if (!subscription) {
    res.status(404).json({ error: "No active subscription found for company" });
    return;
  }

  // Fetch course entitlement IDs for this plan
  const courseEntitlements = await db
    .select({ courseId: planCourseEntitlementsTable.courseId })
    .from(planCourseEntitlementsTable)
    .where(eq(planCourseEntitlementsTable.subscriptionPlanId, subscription.planId));

  const entitledCourseIds = courseEntitlements.map(c => c.courseId);

  res.json({
    ...subscription,
    agreedMonthlyAmountMUR: subscription.agreedMonthlyAmount ? parseFloat(subscription.agreedMonthlyAmount) : null,
    entitledCourseIds,
  });
});

// 3. POST /api/subscriptions/onboard (onboarding subscription request)
router.post("/onboard", async (req, res): Promise<void> => {
  let access: CompanyAccess | null = null;
  try {
    access = await getCompanyAccess(req);
  } catch (e) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { planCode, employeeBandCode, companyName, industry, employeeCount } = req.body;

  if (!planCode || !employeeBandCode) {
    res.status(400).json({ error: "planCode and employeeBandCode are required" });
    return;
  }

  // Server-side price resolution - NEVER trust browser submitted price
  const plan = await db.select().from(subscriptionPlansTable).where(eq(subscriptionPlansTable.code, planCode)).then(r => r[0]);
  const band = await db.select().from(employeeBandsTable).where(eq(employeeBandsTable.code, employeeBandCode)).then(r => r[0]);

  if (!plan || !band) {
    res.status(400).json({ error: "Invalid planCode or employeeBandCode" });
    return;
  }

  const priceRecord = await db
    .select()
    .from(planPricesTable)
    .where(
      and(
        eq(planPricesTable.subscriptionPlanId, plan.id),
        eq(planPricesTable.employeeBandId, band.id),
        eq(planPricesTable.isActive, true)
      )
    )
    .limit(1)
    .then(r => r[0]);

  let companyId = access?.companyId;

  if (!companyId && companyName) {
    // Create new company record
    const [newComp] = await db
      .insert(companiesTable)
      .values({
        name: companyName,
        slug: companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        industry: industry || null,
        employeeCount: parseInt(employeeCount || "25", 10),
      })
      .returning();
    companyId = newComp.id;
  }

  if (!companyId) {
    res.status(400).json({ error: "Company association required" });
    return;
  }

  const isTailored = band.requiresTailoredQuote || !priceRecord || priceRecord.requiresTailoredQuote;

  const [sub] = await db
    .insert(companySubscriptionsTable)
    .values({
      companyId,
      subscriptionPlanId: plan.id,
      employeeBandId: band.id,
      status: isTailored ? "PENDING" : "ACTIVE",
      currency: "MUR",
      agreedMonthlyAmount: isTailored ? null : priceRecord?.monthlyAmount || null,
      pricingSource: isTailored ? "TAILORED" : "STANDARD",
    })
    .onConflictDoUpdate({
      target: [companySubscriptionsTable.companyId],
      set: {
        subscriptionPlanId: plan.id,
        employeeBandId: band.id,
        status: isTailored ? "PENDING" : "ACTIVE",
        agreedMonthlyAmount: isTailored ? null : priceRecord?.monthlyAmount || null,
        pricingSource: isTailored ? "TAILORED" : "STANDARD",
        updatedAt: new Date(),
      },
    })
    .returning();

  res.status(201).json({
    subscription: sub,
    plan,
    employeeBand: band,
    resolvedMonthlyAmountMUR: sub.agreedMonthlyAmount ? parseFloat(sub.agreedMonthlyAmount) : null,
    isTailoredQuote: isTailored,
    message: isTailored 
      ? "Your Elevio subscription request has been received. Our corporate team will contact you with a tailored proposal."
      : "Subscription request received and plan activated.",
  });
});

// 4. GET /api/subscriptions/admin/list (Platform Admin)
router.get("/admin/list", async (req, res): Promise<void> => {
  let access: CompanyAccess | null = null;
  try {
    access = await getCompanyAccess(req);
  } catch (e) {}

  if (!access || access.role !== "platform_admin") {
    res.status(403).json({ error: "Platform admin access required" });
    return;
  }

  const subscriptions = await db
    .select({
      id: companySubscriptionsTable.id,
      companyId: companySubscriptionsTable.companyId,
      companyName: companiesTable.name,
      status: companySubscriptionsTable.status,
      currency: companySubscriptionsTable.currency,
      agreedMonthlyAmount: companySubscriptionsTable.agreedMonthlyAmount,
      pricingSource: companySubscriptionsTable.pricingSource,
      startsAt: companySubscriptionsTable.startsAt,
      planCode: subscriptionPlansTable.code,
      planName: subscriptionPlansTable.name,
      bandCode: employeeBandsTable.code,
      bandLabel: employeeBandsTable.label,
    })
    .from(companySubscriptionsTable)
    .innerJoin(companiesTable, eq(companySubscriptionsTable.companyId, companiesTable.id))
    .innerJoin(subscriptionPlansTable, eq(companySubscriptionsTable.subscriptionPlanId, subscriptionPlansTable.id))
    .innerJoin(employeeBandsTable, eq(companySubscriptionsTable.employeeBandId, employeeBandsTable.id))
    .orderBy(desc(companySubscriptionsTable.createdAt));

  res.json(subscriptions);
});

// 5. PATCH /api/subscriptions/admin/:companyId (Platform Admin Edit Subscription)
router.patch("/admin/:companyId", async (req, res): Promise<void> => {
  let access: CompanyAccess | null = null;
  try {
    access = await getCompanyAccess(req);
  } catch (e) {}

  if (!access || access.role !== "platform_admin") {
    res.status(403).json({ error: "Platform admin access required" });
    return;
  }

  const rawCompId = Array.isArray(req.params.companyId) ? req.params.companyId[0] : req.params.companyId;
  const companyId = parseInt(rawCompId, 10);
  if (isNaN(companyId)) {
    res.status(400).json({ error: "Invalid companyId" });
    return;
  }

  const { planCode, employeeBandCode, agreedMonthlyAmountMUR, status, pricingSource } = req.body;

  const existingSub = await db
    .select()
    .from(companySubscriptionsTable)
    .where(eq(companySubscriptionsTable.companyId, companyId))
    .limit(1)
    .then(r => r[0]);

  if (!existingSub) {
    res.status(404).json({ error: "Subscription record not found for company" });
    return;
  }

  const updateData: Partial<typeof companySubscriptionsTable.$inferInsert> = {};

  if (planCode) {
    const plan = await db.select().from(subscriptionPlansTable).where(eq(subscriptionPlansTable.code, planCode)).then(r => r[0]);
    if (plan) updateData.subscriptionPlanId = plan.id;
  }

  if (employeeBandCode) {
    const band = await db.select().from(employeeBandsTable).where(eq(employeeBandsTable.code, employeeBandCode)).then(r => r[0]);
    if (band) updateData.employeeBandId = band.id;
  }

  if (agreedMonthlyAmountMUR !== undefined) {
    updateData.agreedMonthlyAmount = agreedMonthlyAmountMUR === null ? null : String(agreedMonthlyAmountMUR);
  }

  if (status) updateData.status = status;
  if (pricingSource) updateData.pricingSource = pricingSource;

  updateData.updatedAt = new Date();
  const [updated] = await db
    .update(companySubscriptionsTable)
    .set(updateData)
    .where(eq(companySubscriptionsTable.companyId, companyId))
    .returning();

  res.json(updated);
});

// 6. GET /api/subscriptions/admin/prices & PATCH /api/subscriptions/admin/prices/:id (Platform Admin Price Matrix Governance)
router.get("/admin/prices", async (req, res): Promise<void> => {
  let access: CompanyAccess | null = null;
  try { access = await getCompanyAccess(req); } catch (e) {}
  if (!access || access.role !== "platform_admin") {
    res.status(403).json({ error: "Platform admin access required" });
    return;
  }

  const prices = await db
    .select({
      id: planPricesTable.id,
      planCode: subscriptionPlansTable.code,
      planName: subscriptionPlansTable.name,
      bandCode: employeeBandsTable.code,
      bandLabel: employeeBandsTable.label,
      monthlyAmount: planPricesTable.monthlyAmount,
      requiresTailoredQuote: planPricesTable.requiresTailoredQuote,
      isActive: planPricesTable.isActive,
    })
    .from(planPricesTable)
    .innerJoin(subscriptionPlansTable, eq(planPricesTable.subscriptionPlanId, subscriptionPlansTable.id))
    .innerJoin(employeeBandsTable, eq(planPricesTable.employeeBandId, employeeBandsTable.id))
    .orderBy(asc(subscriptionPlansTable.displayOrder), asc(employeeBandsTable.displayOrder));

  res.json(prices);
});

router.patch("/admin/prices/:id", async (req, res): Promise<void> => {
  let access: CompanyAccess | null = null;
  try { access = await getCompanyAccess(req); } catch (e) {}
  if (!access || access.role !== "platform_admin") {
    res.status(403).json({ error: "Platform admin access required" });
    return;
  }

  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid price ID" });
    return;
  }

  const { monthlyAmountMUR, requiresTailoredQuote } = req.body;

  const [updated] = await db
    .update(planPricesTable)
    .set({
      monthlyAmount: monthlyAmountMUR === null ? null : String(monthlyAmountMUR),
      requiresTailoredQuote: !!requiresTailoredQuote,
    })
    .where(eq(planPricesTable.id, id))
    .returning();

  res.json(updated);
});

export default router;
