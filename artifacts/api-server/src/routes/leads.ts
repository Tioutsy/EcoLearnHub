import { Router } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { db } from "@workspace/db";
import { leadsTable, insertLeadSchema } from "@workspace/db";
import { desc } from "drizzle-orm";

const router = Router();

const ALLOWED_INTERESTS = ["trial", "demo", "proposal"] as const;

// Capture a new lead (trial signup, demo request, or proposal request)
router.post("/", async (req, res): Promise<void> => {
  try {
    const parsed = insertLeadSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid lead details" });
      return;
    }
    const data = parsed.data;

    const interest = ALLOWED_INTERESTS.includes(
      data.interest as (typeof ALLOWED_INTERESTS)[number],
    )
      ? data.interest
      : "trial";

    const name = data.name.trim();
    const email = data.email.trim();
    const companyName = data.companyName.trim();
    if (!name || !email || !companyName) {
      res.status(400).json({ error: "Name, email and company are required" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: "Please enter a valid email address" });
      return;
    }

    const [lead] = await db
      .insert(leadsTable)
      .values({
        name,
        email,
        companyName,
        phone: data.phone?.trim() || null,
        industry: data.industry?.trim() || null,
        employeeRange: data.employeeRange?.trim() || null,
        interest,
        message: data.message?.trim() || null,
        planId: data.planId ?? null,
      })
      .returning();

    res.status(201).json(lead);
  } catch (err) {
    console.error("Failed to capture lead:", err);
    res.status(500).json({ error: "Failed to capture lead" });
  }
});

// List captured leads (admin only, contains contact PII)
router.get("/", async (req, res): Promise<void> => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    // Lead records contain contact PII, so restrict to super admins.
    const user = await clerkClient.users.getUser(userId);
    if (user.publicMetadata?.role !== "super_admin") {
      res.status(403).json({ error: "Super admin access required" });
      return;
    }

    const leads = await db
      .select()
      .from(leadsTable)
      .orderBy(desc(leadsTable.createdAt));
    res.json(leads);
  } catch (err) {
    console.error("Failed to list leads:", err);
    res.status(500).json({ error: "Failed to list leads" });
  }
});

export default router;
