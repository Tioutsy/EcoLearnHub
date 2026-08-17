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
  employeesTable,
} from "@workspace/db";
import { eq, and, or, asc, desc } from "drizzle-orm";
import { getCompanyAccess, CompanyAccess } from "../lib/access";
import { resolveBandCodeFromEmployeeCount } from "../lib/ensureHybridSubscriptions";
import { calculateSubscriptionPricing } from "../lib/subscriptionPricingService";

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
    prices: prices.map(pr => {
      const monthlyAmountNum = pr.monthlyAmount ? parseFloat(pr.monthlyAmount) : null;
      const yearlyCalc = calculateSubscriptionPricing(monthlyAmountNum, "YEARLY", pr.requiresTailoredQuote);
      return {
        ...pr,
        monthlyAmountMUR: monthlyAmountNum,
        yearlyAmountMUR: yearlyCalc.finalAmount,
        yearlyUndiscountedMUR: yearlyCalc.undiscountedTotal,
        yearlyDiscountMUR: yearlyCalc.discountAmount,
        yearlySavingsMUR: yearlyCalc.annualSavings,
        yearlyEquivalentMonthlyMUR: yearlyCalc.equivalentMonthlyAmount,
        discountPercentage: yearlyCalc.discountPercentage,
      };
    }),
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
      billingInterval: companySubscriptionsTable.billingInterval,
      discountPercentage: companySubscriptionsTable.discountPercentage,
      agreedMonthlyAmount: companySubscriptionsTable.agreedMonthlyAmount,
      agreedYearlyAmount: companySubscriptionsTable.agreedYearlyAmount,
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
  const agreedMonthly = subscription.agreedMonthlyAmount ? parseFloat(subscription.agreedMonthlyAmount) : null;
  const agreedYearly = subscription.agreedYearlyAmount ? parseFloat(subscription.agreedYearlyAmount) : null;
  const interval = subscription.billingInterval || "MONTHLY";
  const pricingBreakdown = calculateSubscriptionPricing(agreedMonthly, interval, false);

  res.json({
    ...subscription,
    billingInterval: interval,
    agreedMonthlyAmountMUR: agreedMonthly,
    agreedYearlyAmountMUR: agreedYearly,
    discountPercentage: subscription.discountPercentage ? parseFloat(subscription.discountPercentage) : 0,
    annualSavingsMUR: pricingBreakdown.annualSavings,
    equivalentMonthlyAmountMUR: pricingBreakdown.equivalentMonthlyAmount,
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

  const { planCode, employeeBandCode, companyName, industry, employeeCount, billingInterval } = req.body;

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

  const isTailored = band.requiresTailoredQuote || band.code === "OVER_120";

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

  let pricingBreakdown;
  try {
    const monthlyBase = priceRecord?.monthlyAmount ? parseFloat(priceRecord.monthlyAmount) : null;
    pricingBreakdown = calculateSubscriptionPricing(monthlyBase, billingInterval, isTailored || priceRecord?.requiresTailoredQuote || false);
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Invalid billing interval" });
    return;
  }

  let companyId = access?.companyId;

  if (!companyId && companyName) {
    const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const [newComp] = await db
      .insert(companiesTable)
      .values({
        name: companyName,
        slug,
        industry: industry || null,
        employeeCount: parseInt(employeeCount || "25", 10),
        maxEmployees: band.maximumEmployees || 25,
        planId: plan.id,
      })
      .returning();
    companyId = newComp.id;
  }

  if (!companyId) {
    res.status(400).json({ error: "Company association required" });
    return;
  }

  const initialStatus = isTailored ? "PENDING" : "PENDING_PAYMENT";

  const [sub] = await db
    .insert(companySubscriptionsTable)
    .values({
      companyId,
      subscriptionPlanId: plan.id,
      employeeBandId: band.id,
      status: initialStatus,
      currency: "MUR",
      billingInterval: pricingBreakdown.billingInterval,
      discountPercentage: String(pricingBreakdown.discountPercentage),
      agreedMonthlyAmount: pricingBreakdown.monthlyBasePrice ? pricingBreakdown.monthlyBasePrice.toFixed(2) : null,
      agreedYearlyAmount: pricingBreakdown.finalAmount && pricingBreakdown.billingInterval === "YEARLY" ? pricingBreakdown.finalAmount.toFixed(2) : null,
      pricingSource: isTailored ? "TAILORED" : "STANDARD",
    })
    .onConflictDoUpdate({
      target: [companySubscriptionsTable.companyId],
      set: {
        subscriptionPlanId: plan.id,
        employeeBandId: band.id,
        status: initialStatus,
        billingInterval: pricingBreakdown.billingInterval,
        discountPercentage: String(pricingBreakdown.discountPercentage),
        agreedMonthlyAmount: pricingBreakdown.monthlyBasePrice ? pricingBreakdown.monthlyBasePrice.toFixed(2) : null,
        agreedYearlyAmount: pricingBreakdown.finalAmount && pricingBreakdown.billingInterval === "YEARLY" ? pricingBreakdown.finalAmount.toFixed(2) : null,
        pricingSource: isTailored ? "TAILORED" : "STANDARD",
        updatedAt: new Date(),
      },
    })
    .returning();

  // Elevate registering user's role to COMPANY_ADMIN (admin) in employeesTable
  const clauses = [eq(employeesTable.clerkUserId, access.userId)];
  if (access.email) {
    clauses.push(eq(employeesTable.email, access.email));
  }
  const [existingEmployee] = await db
    .select()
    .from(employeesTable)
    .where(or(...clauses))
    .limit(1);

  if (existingEmployee) {
    await db
      .update(employeesTable)
      .set({ role: "admin", companyId })
      .where(eq(employeesTable.id, existingEmployee.id));
  } else {
    await db
      .insert(employeesTable)
      .values({
        clerkUserId: access.userId,
        email: access.email || `${access.userId}@elevio.mu`,
        name: access.email ? access.email.split("@")[0] : "Company Administrator",
        companyId,
        role: "admin",
        invitationStatus: "accepted",
        invitationAcceptedAt: new Date(),
      });
  }

  res.status(201).json({
    subscription: sub,
    plan,
    employeeBand: band,
    pricingBreakdown,
    resolvedMonthlyAmountMUR: pricingBreakdown.monthlyBasePrice,
    resolvedFinalAmountMUR: pricingBreakdown.finalAmount,
    isTailoredQuote: isTailored,
    message: isTailored 
      ? "Your Elevio subscription request has been received. Our corporate team will contact you with a tailored proposal."
      : "Subscription request received. Please complete payment to activate full access.",
  });
});

