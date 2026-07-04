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
} from "@workspace/db";
import { and, eq, inArray } from "drizzle-orm";
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
} from "../lib/access";

const router = Router();

type EmployeeRole = "employee" | "manager" | "admin";

interface EmployeePayload {
  name?: string;
  email?: string;
  department?: string | null;
  jobTitle?: string | null;
  role?: EmployeeRole;
}

const VALID_ROLES = new Set<EmployeeRole>(["employee", "manager", "admin"]);
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

  if (!partial && (!name || !email)) return { error: "Name and email are required" };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address" };
  }
  if (roleRaw && !role) return { error: "Invalid employee role" };

  return {
    data: {
      ...(name !== null ? { name } : {}),
      ...(email !== null ? { email } : {}),
      ...(!partial || Object.prototype.hasOwnProperty.call(raw, "department") ? { department } : {}),
      ...(!partial || Object.prototype.hasOwnProperty.call(raw, "jobTitle") ? { jobTitle } : {}),
      ...(role ? { role } : {}),
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
    const employeeEmail = employeeData.email!;

    const existing = await db
      .select()
      .from(employeesTable)
      .where(
        and(
          eq(employeesTable.companyId, access.companyId),
          eq(employeesTable.email, employeeEmail),
        ),
      )
      .limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: "An employee with this email already exists" });
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

    res.status(201).json({
      employeeId: updated.id,
      email: updated.email,
      invitationLink: buildInviteLink(req, token),
      emailSent: false,
      message: "Email delivery is not configured yet. Share the invitation link directly.",
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

export default router;
