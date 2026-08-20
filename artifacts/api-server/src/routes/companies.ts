import { randomUUID } from "crypto";
import { Router, type Request } from "express";
import { db } from "@workspace/db";
import {
  companiesTable,
  plansTable,
  employeesTable,
  coursesTable,
  enrollmentsTable,
  courseAssignmentsTable,
  companyPilotPassesTable,
} from "@workspace/db";
import { and, eq, inArray, or, sql } from "drizzle-orm";
import {
  CreateCompanyBody,
  UpdateMyCompanyBody,
} from "@workspace/api-zod";
import type { AssignmentStatus } from "../lib/lms";
import {
  getCompanyLmsOverview,
  getTrainingReportRows,
  assignCoursesToEmployees,
  syncEmployeeLearningStats,
} from "../lib/lmsData";
import {
  requireCompanyAdmin,
  sendHttpError,
  getCompanyAccess,
} from "../lib/access";
import { dispatchNotificationDelivery } from "../lib/notificationDeliveryService";
import {
  getCompanySeatUsage,
  verifyCanInvite,
} from "../lib/seatEnforcementService";
import {
  createEmployeeInvitation,
  resendEmployeeInvitation,
  revokeEmployeeInvitation,
  listCompanyInvitations,
} from "../lib/invitationService";

const router = Router();

type EmployeeRole = "employee" | "manager" | "admin";

interface EmployeePayload {
  name?: string;
  email?: string;
  department?: string | null;
  jobTitle?: string | null;
  role?: EmployeeRole;
  status?: "active" | "deactivated";
}

const VALID_ROLES = new Set<EmployeeRole>(["employee", "manager", "admin"]);
const VALID_STATUSES = new Set(["active", "deactivated"]);
const VALID_REPORT_STATUSES = new Set<AssignmentStatus | "all">([
  "all",
  "not_started",
  "in_progress",
  "completed",
  "overdue",
]);

function readText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function parseEmployeePayload(body: unknown, partial = false): { data?: EmployeePayload; error?: string } {
  const raw = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const name = readText(raw["name"]);
  const email = readText(raw["email"]);
  const department = readText(raw["department"]);
  const jobTitle = readText(raw["jobTitle"]);
  const roleRaw = readText(raw["role"]) ?? (partial ? null : "employee");
  const role = VALID_ROLES.has(roleRaw as EmployeeRole) ? (roleRaw as EmployeeRole) : null;
  const statusRaw = readText(raw["status"]);
  const status = statusRaw && VALID_STATUSES.has(statusRaw) ? (statusRaw as "active" | "deactivated") : null;

  if (!partial && (!name || !email)) return { error: "Name and email are required" };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address" };
  }
  if (roleRaw && !role) return { error: "Invalid employee role" };
  if (statusRaw && !status) return { error: "Invalid employee status" };

  return {
    data: {
      ...(name !== null ? { name } : {}),
      ...(email !== null ? { email } : {}),
      ...(!partial || Object.prototype.hasOwnProperty.call(raw, "department") ? { department } : {}),
      ...(!partial || Object.prototype.hasOwnProperty.call(raw, "jobTitle") ? { jobTitle } : {}),
      ...(role ? { role } : {}),
      ...(status ? { status } : {}),
    },
  };
}

function parseNumberArray(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => Number(item)).filter(Number.isInteger);
}

const getCompanyWithPlan = async (id: number) => {
  const [company] = await db
    .select({
      id: companiesTable.id,
      name: companiesTable.name,
      slug: companiesTable.slug,
      industry: companiesTable.industry,
      logoUrl: companiesTable.logoUrl,
      planId: companiesTable.planId,
      planName: plansTable.name,
      employeeCount: companiesTable.employeeCount,
      maxEmployees: companiesTable.maxEmployees,
      completionRate: companiesTable.completionRate,
      certificatesIssued: companiesTable.certificatesIssued,
      badges: companiesTable.badges,
      isPublicProfile: companiesTable.isPublicProfile,
      leaderboardEnabled: companiesTable.leaderboardEnabled,
      createdAt: companiesTable.createdAt,
    })
    .from(companiesTable)
    .leftJoin(plansTable, eq(companiesTable.planId, plansTable.id))
    .where(eq(companiesTable.id, id));
  return company
    ? {
        ...company,
        completionRate: company.completionRate ? parseFloat(company.completionRate) : null,
      }
    : null;
};

function parseId(raw: string | string[] | undefined): number | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || !/^\d+$/.test(value)) return null;
  const id = Number(value);
  return Number.isInteger(id) ? id : null;
}

function buildInviteLink(req: Request, token: string): string {
  const origin =
    typeof req.headers.origin === "string"
      ? req.headers.origin
      : process.env.PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:24777";
  return `${origin}/sign-up?invite=${encodeURIComponent(token)}`;
}

async function getCompanyEmployees(companyId: number) {
  return db
    .select()
    .from(employeesTable)
    .where(eq(employeesTable.companyId, companyId))
    .orderBy(employeesTable.name);
}

// GET /company — current company profile
router.get("/", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const company = await getCompanyWithPlan(access.companyId);
    if (!company) {
      res.status(404).json({ error: "No company found" });
      return;
    }
    res.json(company);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      req.log?.error({ err }, "Failed to load company");
      res.status(500).json({ error: "Failed to load company" });
    }
  }
});