// 3b. POST /api/subscriptions/confirm-payment (Platform Admin / Webhook Verified Activation)
router.post("/confirm-payment", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    const isPlatformAdmin = access.role === "platform_admin";
    const webhookSecretHeader = req.headers["x-payment-webhook-secret"];
    const isValidWebhook = webhookSecretHeader && process.env.PAYMENT_WEBHOOK_SECRET && webhookSecretHeader === process.env.PAYMENT_WEBHOOK_SECRET;

    if (!isPlatformAdmin && !isValidWebhook) {
      res.status(403).json({
        error: "Forbidden: Direct payment activation is not permitted. Subscriptions require platform administrator reconciliation or verified payment provider webhooks."
      });
      return;
    }

    const { companyId: reqCompanyId, paymentReference, provider } = req.body;
    const targetCompanyId = reqCompanyId || access.companyId;

    if (!targetCompanyId) {
      res.status(400).json({ error: "Company association required" });
      return;
    }

    if (!paymentReference || typeof paymentReference !== "string" || paymentReference.trim().length < 4) {
      res.status(400).json({ error: "Valid paymentReference is required for server confirmation" });
      return;
    }

    const [sub] = await db
      .select()
      .from(companySubscriptionsTable)
      .where(eq(companySubscriptionsTable.companyId, targetCompanyId))
      .limit(1);

    if (!sub) {
      res.status(404).json({ error: "No subscription record found for company" });
      return;
    }

    const updated = await db
      .update(companySubscriptionsTable)
      .set({
        status: "ACTIVE",
        startsAt: new Date(),
        currentPeriodStartsAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(companySubscriptionsTable.id, sub.id))
      .returning()
      .then(r => r[0]);

    res.json({
      message: "Payment successfully verified. Subscription activated.",
      subscription: updated,
      paymentReference: paymentReference.trim(),
      provider: provider || "VERIFIED_B2B_RECONCILIATION",
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to confirm payment" });
  }
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
