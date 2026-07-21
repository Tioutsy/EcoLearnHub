import { Router } from "express";
import { db } from "@workspace/db";
import { plansTable, subscriptionsTable, companiesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateCheckoutSessionBody } from "@workspace/api-zod";

const router = Router();

router.get("/", async (_req, res): Promise<void> => {
  const plans = await db.select().from(plansTable).orderBy(plansTable.id);
  res.json(
    plans.map((p) => ({
      ...p,
      priceMonthly: parseFloat(p.priceMonthly),
      priceAnnual: parseFloat(p.priceAnnual),
    })),
  );
});

// Subscriptions
router.get("/subscriptions/current", async (_req, res): Promise<void> => {
  const companies = await db.select().from(companiesTable).orderBy(companiesTable.id).limit(1);
  if (!companies.length) {
    res.status(404).json({ error: "No company found" });
    return;
  }

  const [sub] = await db
    .select({
      id: subscriptionsTable.id,
      companyId: subscriptionsTable.companyId,
      planId: subscriptionsTable.planId,
      planName: plansTable.name,
      status: subscriptionsTable.status,
      currentPeriodStart: subscriptionsTable.currentPeriodStart,
      currentPeriodEnd: subscriptionsTable.currentPeriodEnd,
      stripeSubscriptionId: subscriptionsTable.stripeSubscriptionId,
      cancelAtPeriodEnd: subscriptionsTable.cancelAtPeriodEnd,
    })
    .from(subscriptionsTable)
    .leftJoin(plansTable, eq(subscriptionsTable.planId, plansTable.id))
    .where(eq(subscriptionsTable.companyId, companies[0].id));

  if (!sub) {
    res.status(404).json({ error: "No active subscription" });
    return;
  }
  res.json(sub);
});

router.post("/subscriptions/checkout", async (req, res): Promise<void> => {
  const parsed = CreateCheckoutSessionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  // In production, this would create a Stripe checkout session
  // For now, return a demo URL
  res.json({ url: `${req.headers.origin || "http://localhost"}/pricing?checkout=demo` });
});

router.post("/subscriptions/portal", async (_req, res): Promise<void> => {
  // In production, this would create a Stripe customer portal session
  res.json({ url: `${_req.headers.origin || "http://localhost"}/pricing?portal=demo` });
});

export default router;
