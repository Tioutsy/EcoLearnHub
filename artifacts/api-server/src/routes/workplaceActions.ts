import { Router } from "express";
import { getCompanyAccess, sendHttpError, HttpError } from "../lib/access.js";
import {
  createLearnerCommitment,
  reportWorkplaceAction,
  reviewWorkplaceActionByManager,
  getCompanyImpactSummary,
  exportCompanyActionEvidenceCsv,
  ALLOWED_ACTION_CATEGORIES,
  type ActionCategory,
} from "../lib/learnerCommitmentService.js";
import { generateCompanyImpactNarrative } from "../lib/ai/trainingImpactNarrativeService.js";
import { db, learnerCommitmentsTable, employeesTable, coursesTable } from "@workspace/db";
import { eq, and, desc, inArray } from "drizzle-orm";

const router = Router();

// ==========================================
// LEARNER ENDPOINTS (/api/learning/workplace-actions)
// ==========================================

// POST /api/learning/workplace-actions — Create workplace commitment
router.post("/learning/workplace-actions", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (!access.employee) {
      res.status(403).json({ error: "Learner record required to create commitment" });
      return;
    }

    const { courseId, courseVersion, enrollmentId, commitmentType, commitmentText, actionCategory, targetDate } = req.body;

    if (!courseId || typeof courseId !== "number") {
      res.status(400).json({ error: "Valid courseId is required" });
      return;
    }

    const commitment = await createLearnerCommitment({
      companyId: access.companyId,
      employeeId: access.employee.id,
      courseId: Number(courseId),
      courseVersion: courseVersion ? Number(courseVersion) : undefined,
      enrollmentId: enrollmentId ? Number(enrollmentId) : undefined,
      commitmentType: commitmentType === "custom" ? "custom" : "suggested",
      commitmentText: typeof commitmentText === "string" ? commitmentText : "",
      actionCategory: actionCategory as ActionCategory,
      targetDate: targetDate ? new Date(targetDate) : undefined,
    });

    res.status(201).json(commitment);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(400).json({ error: err.message || "Failed to create workplace commitment" });
    }
  }
});

// GET /api/learning/workplace-actions — List learner's commitments & reported actions
router.get("/learning/workplace-actions", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (!access.employee) {
      res.status(403).json({ error: "Learner record required" });
      return;
    }

    const records = await db
      .select()
      .from(learnerCommitmentsTable)
      .where(
        and(
          eq(learnerCommitmentsTable.companyId, access.companyId),
          eq(learnerCommitmentsTable.employeeId, access.employee.id)
        )
      )
      .orderBy(desc(learnerCommitmentsTable.createdAt));

    res.json(records);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: err.message || "Failed to retrieve learner commitments" });
    }
  }
});

// PATCH /api/learning/workplace-actions/:id — Update commitment (while in initial stage)
router.patch("/learning/workplace-actions/:id", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (!access.employee) {
      res.status(403).json({ error: "Learner record required" });
      return;
    }

    const commitmentId = Number(req.params.id);
    if (isNaN(commitmentId)) {
      res.status(400).json({ error: "Invalid commitment ID" });
      return;
    }

    const [existing] = await db
      .select()
      .from(learnerCommitmentsTable)
      .where(
        and(
          eq(learnerCommitmentsTable.id, commitmentId),
          eq(learnerCommitmentsTable.companyId, access.companyId)
        )
      )
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "Commitment not found" });
      return;
    }

    if (existing.employeeId !== access.employee.id) {
      res.status(403).json({ error: "Unauthorized: Cannot edit another learner's commitment" });
      return;
    }

    const { commitmentText, actionCategory } = req.body;
    const text = typeof commitmentText === "string" ? commitmentText.trim() : existing.commitmentText;
    if (text.length < 20 || text.length > 500) {
      res.status(400).json({ error: "Commitment text must be between 20 and 500 characters" });
      return;
    }

    const cat = (actionCategory && ALLOWED_ACTION_CATEGORIES.includes(actionCategory as ActionCategory))
      ? actionCategory
      : existing.actionCategory;

    const [updated] = await db
      .update(learnerCommitmentsTable)
      .set({
        commitmentText: text,
        actionCategory: cat,
        updatedAt: new Date(),
      })
      .where(eq(learnerCommitmentsTable.id, commitmentId))
      .returning();

    res.json(updated);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: err.message || "Failed to update commitment" });
    }
  }
});

// POST /api/learning/workplace-actions/:id/report — Report action progress
router.post("/learning/workplace-actions/:id/report", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (!access.employee) {
      res.status(403).json({ error: "Learner record required" });
      return;
    }

    const commitmentId = Number(req.params.id);
    if (isNaN(commitmentId)) {
      res.status(400).json({ error: "Invalid commitment ID" });
      return;
    }

    const { progressNote } = req.body;
    const updated = await reportWorkplaceAction(
      commitmentId,
      access.companyId,
      access.employee.id,
      typeof progressNote === "string" ? progressNote : undefined
    );

    res.json(updated);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(400).json({ error: err.message || "Failed to report workplace action" });
    }
  }
});

