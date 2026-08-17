import { Router } from "express";
import { getCompanyAccess, sendHttpError } from "../lib/access";
import { onboardCompany, assignStarterCourse } from "../lib/companyOnboardingService";
import { db, companiesTable, employeesTable, companySubscriptionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// POST /api/onboarding/company
router.post("/company", async (req, res): Promise<void> => {
  try {
    const { companyName, adminName, employeeCount, employeeBandCode, planCode, billingInterval } = req.body;

    // Must be authenticated via Clerk
    let userId: string | null = null;
    let email: string | null = null;

    try {
      const access = await getCompanyAccess(req);
      userId = access.userId;
      email = access.email;
    } catch (err: any) {
      // If 403 because unlinked user, extract userId from req.auth
      const reqAuth = (req as any).auth;
      if (reqAuth && reqAuth.userId) {
        userId = reqAuth.userId;
        email = reqAuth.sessionClaims?.email || null;
      } else {
        res.status(401).json({ error: "Authentication required to onboard a company" });
        return;
      }
    }

    if (!userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const result = await onboardCompany({
      userId,
      email,
      adminName: adminName || "Company Admin",
      companyName,
      employeeCount: employeeCount ? parseInt(employeeCount, 10) : 10,
      employeeBandCode,
      planCode,
      billingInterval,
    });

    if (result.outcome === "tailored_contact_required") {
      res.status(200).json(result);
      return;
    }

    res.status(result.outcome === "already_onboarded" ? 200 : 201).json(result);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(400).json({ error: err.message || "Failed to complete company onboarding" });
    }
  }
});

// GET /api/onboarding/status
router.get("/status", async (req, res): Promise<void> => {
  try {
    const reqAuth = (req as any).auth;
    const userId = reqAuth?.userId;
    if (!userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const [emp] = await db
      .select()
      .from(employeesTable)
      .where(eq(employeesTable.clerkUserId, userId))
      .limit(1);

    if (!emp) {
      res.json({
        hasCompany: false,
        onboardingStage: "account-created",
      });
      return;
    }

    const [company] = await db
      .select()
      .from(companiesTable)
      .where(eq(companiesTable.id, emp.companyId))
      .limit(1);

    const [subscription] = await db
      .select()
      .from(companySubscriptionsTable)
      .where(eq(companySubscriptionsTable.companyId, emp.companyId))
      .limit(1);

    res.json({
      hasCompany: true,
      role: emp.role,
      company,
      subscription,
      onboardingStage: "onboarding-complete",
    });
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to retrieve onboarding status" });
    }
  }
});

// POST /api/onboarding/first-training
router.post("/first-training", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (access.role !== "company_admin" && access.role !== "platform_admin") {
      res.status(403).json({ error: "Company administrator access required" });
      return;
    }

    const { courseCode = "ELH-01", dueDateDays = 30 } = req.body;
    const result = await assignStarterCourse(
      access.companyId,
      access.userId,
      courseCode,
      parseInt(dueDateDays, 10) || 30
    );

    res.json({
      message: `Starter course ${result.courseTitle} assigned successfully`,
      assignedCount: result.assignedCount,
      courseTitle: result.courseTitle,
    });
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(400).json({ error: err.message || "Failed to assign starter course" });
    }
  }
});

export default router;