router.patch("/", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const parsed = UpdateMyCompanyBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const update: {
      name?: string;
      industry?: string | null;
      logoUrl?: string | null;
      isPublicProfile?: boolean;
      leaderboardEnabled?: boolean;
    } = {};
    if (parsed.data.name !== undefined && parsed.data.name !== null) update.name = parsed.data.name;
    if (parsed.data.industry !== undefined) update.industry = parsed.data.industry;
    if (parsed.data.logoUrl !== undefined) update.logoUrl = parsed.data.logoUrl;
    if (parsed.data.isPublicProfile !== undefined && parsed.data.isPublicProfile !== null) {
      update.isPublicProfile = parsed.data.isPublicProfile;
    }
    if (parsed.data.leaderboardEnabled !== undefined && parsed.data.leaderboardEnabled !== null) {
      update.leaderboardEnabled = parsed.data.leaderboardEnabled;
    }

    await db.update(companiesTable).set(update).where(eq(companiesTable.id, access.companyId));
    const updated = await getCompanyWithPlan(access.companyId);
    res.json(updated);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      req.log?.error({ err }, "Failed to update company");
      res.status(500).json({ error: "Failed to update company" });
    }
  }
});

// Admin: list all companies
router.get("/all", async (_req, res): Promise<void> => {
  const companies = await db
    .select({
      id: companiesTable.id,
      name: companiesTable.name,
      slug: companiesTable.slug,
      industry: companiesTable.industry,
      logoUrl: companiesTable.logoUrl,
      planId: companiesTable.planId,
      planName: plansTable.name,
      employeeCount: companiesTable.employeeCount,
      maxEmployees: companiesTable.maxEmployees,
      completionRate: companiesTable.completionRate,
      certificatesIssued: companiesTable.certificatesIssued,
      badges: companiesTable.badges,
      isPublicProfile: companiesTable.isPublicProfile,
      leaderboardEnabled: companiesTable.leaderboardEnabled,
      createdAt: companiesTable.createdAt,
    })
    .from(companiesTable)
    .leftJoin(plansTable, eq(companiesTable.planId, plansTable.id));

  res.json(
    companies.map((c) => ({
      ...c,
      completionRate: c.completionRate ? parseFloat(c.completionRate) : null,
    })),
  );
});

router.post("/", async (req, res): Promise<void> => {
  const parsed = CreateCompanyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const slug = parsed.data.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const [company] = await db
    .insert(companiesTable)
    .values({ ...parsed.data, slug })
    .returning();
  const full = await getCompanyWithPlan(company.id);
  res.status(201).json(full);
});

router.post("/subscribe", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    const { planSlug, companyName } = req.body;
    if (!planSlug) {
      res.status(400).json({ error: "planSlug is required" });
      return;
    }

    const [plan] = await db
      .select()
      .from(plansTable)
      .where(eq(plansTable.slug, planSlug))
      .limit(1);

    if (!plan) {
      res.status(404).json({ error: "Plan not found" });
      return;
    }

    const companyUpdates: any = {
      planId: plan.id,
      maxEmployees: plan.maxEmployees,
    };
    if (companyName) {
      companyUpdates.name = companyName;
      companyUpdates.slug = companyName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    }

    await db
      .update(companiesTable)
      .set(companyUpdates)
      .where(eq(companiesTable.id, access.companyId));

    // Elevate user's role to admin of this company in the employees table
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
        .set({ role: "admin" })
        .where(eq(employeesTable.id, existingEmployee.id));
    } else {
      await db
        .insert(employeesTable)
        .values({
          clerkUserId: access.userId,
          email: access.email || `${access.userId}@elevio.mu`,
          name: "Company Administrator",
          companyId: access.companyId,
          role: "admin",
          invitationStatus: "accepted",
          invitationAcceptedAt: new Date(),
        });
    }

    res.json({ message: "Subscription upgraded successfully", planName: plan.name });
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to upgrade subscription" });
    }
  }
});

router.get("/lms-overview", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    res.json(await getCompanyLmsOverview(access.companyId));
  } catch (err) {
    if (!sendHttpError(res, err)) {
      req.log?.error({ err }, "Failed to load LMS overview");
      res.status(500).json({ error: "Failed to load LMS overview" });
    }
  }
});

router.get("/reports/training", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const cleanQuery = Object.fromEntries(
      Object.entries(req.query).filter(([, v]) => v !== "null" && v !== "undefined" && v !== ""),
    );
    const employeeId = cleanQuery.employeeId ? Number(cleanQuery.employeeId) : undefined;
    const courseId = cleanQuery.courseId ? Number(cleanQuery.courseId) : undefined;
    const department = readText(cleanQuery.department);
    const status = readText(cleanQuery.status) as AssignmentStatus | "all" | null;
    if (
      (cleanQuery.employeeId && !Number.isInteger(employeeId)) ||
      (cleanQuery.courseId && !Number.isInteger(courseId))
    ) {
      res.status(400).json({ error: "Invalid report filter" });
      return;
    }
    if (status && !VALID_REPORT_STATUSES.has(status)) {
      res.status(400).json({ error: "Invalid report status" });
      return;
    }

    const rows = await getTrainingReportRows(access.companyId, {
      employeeId,
      courseId,
      department: department ?? undefined,
      status: status ?? undefined,
    });
    res.json(rows);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      req.log?.error({ err }, "Failed to load training report");
      res.status(500).json({ error: "Failed to load training report" });
    }
  }
});