// ==========================================
// COMPANY MANAGEMENT ENDPOINTS (/api/company/*)
// ==========================================

// GET /api/company/training-impact — Company aggregate impact & narrative
router.get("/company/training-impact", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (access.role === "employee") {
      res.status(403).json({ error: "Company management authorization required" });
      return;
    }

    const summary = await getCompanyImpactSummary(access.companyId);
    const narrative = await generateCompanyImpactNarrative(access.companyId);

    res.json({
      summary,
      narrative,
    });
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: err.message || "Failed to generate training impact summary" });
    }
  }
});

// GET /api/company/workplace-actions — List company workplace actions with filters & pagination
router.get("/company/workplace-actions", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (access.role === "employee") {
      res.status(403).json({ error: "Company management authorization required" });
      return;
    }

    const statusFilter = req.query.status ? String(req.query.status) : undefined;
    const categoryFilter = req.query.category ? String(req.query.category) : undefined;
    const courseIdFilter = req.query.courseId ? Number(req.query.courseId) : undefined;

    const allRecords = await db
      .select()
      .from(learnerCommitmentsTable)
      .where(eq(learnerCommitmentsTable.companyId, access.companyId))
      .orderBy(desc(learnerCommitmentsTable.createdAt));

    let filtered = allRecords;
    if (statusFilter) {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }
    if (categoryFilter) {
      filtered = filtered.filter((r) => r.actionCategory === categoryFilter);
    }
    if (courseIdFilter && !isNaN(courseIdFilter)) {
      filtered = filtered.filter((r) => r.courseId === courseIdFilter);
    }

    const empIds = Array.from(new Set(filtered.map((r) => r.employeeId)));
    const courseIds = Array.from(new Set(filtered.map((r) => r.courseId)));

    const employees = empIds.length > 0
      ? await db.select().from(employeesTable).where(inArray(employeesTable.id, empIds))
      : [];

    const courses = courseIds.length > 0
      ? await db.select().from(coursesTable).where(inArray(coursesTable.id, courseIds))
      : [];

    const empMap = new Map(employees.map((e) => [e.id, e]));
    const courseMap = new Map(courses.map((c) => [c.id, c]));

    const enriched = filtered.map((r) => {
      const emp = empMap.get(r.employeeId);
      const course = courseMap.get(r.courseId);
      return {
        ...r,
        employeeName: emp ? emp.name || (emp as any).fullName || `Employee #${emp.id}` : `Employee #${r.employeeId}`,
        department: emp?.department ?? "Unassigned",
        courseCode: course?.courseCode ?? `COURSE-${r.courseId}`,
        courseTitle: course?.title ?? "Course",
      };
    });

    res.json({
      records: enriched,
      count: enriched.length,
    });
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: err.message || "Failed to list company workplace actions" });
    }
  }
});

// PATCH /api/company/workplace-actions/:id/review — Manager review (confirm / request_followup / close)
router.patch("/company/workplace-actions/:id/review", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (access.role === "employee") {
      res.status(403).json({ error: "Company management authorization required to review actions" });
      return;
    }

    const commitmentId = Number(req.params.id);
    if (isNaN(commitmentId)) {
      res.status(400).json({ error: "Invalid commitment ID" });
      return;
    }

    const { decision, managerResponseNote } = req.body;
    if (!["confirm", "request_followup", "close"].includes(decision)) {
      res.status(400).json({ error: "Invalid review decision. Must be confirm, request_followup, or close" });
      return;
    }

    const reviewerEmployeeId = access.employee ? access.employee.id : null;

    const updated = await reviewWorkplaceActionByManager(
      commitmentId,
      access.companyId,
      access.userId,
      reviewerEmployeeId,
      decision as "confirm" | "request_followup" | "close",
      typeof managerResponseNote === "string" ? managerResponseNote : undefined
    );

    res.json(updated);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(400).json({ error: err.message || "Failed to review workplace action" });
    }
  }
});

// GET /api/company/workplace-actions/export — CSV export (tenant isolated & formula-injection safe)
router.get("/company/workplace-actions/export", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (access.role === "employee") {
      res.status(403).json({ error: "Company management authorization required for CSV export" });
      return;
    }

    const csvContent = await exportCompanyActionEvidenceCsv(access.companyId);
    const filename = `elevio-training-impact-${new Date().toISOString().split("T")[0]}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csvContent);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: err.message || "Failed to export training impact CSV" });
    }
  }
});

export default router;
