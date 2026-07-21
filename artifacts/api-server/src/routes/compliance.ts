import { Router } from "express";
import { db } from "@workspace/db";
import {
  courseAssignmentsTable,
  trainingRemindersTable,
  employeesTable,
  coursesTable,
  companiesTable,
} from "@workspace/db";
import { eq, and, desc, gte, inArray } from "drizzle-orm";
import { requireCompanyAdmin, sendHttpError } from "../lib/access";
import { assignCoursesToEmployees } from "../lib/lmsData";

const router = Router();

type ComplianceStatus =
  | "compliant"
  | "expiring_soon"
  | "expired"
  | "overdue"
  | "not_started";

const EXPIRING_WINDOW_DAYS = 30;

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function expiresAtFor(
  completedAt: Date | null,
  validityMonths: number | null,
): Date | null {
  if (!completedAt || !validityMonths || validityMonths <= 0) return null;
  return addMonths(completedAt, validityMonths);
}

function computeStatus(
  completedAt: Date | null,
  dueDate: Date | null,
  expiresAt: Date | null,
  now: Date,
): ComplianceStatus {
  if (!completedAt) {
    if (dueDate && now > dueDate) return "overdue";
    return "not_started";
  }
  if (expiresAt) {
    if (now > expiresAt) return "expired";
    const window = new Date(expiresAt);
    window.setDate(window.getDate() - EXPIRING_WINDOW_DAYS);
    if (now >= window) return "expiring_soon";
  }
  return "compliant";
}

async function getCompanyId(): Promise<number | null> {
  const companies = await db.select().from(companiesTable).orderBy(companiesTable.id).limit(1);
  return companies.length ? companies[0].id : null;
}

function parseId(raw: string | string[]): number | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!/^\d+$/.test(value)) return null;
  const id = parseInt(value, 10);
  return Number.isNaN(id) ? null : id;
}

function parseNumberArray(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => Number(item)).filter(Number.isInteger);
}

// Training compliance dashboard data
router.get("/overview", async (req, res): Promise<void> => {
  try {
    const companyId = await getCompanyId();
    if (companyId === null) {
      res.json({
        summary: {
          total: 0,
          compliant: 0,
          expiringSoon: 0,
          expired: 0,
          overdue: 0,
          notStarted: 0,
          complianceRate: 0,
        },
        assignments: [],
        courses: [],
      });
      return;
    }

    const now = new Date();

    const [assignments, employees, courses] = await Promise.all([
      db
        .select()
        .from(courseAssignmentsTable)
        .where(eq(courseAssignmentsTable.companyId, companyId)),
      db
        .select()
        .from(employeesTable)
        .where(eq(employeesTable.companyId, companyId)),
      db.select().from(coursesTable),
    ]);

    const employeeMap = new Map(employees.map((e) => [e.id, e]));
    const courseMap = new Map(courses.map((c) => [c.id, c]));

    const summary = {
      total: 0,
      compliant: 0,
      expiringSoon: 0,
      expired: 0,
      overdue: 0,
      notStarted: 0,
      complianceRate: 0,
    };

    const courseStats = new Map<
      number,
      { courseId: number; title: string; total: number; compliant: number }
    >();

    const rows = assignments.map((a) => {
      const employee = employeeMap.get(a.employeeId);
      const course = courseMap.get(a.courseId);
      const validityMonths = course?.validityMonths ?? null;
      const expiresAt = expiresAtFor(a.completedAt, validityMonths);
      const status = computeStatus(a.completedAt, a.dueDate, expiresAt, now);

      summary.total += 1;
      if (status === "compliant") summary.compliant += 1;
      else if (status === "expiring_soon") summary.expiringSoon += 1;
      else if (status === "expired") summary.expired += 1;
      else if (status === "overdue") summary.overdue += 1;
      else summary.notStarted += 1;

      const cs = courseStats.get(a.courseId) ?? {
        courseId: a.courseId,
        title: course?.title ?? "Unknown course",
        total: 0,
        compliant: 0,
      };
      cs.total += 1;
      if (status === "compliant" || status === "expiring_soon") cs.compliant += 1;
      courseStats.set(a.courseId, cs);

      return {
        id: a.id,
        employeeId: a.employeeId,
        employeeName: employee?.name ?? "Unknown",
        department: employee?.department ?? null,
        courseId: a.courseId,
        courseTitle: course?.title ?? "Unknown course",
        isMandatory: course?.isMandatory ?? false,
        assignedAt: a.assignedAt,
        dueDate: a.dueDate,
        completedAt: a.completedAt,
        expiresAt,
        status,
      };
    });

    const compliantTotal = summary.compliant + summary.expiringSoon;
    summary.complianceRate = summary.total
      ? Math.round((compliantTotal / summary.total) * 100)
      : 0;

    const courseList = Array.from(courseStats.values()).map((c) => ({
      ...c,
      complianceRate: c.total ? Math.round((c.compliant / c.total) * 100) : 0,
    }));

    rows.sort((a, b) => {
      const order: Record<ComplianceStatus, number> = {
        expired: 0,
        overdue: 1,
        expiring_soon: 2,
        not_started: 3,
        compliant: 4,
      };
      return order[a.status] - order[b.status];
    });

    res.json({ summary, assignments: rows, courses: courseList });
  } catch (err) {
    (req as any).log?.error?.({ err }, "Failed to load compliance overview");
    res.status(500).json({ error: "Failed to load compliance overview" });
  }
});