router.post("/assignments", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const body = req.body && typeof req.body === "object" ? (req.body as Record<string, unknown>) : {};
    const parsedCourseIds = parseNumberArray(body["courseIds"]);
    const courseIds = Array.from(new Set(parsedCourseIds));
    const employeeIds = parseNumberArray(body["employeeIds"]);
    const department = readText(body["department"]);
    const dueDateValue = readText(body["dueDate"]);

    if (courseIds.length === 0) {
      res.status(400).json({ error: "Select at least one course" });
      return;
    }

    const availableCourses = await db
      .select({ id: coursesTable.id })
      .from(coursesTable)
      .where(inArray(coursesTable.id, courseIds));
    if (availableCourses.length !== courseIds.length) {
      res.status(400).json({ error: "One or more selected courses do not exist" });
      return;
    }

    const companyEmployees = await getCompanyEmployees(access.companyId);
    const validEmployeeIds = new Set(companyEmployees.map((employee) => employee.id));
    const targetIds = new Set<number>();

    for (const employeeId of employeeIds) {
      if (validEmployeeIds.has(employeeId)) targetIds.add(employeeId);
    }
    if (department) {
      for (const employee of companyEmployees) {
        if (employee.department === department) targetIds.add(employee.id);
      }
    }

    if (targetIds.size === 0) {
      res.status(400).json({ error: "Select employees or a department with employees" });
      return;
    }

    const dueDate = dueDateValue ? new Date(dueDateValue) : null;
    if (dueDate && Number.isNaN(dueDate.getTime())) {
      res.status(400).json({ error: "Invalid due date" });
      return;
    }

    const targets = companyEmployees.filter((employee) => targetIds.has(employee.id));
    const result = await assignCoursesToEmployees({
      companyId: access.companyId,
      employees: targets,
      courseIds,
      dueDate,
      assignedByUserId: access.userId,
    });

    res.status(201).json(result);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      req.log?.error({ err }, "Failed to assign company courses");
      res.status(500).json({ error: "Failed to assign courses" });
    }
  }
});

// GET /company/employees/seat-usage — Authoritative seat capacity & subscription status
router.get("/employees/seat-usage", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const seatUsage = await getCompanySeatUsage(access.companyId);
    res.json(seatUsage);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      req.log?.error({ err }, "Failed to get seat usage");
      res.status(500).json({ error: "Failed to get seat usage" });
    }
  }
});

// GET /company/employee-invitations — List all invitations for company
router.get("/employee-invitations", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const invitations = await listCompanyInvitations(access.companyId);
    res.json(invitations);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      req.log?.error({ err }, "Failed to list employee invitations");
      res.status(500).json({ error: "Failed to list employee invitations" });
    }
  }
});

// POST /company/employee-invitations — Create employee invitation
router.post("/employee-invitations", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const rawOrigin = typeof req.headers.origin === "string" ? req.headers.origin : null;
    const origin =
      process.env.PUBLIC_APP_URL?.replace(/\/$/, "") ||
      process.env.RENDER_EXTERNAL_URL?.replace(/\/$/, "") ||
      (rawOrigin && !rawOrigin.includes("localhost") ? rawOrigin : null) ||
      rawOrigin ||
      "http://localhost:5173";

    const result = await createEmployeeInvitation(
      access.companyId,
      access.userId,
      {
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        department: req.body.department,
        intendedRole: req.body.intendedRole || req.body.role,
      },
      origin
    );

    res.status(201).json(result);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      req.log?.error({ err }, "Failed to create employee invitation");
      res.status(500).json({ error: "Failed to create employee invitation" });
    }
  }
});

// POST /company/employee-invitations/:id/resend — Resend employee invitation
router.post("/employee-invitations/:id/resend", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const id = parseId(req.params.id);
    if (!id) {
      res.status(400).json({ error: "Invalid invitation id" });
      return;
    }

    const rawOrigin = typeof req.headers.origin === "string" ? req.headers.origin : null;
    const origin =
      process.env.PUBLIC_APP_URL?.replace(/\/$/, "") ||
      process.env.RENDER_EXTERNAL_URL?.replace(/\/$/, "") ||
      (rawOrigin && !rawOrigin.includes("localhost") ? rawOrigin : null) ||
      rawOrigin ||
      "http://localhost:5173";

    const result = await resendEmployeeInvitation(access.companyId, id, origin);
    res.json(result);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      req.log?.error({ err }, "Failed to resend employee invitation");
      res.status(500).json({ error: "Failed to resend employee invitation" });
    }
  }
});

// POST /company/employee-invitations/:id/revoke — Revoke employee invitation
router.post("/employee-invitations/:id/revoke", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const id = parseId(req.params.id);
    if (!id) {
      res.status(400).json({ error: "Invalid invitation id" });
      return;
    }

    const result = await revokeEmployeeInvitation(access.companyId, id);
    res.json(result);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      req.log?.error({ err }, "Failed to revoke employee invitation");
      res.status(500).json({ error: "Failed to revoke employee invitation" });
    }
  }
});

router.get("/employees", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    res.json(await getCompanyEmployees(access.companyId));
  } catch (err) {
    if (!sendHttpError(res, err)) {
      req.log?.error({ err }, "Failed to list employees");
      res.status(500).json({ error: "Failed to list employees" });
    }
  }
});

router.post("/employees", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const parsed = parseEmployeePayload(req.body);
    if (parsed.error || !parsed.data?.name || !parsed.data.email) {
      res.status(400).json({ error: parsed.error ?? "Name and email are required" });
      return;
    }
    const employeeData = parsed.data;
    const employeeName = employeeData.name!;
    const employeeEmail = employeeData.email!.toLowerCase();

    // Check authoritative seat capacity and active subscription
    await verifyCanInvite(access.companyId);

    const existing = await db
      .select()
      .from(employeesTable)
      .where(
        and(
          eq(employeesTable.companyId, access.companyId),
          sql`lower(${employeesTable.email}) = ${employeeEmail}`,
        ),
      )
      .limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: "An employee with this email already exists", code: "MEMBERSHIP_ALREADY_EXISTS" });
      return;
    }

    const [emp] = await db
      .insert(employeesTable)
      .values({
        companyId: access.companyId,
        name: employeeName,
        email: employeeEmail,
        department: employeeData.department ?? null,
        jobTitle: employeeData.jobTitle ?? null,
        role: employeeData.role ?? "employee",
        status: "active",
      })
      .returning();

    await db
      .update(companiesTable)
      .set({ employeeCount: (await getCompanyEmployees(access.companyId)).length })
      .where(eq(companiesTable.id, access.companyId));

    res.status(201).json(emp);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      req.log?.error({ err }, "Failed to add employee");
      res.status(500).json({ error: "Failed to add employee" });
    }
  }
});

