import { Router } from "express";
import { getCompanyAccess, HttpError, sendHttpError } from "../lib/access";
import { db, companiesTable, employeesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// GET /api/auth/me — Authoritative server-resolved identity, role & permissions
router.get("/me", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);

    const [company] = access.companyId
      ? await db
          .select({ id: companiesTable.id, name: companiesTable.name, slug: companiesTable.slug })
          .from(companiesTable)
          .where(eq(companiesTable.id, access.companyId))
          .limit(1)
      : [null];

    const isSuper = access.role === "platform_admin";
    const isCompAdmin = access.role === "company_admin";
    const isMgr = access.role === "manager";
    const isLrn = access.role === "employee";

    let roleLabel = "Learner";
    if (isSuper) roleLabel = "Platform Administrator";
    else if (isCompAdmin) roleLabel = "Company Administrator";
    else if (isMgr) roleLabel = "Manager";

    res.json({
      userId: access.userId,
      email: access.email,
      role: access.role,
      roleLabel,
      companyId: access.companyId,
      companyName: company?.name ?? null,
      employeeId: access.employee?.id ?? null,
      employeeName: access.employee?.name ?? null,
      isPlatformAdmin: isSuper,
      isCompanyAdmin: isCompAdmin,
      isManager: isMgr,
      isLearner: isLrn,
      capabilities: {
        canManageCompany: isSuper || isCompAdmin,
        canManageEmployees: isSuper || isCompAdmin,
        canViewReports: isSuper || isCompAdmin || isMgr,
        canAssignCourses: isSuper || isCompAdmin || isMgr,
        canReviewChallenges: isSuper || isCompAdmin || isMgr,
      },
    });
  } catch (err: any) {
    if (err instanceof HttpError) {
      // Unlinked authenticated user or 403
      const reqAuth = (req as any).auth;
      if (reqAuth && reqAuth.userId) {
        res.json({
          userId: reqAuth.userId,
          email: reqAuth.sessionClaims?.email || null,
          role: "unlinked",
          roleLabel: "Learner",
          companyId: null,
          companyName: null,
          employeeId: null,
          employeeName: null,
          isPlatformAdmin: false,
          isCompanyAdmin: false,
          isManager: false,
          isLearner: true,
          capabilities: {
            canManageCompany: false,
            canManageEmployees: false,
            canViewReports: false,
            canAssignCourses: false,
            canReviewChallenges: false,
          },
        });
        return;
      }
      res.status(err.status).json({ error: err.message });
      return;
    }
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to resolve authoritative user identity" });
    }
  }
});

export default router;