// Assign a course to employees (by ids and/or whole department)
router.post("/assignments", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const companyId = access.companyId;

    const body = req.body && typeof req.body === "object" ? (req.body as Record<string, unknown>) : {};
    const parsedCourseIds = parseNumberArray(body["courseIds"]);
    const fallbackCourseId = Number(body["courseId"]);
    const courseIds: number[] = Array.from(
      new Set(
        parsedCourseIds.length > 0
          ? parsedCourseIds
          : Number.isInteger(fallbackCourseId)
            ? [fallbackCourseId]
            : [],
      ),
    );
    if (courseIds.length === 0) {
      res.status(400).json({ error: "At least one valid courseId is required" });
      return;
    }

    const courses = await db
      .select({ id: coursesTable.id })
      .from(coursesTable)
      .where(
        courseIds.length === 1
          ? eq(coursesTable.id, courseIds[0])
          : inArray(coursesTable.id, courseIds),
      );
    if (courses.length !== courseIds.length) {
      res.status(404).json({ error: "One or more courses were not found" });
      return;
    }

    const employeeIds = parseNumberArray(body["employeeIds"]);
    const department: string | undefined =
      typeof body["department"] === "string" && body["department"].trim()
        ? body["department"].trim()
        : undefined;

    let dueDate: Date | null = null;
    if (typeof body["dueDate"] === "string" && body["dueDate"]) {
      const parsed = new Date(body["dueDate"]);
      if (Number.isNaN(parsed.getTime())) {
        res.status(400).json({ error: "Invalid dueDate" });
        return;
      }
      dueDate = parsed;
    }

    // Resolve target employees within this company
    const companyEmployees = await db
      .select()
      .from(employeesTable)
      .where(eq(employeesTable.companyId, companyId));

    const targetIds = new Set<number>();
    if (department) {
      companyEmployees
        .filter((e) => e.department === department)
        .forEach((e) => targetIds.add(e.id));
    }
    if (employeeIds.length) {
      const valid = new Set(companyEmployees.map((e) => e.id));
      employeeIds.filter((id) => valid.has(id)).forEach((id) => targetIds.add(id));
    }

    if (targetIds.size === 0) {
      res
        .status(400)
        .json({ error: "Select at least one employee or a department" });
      return;
    }

    const targets = companyEmployees.filter((employee) => targetIds.has(employee.id));
    const result = await assignCoursesToEmployees({
      companyId,
      employees: targets,
      courseIds,
      dueDate,
      assignedByUserId: access.userId,
    });
    res.status(201).json(result);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      (req as any).log?.error?.({ err }, "Failed to assign course");
      res.status(500).json({ error: "Failed to assign course" });
    }
  }
});