router.patch("/employees/:id", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const id = parseId(req.params.id);
    if (!id) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const parsed = parseEmployeePayload(req.body, true);
    if (parsed.error || !parsed.data) {
      res.status(400).json({ error: parsed.error ?? "Invalid employee update" });
      return;
    }

    const [existing] = await db
      .select()
      .from(employeesTable)
      .where(and(eq(employeesTable.id, id), eq(employeesTable.companyId, access.companyId)))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "Employee not found" });
      return;
    }

    // Sole Administrator Safeguard
    if (existing.role === "admin") {
      const isDemoting = parsed.data.role && parsed.data.role !== "admin";
      const isDeactivating = parsed.data.status && parsed.data.status === "deactivated";

      if (isDemoting || isDeactivating) {
        const activeAdmins = await db
          .select()
          .from(employeesTable)
          .where(
            and(
              eq(employeesTable.companyId, access.companyId),
              eq(employeesTable.role, "admin"),
              eq(employeesTable.status, "active")
            )
          );

        if (activeAdmins.length <= 1) {
          res.status(409).json({
            error: "Cannot demote or deactivate the sole active company administrator. Assign another active administrator first.",
          });
          return;
        }
      }
    }

    // If reactivating an inactive/deactivated employee, enforce subscription and seat capacity
    if (parsed.data.status === "active" && existing.status !== "active") {
      const usage = await getCompanySeatUsage(access.companyId);
      if (usage.subscriptionStatus !== "ACTIVE") {
        res.status(402).json({
          error: "An active paid subscription is required to reactivate employees.",
          code: "SUBSCRIPTION_INACTIVE",
        });
        return;
      }
      if (usage.activeEmployees >= usage.maxSeats) {
        res.status(409).json({
          error: `Cannot reactivate employee: seat capacity reached (${usage.activeEmployees} of ${usage.maxSeats} active seats occupied). Upgrade your subscription band first.`,
          code: "SEAT_LIMIT_REACHED",
        });
        return;
      }
    }

    const [updated] = await db
      .update(employeesTable)
      .set(parsed.data)
      .where(and(eq(employeesTable.id, id), eq(employeesTable.companyId, access.companyId)))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Employee not found" });
      return;
    }
    await syncEmployeeLearningStats(updated.id);
    res.json(updated);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      req.log?.error({ err }, "Failed to update employee");
      res.status(500).json({ error: "Failed to update employee" });
    }
  }
});

router.post("/employees/:id/invite", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const id = parseId(req.params.id);
    if (!id) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const token = randomUUID();
    const [updated] = await db
      .update(employeesTable)
      .set({
        invitationToken: token,
        invitationStatus: "invited",
        invitationSentAt: new Date(),
      })
      .where(and(eq(employeesTable.id, id), eq(employeesTable.companyId, access.companyId)))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Employee not found" });
      return;
    }

    const inviteLink = buildInviteLink(req, token);
    const [company] = await db
      .select({ name: companiesTable.name })
      .from(companiesTable)
      .where(eq(companiesTable.id, access.companyId))
      .limit(1);

    let emailDispatched = false;
    try {
      const delivery = await dispatchNotificationDelivery({
        companyId: access.companyId,
        recipientEmployeeId: updated.id,
        recipientEmail: updated.email,
        recipientName: updated.name,
        notificationType: "invitation",
        deduplicationKey: `invitation_${updated.id}_${token}`,
        templateData: {
          companyName: company?.name || "Elevio Skills",
          recipientName: updated.name,
          actionUrl: inviteLink,
        },
        isOperational: true,
      });
      emailDispatched = delivery.delivered || delivery.status === "delivered";
    } catch (deliveryErr) {
      req.log?.warn?.({ err: deliveryErr }, "Notification dispatch error for employee invite");
    }

    res.status(201).json({
      employeeId: updated.id,
      email: updated.email,
      invitationLink: inviteLink,
      emailSent: emailDispatched,
      message: `Invitation email sent to ${updated.email}`,
    });
  } catch (err) {
    if (!sendHttpError(res, err)) {
      req.log?.error({ err }, "Failed to create employee invitation");
      res.status(500).json({ error: "Failed to create invitation" });
    }
  }
});

router.delete("/employees/:id", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const id = parseId(req.params.id);
    if (!id) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const [employee] = await db
      .select()
      .from(employeesTable)
      .where(and(eq(employeesTable.id, id), eq(employeesTable.companyId, access.companyId)))
      .limit(1);
    if (!employee) {
      res.status(404).json({ error: "Employee not found" });
      return;
    }

    // Sole Administrator Safeguard
    if (employee.role === "admin" && employee.status === "active") {
      const activeAdmins = await db
        .select()
        .from(employeesTable)
        .where(
          and(
            eq(employeesTable.companyId, access.companyId),
            eq(employeesTable.role, "admin"),
            eq(employeesTable.status, "active")
          )
        );

      if (activeAdmins.length <= 1) {
        res.status(409).json({
          error: "Cannot delete the sole active company administrator. Assign another active administrator first.",
        });
        return;
      }
    }

    await db.delete(enrollmentsTable).where(eq(enrollmentsTable.employeeId, id));
    await db.delete(courseAssignmentsTable).where(eq(courseAssignmentsTable.employeeId, id));
    await db.delete(employeesTable).where(eq(employeesTable.id, id));
    await db
      .update(companiesTable)
      .set({ employeeCount: (await getCompanyEmployees(access.companyId)).length })
      .where(eq(companiesTable.id, access.companyId));
    res.status(204).send();
  } catch (err) {
    if (!sendHttpError(res, err)) {
      req.log?.error({ err }, "Failed to delete employee");
      res.status(500).json({ error: "Failed to delete employee" });
    }
  }
});

