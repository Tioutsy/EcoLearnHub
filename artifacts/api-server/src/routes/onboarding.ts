import { Router } from "express";
import { getCompanyAccess, sendHttpError, getAuthContext, getClaimEmail } from "../lib/access";
import {
  onboardCompany,
  assignStarterCourse,
  getResumableOnboardingStatus,
  saveCompanyDetails,
  savePlanSelection,
  confirmOrderReview,
} from "../lib/companyOnboardingService";

const router = Router();

function extractAuthUser(req: any): { userId: string | null; email: string | null } {
  const auth = getAuthContext(req);
  const fallbackAuth = req.auth;
  const userId = auth.userId ?? fallbackAuth?.userId ?? null;
  const claims = (auth.sessionClaims ?? fallbackAuth?.sessionClaims ?? {}) as Record<string, unknown>;
  const email = getClaimEmail(claims) ?? (claims["email"] as string | undefined) ?? null;
  return { userId, email };
}

// GET /api/onboarding/status — Authoritative server state resolver
router.get("/status", async (req, res): Promise<void> => {
  try {
    const { userId } = extractAuthUser(req);
    if (!userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const status = await getResumableOnboardingStatus(userId);
    res.json(status);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to retrieve onboarding status" });
    }
  }
});

// POST /api/onboarding/company-details — Step 1: Save Company Information
router.post("/company-details", async (req, res): Promise<void> => {
  try {
    const { userId, email } = extractAuthUser(req);
    if (!userId) {
      res.status(401).json({ error: "Authentication required to set up company" });
      return;
    }

    const { companyName, adminName, industry, employeeCount } = req.body;
    if (!companyName || !companyName.trim()) {
      res.status(400).json({ error: "Company name is required" });
      return;
    }

    const result = await saveCompanyDetails({
      userId,
      email,
      adminName: adminName || "Company Administrator",
      companyName,
      industry,
      employeeCount: employeeCount ? parseInt(employeeCount, 10) : 15,
    });

    res.status(200).json(result);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(400).json({ error: err.message || "Failed to save company details" });
    }
  }
});

// POST /api/onboarding/select-plan — Step 2: Select Subscription Plan & Band
router.post("/select-plan", async (req, res): Promise<void> => {
  try {
    const { userId } = extractAuthUser(req);
    if (!userId) {
      res.status(401).json({ error: "Authentication required to select plan" });
      return;
    }

    const { planCode, employeeBandCode, employeeCount, billingInterval } = req.body;

    const result = await savePlanSelection({
      userId,
      planCode,
      employeeBandCode,
      employeeCount: employeeCount !== undefined ? parseInt(employeeCount, 10) : undefined,
      billingInterval,
    });

    res.status(200).json(result);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(400).json({ error: err.message || "Failed to select subscription plan" });
    }
  }
});

// POST /api/onboarding/confirm-order — Step 3: Review Confirmation
router.post("/confirm-order", async (req, res): Promise<void> => {
  try {
    const { userId } = extractAuthUser(req);
    if (!userId) {
      res.status(401).json({ error: "Authentication required to confirm order" });
      return;
    }

    const { agreedToTerms = true } = req.body;

    const result = await confirmOrderReview({
      userId,
      agreedToTerms,
    });

    res.status(200).json(result);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(400).json({ error: err.message || "Failed to confirm order" });
    }
  }
});

// POST /api/onboarding/company — Legacy / Composite Onboarding Endpoint
router.post("/company", async (req, res): Promise<void> => {
  try {
    const { companyName, adminName, employeeCount, employeeBandCode, planCode, billingInterval } = req.body;
    let userId: string | null = null;
    let email: string | null = null;

    try {
      const access = await getCompanyAccess(req);
      userId = access.userId;
      email = access.email;
    } catch (err: any) {
      const authUser = extractAuthUser(req);
      userId = authUser.userId;
      email = authUser.email;
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