// List recent reminders
router.get("/reminders", async (req, res): Promise<void> => {
  try {
    const companyId = await getCompanyId();
    if (companyId === null) {
      res.json([]);
      return;
    }
    const reminders = await db
      .select()
      .from(trainingRemindersTable)
      .where(eq(trainingRemindersTable.companyId, companyId))
      .orderBy(desc(trainingRemindersTable.createdAt))
      .limit(50);
    res.json(reminders);
  } catch (err) {
    (req as any).log?.error?.({ err }, "Failed to load reminders");
    res.status(500).json({ error: "Failed to load reminders" });
  }
});

// Send a reminder / retraining notification to an employee
router.post("/reminders", async (req, res): Promise<void> => {
  try {
    const companyId = await getCompanyId();
    if (companyId === null) {
      res.status(404).json({ error: "No company found" });
      return;
    }

    const body = req.body ?? {};
    const employeeId = Number(body.employeeId);
    if (!Number.isInteger(employeeId)) {
      res.status(400).json({ error: "A valid employeeId is required" });
      return;
    }

    const [employee] = await db
      .select()
      .from(employeesTable)
      .where(
        and(
          eq(employeesTable.id, employeeId),
          eq(employeesTable.companyId, companyId),
        ),
      );
    if (!employee) {
      res.status(404).json({ error: "Employee not found" });
      return;
    }

    const type = body.type === "retraining" ? "retraining" : "reminder";
    const courseId =
      body.courseId != null && Number.isInteger(Number(body.courseId))
        ? Number(body.courseId)
        : null;

    let message: string =
      typeof body.message === "string" && body.message.trim()
        ? body.message.trim()
        : "";
    if (!message) {
      let courseTitle = "";
      if (courseId) {
        const [course] = await db
          .select()
          .from(coursesTable)
          .where(eq(coursesTable.id, courseId));
        courseTitle = course?.title ?? "";
      }
      message =
        type === "retraining"
          ? `Retraining is due${courseTitle ? ` for ${courseTitle}` : ""}. Please complete it to stay compliant.`
          : `Reminder to complete your assigned training${courseTitle ? `: ${courseTitle}` : ""}.`;
    }

    const [reminder] = await db
      .insert(trainingRemindersTable)
      .values({ companyId, employeeId, courseId, type, message })
      .returning();

    res.status(201).json(reminder);
  } catch (err) {
    (req as any).log?.error?.({ err }, "Failed to send reminder");
    res.status(500).json({ error: "Failed to send reminder" });
  }
});