// GET /company/onboarding-status — Server-side onboarding readiness
router.get("/onboarding-status", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const { getCompanyOnboardingStatus } = await import("../lib/companyOnboardingService");
    const status = await getCompanyOnboardingStatus(access.companyId);
    res.json(status);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to load onboarding status" });
    }
  }
});

// GET /company/employees/import-template — Download CSV template
router.get("/employees/import-template", async (_req, res): Promise<void> => {
  const templateCsv = "first_name,last_name,email,role,department,job_title\nJean,Valjean,jean.valjean@example.com,employee,Operations,Frontline Operator\nMarie,Curie,marie.curie@example.com,manager,Sustainability,Green Lead\n";
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=elevio-employee-import-template.csv");
  res.send(templateCsv);
});

// POST /company/employees/bulk-import — Validate & import employees via CSV
router.post("/employees/bulk-import", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const { csvContent } = req.body;
    if (!csvContent || typeof csvContent !== "string") {
      res.status(400).json({ error: "csvContent string is required" });
      return;
    }

    const { getCompanyOnboardingStatus } = await import("../lib/companyOnboardingService");
    const status = await getCompanyOnboardingStatus(access.companyId);

    const currentEmployees = await getCompanyEmployees(access.companyId);

    const { parseAndValidateEmployeeCsv, executeEmployeeImport } = await import("../lib/employeeImportService");
    const validation = parseAndValidateEmployeeCsv(
      csvContent,
      currentEmployees,
      status.employeeCapacity.remaining
    );

    if (validation.capacityLimitExceeded) {
      res.status(422).json({
        error: `Import exceeds employee band limit. Remaining capacity is ${validation.remainingCapacity} employees, but ${validation.validRows.length} valid rows were submitted.`,
        validation,
      });
      return;
    }

    if (validation.validRows.length === 0 && validation.invalidRows.length > 0) {
      res.status(400).json({
        error: "No valid employee records found in CSV",
        validation,
      });
      return;
    }

    const importResult = await executeEmployeeImport(access.companyId, validation.validRows);

    res.status(201).json({
      message: `Successfully imported ${importResult.importedCount} employees`,
      importedCount: importResult.importedCount,
      validation,
      employees: importResult.employees,
    });
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to process bulk employee import" });
    }
  }
});

// POST /company/employees/:id/resend — Resend invitation
router.post("/employees/:id/resend", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const id = parseId(req.params.id);
    if (!id) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const { createOrRefreshInvitation } = await import("../lib/invitationService");
    const result = await createOrRefreshInvitation(access.companyId, id);
    const inviteLink = buildInviteLink(req, result.token);

    const [company] = await db
      .select({ name: companiesTable.name })
      .from(companiesTable)
      .where(eq(companiesTable.id, access.companyId))
      .limit(1);

    const [emp] = await db
      .select({ name: employeesTable.name, email: employeesTable.email })
      .from(employeesTable)
      .where(eq(employeesTable.id, id))
      .limit(1);

    let emailDispatched = false;
    try {
      const delivery = await dispatchNotificationDelivery({
        companyId: access.companyId,
        recipientEmployeeId: id,
        recipientEmail: result.email,
        recipientName: emp?.name || "Team Member",
        notificationType: "invitation_reminder",
        deduplicationKey: `resend_invitation_${id}_${result.token}`,
        templateData: {
          companyName: company?.name || "Elevio Skills",
          recipientName: emp?.name || "Team Member",
          actionUrl: inviteLink,
        },
        isOperational: true,
      });
      emailDispatched = delivery.delivered || delivery.status === "delivered";
    } catch (deliveryErr) {
      req.log?.warn?.({ err: deliveryErr }, "Notification dispatch error on resend invite");
    }

    res.json({
      message: `Invitation email sent to ${result.email}`,
      ...result,
      invitationLink: inviteLink,
      emailSent: emailDispatched,
    });
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(400).json({ error: err.message || "Failed to resend invitation" });
    }
  }
});

// POST /company/employees/:id/revoke — Revoke invitation
router.post("/employees/:id/revoke", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const id = parseId(req.params.id);
    if (!id) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const { revokeInvitation } = await import("../lib/invitationService");
    const result = await revokeInvitation(access.companyId, id);

    res.json({
      message: "Invitation revoked successfully",
      ...result,
    });
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(400).json({ error: err.message || "Failed to revoke invitation" });
    }
  }
});

// GET /company/admin-overview — Authoritative server-side company admin overview
router.get("/admin-overview", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const { getCompanyAdminOverview } = await import("../lib/adminOverviewService");
    const overview = await getCompanyAdminOverview(access.companyId);
    res.json(overview);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to load company admin overview" });
    }
  }
});

// POST /company/employees/:id/deactivate — Deactivate employee safely
router.post("/employees/:id/deactivate", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const id = parseId(req.params.id);
    if (!id) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const [updated] = await db
      .update(employeesTable)
      .set({ status: "deactivated" })
      .where(and(eq(employeesTable.id, id), eq(employeesTable.companyId, access.companyId)))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Employee not found" });
      return;
    }

    const { logAuditEvent } = await import("../lib/auditLogService");
    await logAuditEvent({
      companyId: access.companyId,
      actorUserId: access.userId,
      actorRole: access.role,
      action: "employee.deactivated",
      targetType: "employee",
      targetId: updated.id,
      metadata: { name: updated.name, email: updated.email },
    });

    res.json({ message: "Employee deactivated successfully", employee: updated });
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to deactivate employee" });
    }
  }
});

