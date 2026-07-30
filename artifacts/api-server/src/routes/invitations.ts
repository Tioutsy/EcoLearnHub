import { Router } from "express";
import { db, employeesTable, companiesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getCompanyAccess, sendHttpError } from "../lib/access";
import { acceptInvitation } from "../lib/invitationService";

const router = Router();

// GET /api/invitations/verify?token=XXX
router.get("/verify", async (req, res): Promise<void> => {
  const token = typeof req.query.token === "string" ? req.query.token.trim() : null;
  if (!token) {
    res.status(400).json({ error: "Token query parameter is required" });
    return;
  }

  const [emp] = await db
    .select({
      id: employeesTable.id,
      name: employeesTable.name,
      email: employeesTable.email,
      role: employeesTable.role,
      invitationStatus: employeesTable.invitationStatus,
      companyId: employeesTable.companyId,
    })
    .from(employeesTable)
    .where(eq(employeesTable.invitationToken, token))
    .limit(1);

  if (!emp) {
    res.status(404).json({ error: "Invalid or expired invitation token" });
    return;
  }

  if (emp.invitationStatus === "revoked") {
    res.status(403).json({ error: "This invitation has been revoked by your administrator" });
    return;
  }

  const [company] = await db
    .select({ name: companiesTable.name, logoUrl: companiesTable.logoUrl })
    .from(companiesTable)
    .where(eq(companiesTable.id, emp.companyId))
    .limit(1);

  res.json({
    valid: true,
    email: emp.email,
    name: emp.name,
    role: emp.role,
    companyName: company?.name ?? "EcoLearn Corporate Member",
    logoUrl: company?.logoUrl ?? null,
  });
});

// POST /api/invitations/accept
router.post("/accept", async (req, res): Promise<void> => {
  try {
    const { token } = req.body;
    if (!token || typeof token !== "string") {
      res.status(400).json({ error: "token is required" });
      return;
    }

    const access = await getCompanyAccess(req);
    const result = await acceptInvitation(token.trim(), access.userId);

    res.json({
      message: "Invitation accepted successfully",
      companyName: result.company?.name,
      employeeId: result.employee.id,
    });
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(400).json({ error: err.message || "Failed to accept invitation" });
    }
  }
});

export default router;