// Bulk import employees (rows parsed from Excel client-side)
router.post("/employees/bulk-import", async (req, res): Promise<void> => {
  try {
    const companyId = await getCompanyId();
    if (companyId === null) {
      res.status(404).json({ error: "No company found" });
      return;
    }

    const rows = Array.isArray(req.body?.employees) ? req.body.employees : [];
    if (rows.length === 0) {
      res.status(400).json({ error: "No employee rows provided" });
      return;
    }

    const existing = await db
      .select()
      .from(employeesTable)
      .where(eq(employeesTable.companyId, companyId));
    const existingEmails = new Set(
      existing.map((e) => e.email.trim().toLowerCase()),
    );

    const validRoles = new Set(["employee", "manager", "admin"]);
    const errors: string[] = [];
    const toInsert: {
      companyId: number;
      email: string;
      name: string;
      department: string | null;
      role: string;
    }[] = [];
    const seen = new Set<string>();

    rows.forEach((raw: any, index: number) => {
      const line = index + 1;
      const name = String(raw?.name ?? "").trim();
      const email = String(raw?.email ?? "").trim();
      const department = String(raw?.department ?? "").trim();
      const roleRaw = String(raw?.role ?? "employee").trim().toLowerCase();
      const role = validRoles.has(roleRaw) ? roleRaw : "employee";

      if (!name || !email) {
        errors.push(`Row ${line}: name and email are required`);
        return;
      }
      const key = email.toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push(`Row ${line}: invalid email "${email}"`);
        return;
      }
      if (existingEmails.has(key) || seen.has(key)) {
        return; // skip duplicates silently
      }
      seen.add(key);
      toInsert.push({
        companyId,
        email,
        name,
        department: department || null,
        role,
      });
    });

    let created = 0;
    if (toInsert.length) {
      const inserted = await db
        .insert(employeesTable)
        .values(toInsert)
        .returning();
      created = inserted.length;
    }

    res.status(201).json({
      created,
      skipped: rows.length - created - errors.length,
      errors,
    });
  } catch (err) {
    (req as any).log?.error?.({ err }, "Failed to import employees");
    res.status(500).json({ error: "Failed to import employees" });
  }
});

// Automatic retraining scan: generate retraining notices for all expired
// training in one pass, skipping anyone already notified in the last 7 days.
const RETRAINING_DEDUPE_DAYS = 7;

router.post("/run-retraining-scan", async (req, res): Promise<void> => {
  try {
    const companyId = await getCompanyId();
    if (companyId === null) {
      res.status(404).json({ error: "No company found" });
      return;
    }

    const now = new Date();
    const dedupeSince = new Date(now);
    dedupeSince.setDate(dedupeSince.getDate() - RETRAINING_DEDUPE_DAYS);

    const [assignments, employees, courses, recentReminders] =
      await Promise.all([
        db
          .select()
          .from(courseAssignmentsTable)
          .where(eq(courseAssignmentsTable.companyId, companyId)),
        db
          .select()
          .from(employeesTable)
          .where(eq(employeesTable.companyId, companyId)),
        db.select().from(coursesTable),
        db
          .select()
          .from(trainingRemindersTable)
          .where(
            and(
              eq(trainingRemindersTable.companyId, companyId),
              eq(trainingRemindersTable.type, "retraining"),
              gte(trainingRemindersTable.createdAt, dedupeSince),
            ),
          ),
      ]);

    const employeeMap = new Map(employees.map((e) => [e.id, e]));
    const courseMap = new Map(courses.map((c) => [c.id, c]));
    const notifiedRecently = new Set(
      recentReminders.map((r) => `${r.employeeId}:${r.courseId ?? ""}`),
    );

    const toInsert: {
      companyId: number;
      employeeId: number;
      courseId: number;
      type: string;
      message: string;
    }[] = [];
    let skipped = 0;

    for (const a of assignments) {
      const course = courseMap.get(a.courseId);
      const employee = employeeMap.get(a.employeeId);
      if (!course || !employee) continue;
      const expiresAt = expiresAtFor(a.completedAt, course.validityMonths);
      const status = computeStatus(a.completedAt, a.dueDate, expiresAt, now);
      if (status !== "expired") continue;

      if (notifiedRecently.has(`${a.employeeId}:${a.courseId}`)) {
        skipped += 1;
        continue;
      }

      toInsert.push({
        companyId,
        employeeId: a.employeeId,
        courseId: a.courseId,
        type: "retraining",
        message: `Retraining is due for ${course.title}. Your certification has expired, please complete it again to stay compliant.`,
      });
    }

    let notified = 0;
    if (toInsert.length) {
      const inserted = await db
        .insert(trainingRemindersTable)
        .values(toInsert)
        .returning();
      notified = inserted.length;
    }

    res.status(201).json({ notified, skipped });
  } catch (err) {
    (req as any).log?.error?.({ err }, "Failed to run retraining scan");
    res.status(500).json({ error: "Failed to run retraining scan" });
  }
});

export default router;