// POST /company/employees/:id/reactivate — Reactivate employee safely with capacity check
router.post("/employees/:id/reactivate", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const id = parseId(req.params.id);
    if (!id) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const seatUsage = await getCompanySeatUsage(access.companyId);
    if (seatUsage.subscriptionStatus !== "ACTIVE") {
      res.status(402).json({ error: "Active company subscription is required to reactivate employees.", code: "SUBSCRIPTION_INACTIVE" });
      return;
    }
    if (seatUsage.reservedSeats >= seatUsage.maxSeats) {
      res.status(403).json({ error: `Cannot reactivate employee: Company seat limit reached (${seatUsage.reservedSeats} of ${seatUsage.maxSeats} seats reserved).`, code: "SEAT_LIMIT_REACHED" });
      return;
    }

    const [updated] = await db
      .update(employeesTable)
      .set({ status: "active" })
      .where(and(eq(employeesTable.id, id), eq(employeesTable.companyId, access.companyId)))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Employee not found" });
      return;
    }

    const { logAuditEvent } = await import("../lib/auditLogService");
    await logAuditEvent({
      companyId: access.companyId,
      actorUserId: access.userId,
      actorRole: access.role,
      action: "employee.reactivated",
      targetType: "employee",
      targetId: updated.id,
      metadata: { name: updated.name, email: updated.email },
    });

    res.json({ message: "Employee reactivated successfully", employee: updated });
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to reactivate employee" });
    }
  }
});

// GET /company/departments — List company departments
router.get("/departments", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const { getCompanyDepartments } = await import("../lib/departmentService");
    const depts = await getCompanyDepartments(access.companyId);
    res.json(depts);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to list departments" });
    }
  }
});

// POST /company/departments — Create department
router.post("/departments", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const { name, code, managerEmployeeId } = req.body;
    if (!name || typeof name !== "string") {
      res.status(400).json({ error: "Department name is required" });
      return;
    }

    const { createDepartment } = await import("../lib/departmentService");
    const dept = await createDepartment({
      companyId: access.companyId,
      name,
      code,
      managerEmployeeId,
    });

    const { logAuditEvent } = await import("../lib/auditLogService");
    await logAuditEvent({
      companyId: access.companyId,
      actorUserId: access.userId,
      actorRole: access.role,
      action: "department.created",
      targetType: "department",
      targetId: dept.id,
      metadata: { name: dept.name, code: dept.code },
    });

    res.status(201).json(dept);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(400).json({ error: err.message || "Failed to create department" });
    }
  }
});

// PATCH /company/departments/:id — Update/archive department
router.patch("/departments/:id", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const id = parseId(req.params.id);
    if (!id) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const { updateDepartment } = await import("../lib/departmentService");
    const dept = await updateDepartment({
      companyId: access.companyId,
      id,
      ...req.body,
    });

    const { logAuditEvent } = await import("../lib/auditLogService");
    await logAuditEvent({
      companyId: access.companyId,
      actorUserId: access.userId,
      actorRole: access.role,
      action: "department.updated",
      targetType: "department",
      targetId: dept.id,
      metadata: req.body,
    });

    res.json(dept);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(400).json({ error: err.message || "Failed to update department" });
    }
  }
});

// POST /company/training/assign — Server-side training assignment engine
router.post("/training/assign", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const { assignTrainingToCompanyEmployees } = await import("../lib/assignmentService");
    
    const dueDateValue = readText(req.body.dueDate);
    const dueDate = dueDateValue ? new Date(dueDateValue) : null;

    const summary = await assignTrainingToCompanyEmployees({
      companyId: access.companyId,
      assignedByUserId: access.userId,
      assignedByRole: access.role,
      courseIds: req.body.courseIds,
      learningPathId: req.body.learningPathId,
      employeeIds: req.body.employeeIds,
      department: req.body.department,
      dueDate,
      assignmentSource: req.body.assignmentSource ?? "required",
    });

    res.status(201).json(summary);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(400).json({ error: err.message || "Failed to assign training" });
    }
  }
});

// GET /company/audit-logs — Immutable administrative audit logs
router.get("/audit-logs", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const { auditLogsTable } = await import("@workspace/db");
    const logs = await db
      .select()
      .from(auditLogsTable)
      .where(eq(auditLogsTable.companyId, access.companyId))
      .orderBy(sql`${auditLogsTable.createdAt} DESC`);
    res.json(logs);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to list audit logs" });
    }
  }
});

// GET /company/engagement-overview — Company-admin engagement metrics & delivery health
router.get("/engagement-overview", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const { getLearnerEngagementSummary } = await import("../lib/learnerEngagementService");
    const { employeesTable, notificationDeliveryLogsTable } = await import("@workspace/db");

    const employees = await db
      .select()
      .from(employeesTable)
      .where(eq(employeesTable.companyId, access.companyId));

    const deliveryLogs = await db
      .select()
      .from(notificationDeliveryLogsTable)
      .where(eq(notificationDeliveryLogsTable.companyId, access.companyId));

    let activatedCount = 0;
    let pendingInvitationCount = 0;
    let inProgressCount = 0;
    let overdueCount = 0;
    let completedCount = 0;

    for (const emp of employees) {
      if (emp.status === "deactivated") continue;
      const summary = await getLearnerEngagementSummary(access.companyId, emp.id);
      if (emp.invitationStatus === "accepted") activatedCount++;
      else if (emp.invitationStatus === "invited") pendingInvitationCount++;

      if (summary.primaryState === "overdue") overdueCount++;
      else if (summary.primaryState === "in_progress" || summary.primaryState === "inactive_in_progress") inProgressCount++;
      else if (summary.primaryState === "completed") completedCount++;
    }

    const totalActive = employees.filter((e) => e.status !== "deactivated").length;
    const activationRatePct = totalActive > 0 ? Math.round((activatedCount / totalActive) * 100) : 0;
    const completionRatePct = totalActive > 0 ? Math.round((completedCount / totalActive) * 100) : 0;

    const deliveredLogs = deliveryLogs.filter((l) => l.status === "delivered").length;
    const failedLogs = deliveryLogs.filter((l) => l.status === "failed").length;

    res.json({
      companyId: access.companyId,
      totalActiveEmployees: totalActive,
      activatedCount,
      pendingInvitationCount,
      inProgressCount,
      overdueCount,
      completedCount,
      activationRatePct,
      completionRatePct,
      reminderDeliveryHealth: {
        totalAttempted: deliveryLogs.length,
        deliveredLogs,
        failedLogs,
      },
    });
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to load engagement overview" });
    }
  }
});

// GET /company/manager/engagement — Manager-scoped employee engagement dashboard
router.get("/manager/engagement", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (!access.companyId) {
      res.status(403).json({ error: "Company membership required" });
      return;
    }

    const { getLearnerEngagementSummary } = await import("../lib/learnerEngagementService");
    const { employeesTable } = await import("@workspace/db");

    let employees = await db
      .select()
      .from(employeesTable)
      .where(eq(employeesTable.companyId, access.companyId));

    // Scoped to manager department if role is manager
    if (((access.role as string) === "manager" || access.employee?.role === "manager") && access.employee?.department) {
      employees = employees.filter((e) => e.department === access.employee?.department);
    }

    const summaries = [];
    for (const emp of employees) {
      if (emp.status === "deactivated") continue;
      const sum = await getLearnerEngagementSummary(access.companyId, emp.id);
      summaries.push(sum);
    }

    res.json(summaries);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to load manager engagement view" });
    }
  }
});

// POST /company/manager/remind — Manager-requested approved reminder dispatch
router.post("/manager/remind", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (!access.companyId) {
      res.status(403).json({ error: "Company membership required" });
      return;
    }

    const { employeeId, reminderCategory } = req.body;
    if (!employeeId || typeof employeeId !== "number") {
      res.status(400).json({ error: "employeeId is required" });
      return;
    }

    const { employeesTable } = await import("@workspace/db");
    const [emp] = await db
      .select()
      .from(employeesTable)
      .where(and(eq(employeesTable.id, employeeId), eq(employeesTable.companyId, access.companyId)))
      .limit(1);

    if (!emp) {
      res.status(404).json({ error: "Employee not found in your company" });
      return;
    }

    if (((access.role as string) === "manager" || access.employee?.role === "manager") && access.employee?.department && emp.department !== access.employee.department) {
      res.status(403).json({ error: "Cannot send reminder outside assigned department scope" });
      return;
    }

    const { sendNotification } = await import("../lib/notificationService");
    const { logAuditEvent } = await import("../lib/auditLogService");

    const dispatched = await sendNotification({
      companyId: access.companyId,
      recipientEmail: emp.email,
      recipientName: emp.name,
      type: "course_assigned",
      title: "Manager Reminder: Elevio Training Action Requested",
      message: `Hello ${emp.name}, your manager ${access.employee?.name ?? "Administrator"} has sent a reminder regarding your training assignments.`,
    });

    await logAuditEvent({
      companyId: access.companyId,
      actorUserId: access.userId,
      actorRole: access.role,
      action: "manager.reminder_sent",
      targetType: "employee",
      targetId: emp.id,
      metadata: { reminderCategory: reminderCategory ?? "manual_reminder" },
    });

    res.json({ message: "Reminder dispatched successfully", delivered: dispatched.delivered });
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to dispatch manager reminder" });
    }
  }
});

// GET /company/notification-logs — Company-admin notification delivery health logs
router.get("/notification-logs", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const { notificationDeliveryLogsTable } = await import("@workspace/db");

    const logs = await db
      .select({
        id: notificationDeliveryLogsTable.id,
        notificationType: notificationDeliveryLogsTable.notificationType,
        channel: notificationDeliveryLogsTable.channel,
        recipient: notificationDeliveryLogsTable.recipient,
        status: notificationDeliveryLogsTable.status,
        attemptedAt: notificationDeliveryLogsTable.attemptedAt,
        deliveredAt: notificationDeliveryLogsTable.deliveredAt,
        retryCount: notificationDeliveryLogsTable.retryCount,
        failureCode: notificationDeliveryLogsTable.failureCode,
        failureMessage: notificationDeliveryLogsTable.failureMessage,
        createdAt: notificationDeliveryLogsTable.createdAt,
      })
      .from(notificationDeliveryLogsTable)
      .where(eq(notificationDeliveryLogsTable.companyId, access.companyId))
      .orderBy(sql`${notificationDeliveryLogsTable.createdAt} DESC`);

    res.json(logs);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to list notification logs" });
    }
  }
});

// PATCH /company/priorities — Company-admin update training priorities
router.patch("/priorities", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const { priorities } = req.body;
    if (!Array.isArray(priorities)) {
      res.status(400).json({ error: "priorities must be an array of strings" });
      return;
    }

    const cleanPriorities = priorities
      .filter((p) => typeof p === "string" && p.trim())
      .slice(0, 3);

    const [updated] = await db
      .update(companiesTable)
      .set({ trainingPriorities: cleanPriorities })
      .where(eq(companiesTable.id, access.companyId))
      .returning();

    res.json({ message: "Training priorities updated", trainingPriorities: updated.trainingPriorities });
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to update training priorities" });
    }
  }
});

// POST /company/employees/:id/recommendations — AI recommendation endpoint
router.post("/employees/:id/recommendations", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const employeeId = parseInt(rawId, 10);

    if (isNaN(employeeId)) {
      res.status(400).json({ error: "Invalid employee ID" });
      return;
    }

    const { generateEmployeeRecommendations } = await import("../lib/ai/aiLearningPathService");
    const recommendations = await generateEmployeeRecommendations(employeeId, access);

    res.json(recommendations);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      req.log?.error({ err: err?.message }, "Failed to generate AI recommendations");
      res.status(500).json({ error: err?.message || "We couldn't generate recommendations right now. You can still assign courses manually from the catalogue." });
    }
  }
});

// GET /company/training-insights — AI Training Insights & Management Action Engine (Sprint 11A)
// Returns deterministic training metrics + optional Gemini-enhanced narrative.
// Accessible by company_admin and manager roles only; employees are denied (403).
router.get("/training-insights", async (req: any, res: any): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);

    if (access.role === "employee") {
      res.status(403).json({ error: "Access denied: Training insights are available to company administrators and managers only." });
      return;
    }

    const forceRefresh = req.query.refresh === "true";
    const { getCompanyTrainingInsights } = await import("../lib/ai/trainingInsightsService");
    const insights = await getCompanyTrainingInsights(access, forceRefresh);

    res.json(insights);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      req.log?.error({ err: err?.message }, "Failed to generate company training insights");
      res.status(500).json({ error: err?.message || "We couldn't generate company training insights right now." });
    }
  }
});

// GET /company/pilot-status — Company pilot pass status, days remaining, and read-only state (Sprint 12.3)
router.get("/pilot-status", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (!access.companyId) {
      res.status(403).json({ error: "No company associated with user account" });
      return;
    }

    const { resolveCompanyPilotEntitlement } = await import("../lib/pilotPassService");
    const entitlement = await resolveCompanyPilotEntitlement(access.companyId);

    if (!entitlement.isPilot || !entitlement.pilotPass) {
      res.json({ isPilot: false, effectiveStatus: "NONE" });
      return;
    }

    const pilotPass = entitlement.pilotPass;

    res.json({
      isPilot: true,
      status: pilotPass.status,
      effectiveStatus: entitlement.effectiveStatus,
      durationDays: pilotPass.durationDays,
      learnerSeatLimit: pilotPass.learnerSeatLimit,
      administratorSeatLimit: pilotPass.administratorSeatLimit,
      permittedCourseIds: pilotPass.permittedCourseIds,
      startsAt: pilotPass.startsAt,
      expiresAt: pilotPass.expiresAt,
      retentionEndsAt: pilotPass.retentionEndsAt,
      daysRemaining: entitlement.daysRemaining,
      isExpired: entitlement.isExpired,
      isRevoked: entitlement.isRevoked,
      isConverted: entitlement.isConverted,
      isReadOnly: entitlement.isReadOnly,
      expiringSoon: entitlement.expiringSoon,
      conversionPending: entitlement.conversionPending,
      upgradeAvailable: entitlement.upgradeAvailable,
      activeLearners: entitlement.activeLearners,
      seatsUsed: entitlement.activeLearners,
      upgradeRequest: entitlement.upgradeRequest,
    });
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to retrieve pilot status" });
    }
  }
});

// POST /company/upgrade-requests — Company Administrator submits commercial upgrade request (Sprint 12.3 Phase 3)
router.post("/upgrade-requests", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const {
      selectedPlanCode,
      selectedEmployeeBandCode,
      billingInterval,
      billingContactName,
      billingContactEmail,
      companyNote,
    } = req.body;

    if (!selectedPlanCode || !selectedEmployeeBandCode || !billingContactName || !billingContactEmail) {
      res.status(400).json({ error: "Missing required upgrade request fields" });
      return;
    }

    const { createUpgradeRequest } = await import("../lib/pilotPassService");
    const request = await createUpgradeRequest(access.companyId, access.userId, {
      selectedPlanCode,
      selectedEmployeeBandCode,
      billingInterval: billingInterval || "MONTHLY",
      billingContactName,
      billingContactEmail,
      companyNote,
    });

    res.json({
      success: true,
      message: "Upgrade request submitted successfully. Our team will verify and contact you for payment confirmation.",
      upgradeRequest: request,
    });
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(400).json({ error: err?.message || "Failed to submit upgrade request" });
    }
  }
});

// GET /company/upgrade-request — Retrieve company's active upgrade request (Sprint 12.3 Phase 3)
router.get("/upgrade-request", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const { getCompanyUpgradeRequest } = await import("../lib/pilotPassService");
    const request = await getCompanyUpgradeRequest(access.companyId);
    res.json(request);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to retrieve company upgrade request" });
    }
  }
});

// POST /company/convert-pilot — Self-serve / admin initiated conversion to a paid subscription
router.post("/convert-pilot", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const { planCode, employeeBandCode, billingInterval } = req.body;

    const { convertPilotToPaid } = await import("../lib/pilotPassService");
    const result = await convertPilotToPaid(access.companyId, {
      planCode: planCode || "COMPLETE",
      employeeBandCode: employeeBandCode || "UP_TO_25",
      billingInterval: billingInterval || "MONTHLY",
      performedBy: access.userId,
    });

    res.json({
      success: true,
      message: "Company converted to paid subscription successfully",
      subscription: result.subscription,
    });
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(400).json({ error: err.message || "Failed to convert pilot to paid subscription" });
    }
  }
});

export default router;
