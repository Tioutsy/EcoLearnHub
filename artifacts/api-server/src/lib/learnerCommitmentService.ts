import {
  db,
  employeesTable,
  learnerCommitmentsTable,
  enrollmentsTable,
  coursesTable,
} from "@workspace/db";
import { eq, and, sql, desc, count, inArray } from "drizzle-orm";
import { logAuditEvent } from "./auditLogService.js";

export const ALLOWED_ACTION_CATEGORIES = [
  "waste",
  "energy",
  "water",
  "procurement",
  "biodiversity",
  "workplace-practice",
  "governance",
  "social",
  "other",
] as const;

export type ActionCategory = (typeof ALLOWED_ACTION_CATEGORIES)[number];

export const ESG_MAPPING: Record<ActionCategory, "environmental" | "social" | "governance"> = {
  waste: "environmental",
  energy: "environmental",
  water: "environmental",
  procurement: "environmental",
  biodiversity: "environmental",
  "workplace-practice": "social",
  social: "social",
  governance: "governance",
  other: "governance",
};

export const MINIMUM_PRIVACY_THRESHOLD = 5;

export interface CreateCommitmentInput {
  companyId: number;
  employeeId: number;
  courseId: number;
  courseVersion?: number;
  enrollmentId?: number;
  commitmentType?: "suggested" | "custom";
  commitmentText: string;
  actionCategory?: ActionCategory;
  targetDate?: Date;
}

export function escapeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '""';
  let str = String(value).trim();
  if (str.length === 0) return '""';

  // Anti-Formula Injection Check: Escape values starting with '=', '+', '-', '@'
  if (/^[=\+\-@]/.test(str)) {
    str = "'" + str;
  }

  // Escape double quotes
  str = str.replace(/"/g, '""');
  return `"${str}"`;
}

export async function createLearnerCommitment(input: CreateCommitmentInput) {
  const text = input.commitmentText ? input.commitmentText.trim() : "";
  if (text.length < 20 || text.length > 500) {
    throw new Error("Commitment text must be between 20 and 500 characters");
  }

  const category = input.actionCategory ?? "workplace-practice";
  if (!ALLOWED_ACTION_CATEGORIES.includes(category as ActionCategory)) {
    throw new Error(`Invalid action category. Allowed categories: ${ALLOWED_ACTION_CATEGORIES.join(", ")}`);
  }

  // Duplicate protection: Check if active commitment already exists for this employee, course, and enrollment
  if (input.enrollmentId) {
    const [existing] = await db
      .select()
      .from(learnerCommitmentsTable)
      .where(
        and(
          eq(learnerCommitmentsTable.companyId, input.companyId),
          eq(learnerCommitmentsTable.employeeId, input.employeeId),
          eq(learnerCommitmentsTable.courseId, input.courseId),
          eq(learnerCommitmentsTable.enrollmentId, input.enrollmentId)
        )
      )
      .limit(1);

    if (existing) {
      throw new Error("A workplace commitment already exists for this enrollment");
    }
  }

  const [commitment] = await db
    .insert(learnerCommitmentsTable)
    .values({
      companyId: input.companyId,
      employeeId: input.employeeId,
      courseId: input.courseId,
      courseVersion: input.courseVersion ?? 1,
      enrollmentId: input.enrollmentId ?? null,
      commitmentType: input.commitmentType ?? "suggested",
      commitmentText: text,
      actionCategory: category,
      targetDate: input.targetDate ?? null,
      status: "committed",
      employeeSubmittedAt: new Date(),
    })
    .returning();

  await logAuditEvent({
    companyId: input.companyId,
    actorUserId: `emp_${input.employeeId}`,
    actorRole: "employee",
    action: "commitment.created",
    targetType: "learner_commitment",
    targetId: commitment.id,
    metadata: { courseId: input.courseId, commitmentText: commitment.commitmentText, actionCategory: category },
  });

  return commitment;
}

export async function reportWorkplaceAction(
  commitmentId: number,
  companyId: number,
  employeeId: number,
  progressNote?: string
) {
  const [existing] = await db
    .select()
    .from(learnerCommitmentsTable)
    .where(and(eq(learnerCommitmentsTable.id, commitmentId), eq(learnerCommitmentsTable.companyId, companyId)))
    .limit(1);

  if (!existing) {
    throw new Error("Workplace commitment record not found");
  }

  if (existing.employeeId !== employeeId) {
    throw new Error("Unauthorized: Cannot update another employee's commitment");
  }

  const note = progressNote ? progressNote.trim().slice(0, 1000) : null;

  const [updated] = await db
    .update(learnerCommitmentsTable)
    .set({
      status: "action-reported",
      actionReportedAt: new Date(),
      completedAt: new Date(),
      employeeProgressNote: note,
      learnerReflection: note,
      updatedAt: new Date(),
    })
    .where(eq(learnerCommitmentsTable.id, commitmentId))
    .returning();

  await logAuditEvent({
    companyId,
    actorUserId: `emp_${employeeId}`,
    actorRole: "employee",
    action: "commitment.action_reported",
    targetType: "learner_commitment",
    targetId: commitmentId,
    metadata: { progressNote: note },
  });

  return updated;
}

export async function completeLearnerCommitment(
  commitmentId: number,
  companyId: number,
  employeeId: number,
  progressNote?: string
) {
  return reportWorkplaceAction(commitmentId, companyId, employeeId, progressNote);
}

export async function reviewWorkplaceActionByManager(
  commitmentId: number,
  companyId: number,
  managerUserId: string,
  reviewerEmployeeId: number | null,
  decision: "confirm" | "request_followup" | "close",
  managerResponseNote?: string
) {
  const [existing] = await db
    .select()
    .from(learnerCommitmentsTable)
    .where(and(eq(learnerCommitmentsTable.id, commitmentId), eq(learnerCommitmentsTable.companyId, companyId)))
    .limit(1);

  if (!existing) {
    throw new Error("Workplace commitment record not found");
  }

  let newStatus = "manager-confirmed";
  let managerConfirmationStatus = "confirmed";

  if (decision === "confirm") {
    newStatus = "manager-confirmed";
    managerConfirmationStatus = "confirmed";
  } else if (decision === "request_followup") {
    newStatus = "follow-up-requested";
    managerConfirmationStatus = "follow-up-requested";
  } else if (decision === "close") {
    newStatus = "closed-without-confirmation";
    managerConfirmationStatus = "rejected";
  }

  const note = managerResponseNote ? managerResponseNote.trim().slice(0, 1000) : null;

  const [updated] = await db
    .update(learnerCommitmentsTable)
    .set({
      status: newStatus,
      managerConfirmationStatus,
      managerConfirmedByUserId: managerUserId,
      reviewedByEmployeeId: reviewerEmployeeId ?? null,
      managerConfirmedAt: new Date(),
      managerReviewedAt: new Date(),
      managerResponseNote: note,
      updatedAt: new Date(),
    })
    .where(eq(learnerCommitmentsTable.id, commitmentId))
    .returning();

  await logAuditEvent({
    companyId,
    actorUserId: managerUserId,
    actorRole: "manager",
    action: `commitment.${decision}`,
    targetType: "learner_commitment",
    targetId: commitmentId,
    metadata: { employeeId: existing.employeeId, managerNote: note },
  });

  return updated;
}

export async function confirmLearnerCommitmentByManager(
  commitmentId: number,
  companyId: number,
  managerUserId: string,
  managerDepartment?: string
) {
  return reviewWorkplaceActionByManager(commitmentId, companyId, managerUserId, null, "confirm");
}

export async function getCompanyImpactSummary(companyId: number) {
  // 1. Eligible completed enrollments
  const completedEnrollmentsResult = await db
    .select({ count: count() })
    .from(enrollmentsTable)
    .where(and(eq(enrollmentsTable.companyId, companyId), eq(enrollmentsTable.status, "completed")));
  const eligibleCompletions = Number(completedEnrollmentsResult[0]?.count ?? 0);

  // 2. Fetch all commitments for company
  const commitments = await db
    .select()
    .from(learnerCommitmentsTable)
    .where(eq(learnerCommitmentsTable.companyId, companyId));

  const commitmentsCreated = commitments.length;
  const commitmentRate = eligibleCompletions > 0 ? Number((commitmentsCreated / eligibleCompletions).toFixed(4)) : 0;

  const reportedStatuses = ["action-reported", "completed_self_reported", "manager-confirmed", "completed_manager_confirmed", "follow-up-requested"];
  const actionsReportedList = commitments.filter((c) => reportedStatuses.includes(c.status));
  const actionsReported = actionsReportedList.length;
  const actionFollowThroughRate = commitmentsCreated > 0 ? Number((actionsReported / commitmentsCreated).toFixed(4)) : 0;

  const confirmedStatuses = ["manager-confirmed", "completed_manager_confirmed"];
  const managerConfirmedActions = commitments.filter((c) => confirmedStatuses.includes(c.status)).length;
  const followUpRequested = commitments.filter((c) => c.status === "follow-up-requested").length;
  const outstandingManagerReviews = commitments.filter((c) => c.status === "action-reported" || c.status === "completed_self_reported").length;

  // Category Breakdown
  const categoryDistribution: Record<ActionCategory, number> = {
    waste: 0,
    energy: 0,
    water: 0,
    procurement: 0,
    biodiversity: 0,
    "workplace-practice": 0,
    governance: 0,
    social: 0,
    other: 0,
  };

  const esgBreakdown = {
    environmental: 0,
    social: 0,
    governance: 0,
  };

  commitments.forEach((c) => {
    const cat = (c.actionCategory as ActionCategory) ?? "workplace-practice";
    if (categoryDistribution[cat] !== undefined) {
      categoryDistribution[cat]++;
    }
    const esg = ESG_MAPPING[cat] ?? "social";
    esgBreakdown[esg]++;
  });

  // Department Breakdown with Privacy Threshold (Min 5)
  const employees = await db
    .select()
    .from(employeesTable)
    .where(eq(employeesTable.companyId, companyId));

  const empDeptMap = new Map<number, string>();
  const deptCounts = new Map<string, number>();

  employees.forEach((e) => {
    const dept = e.department ? e.department.trim() : "Unassigned";
    empDeptMap.set(e.id, dept);
    deptCounts.set(dept, (deptCounts.get(dept) ?? 0) + 1);
  });

  const departmentSummary: Record<string, { employeeCount: number; commitmentCount: number; suppressed: boolean }> = {};

  deptCounts.forEach((empCount, dept) => {
    if (empCount < MINIMUM_PRIVACY_THRESHOLD) {
      departmentSummary[dept] = { employeeCount: empCount, commitmentCount: 0, suppressed: true };
    } else {
      const deptCommitments = commitments.filter((c) => empDeptMap.get(c.employeeId) === dept).length;
      departmentSummary[dept] = { employeeCount: empCount, commitmentCount: deptCommitments, suppressed: false };
    }
  });

  return {
    companyId,
    eligibleCompletions,
    commitmentsCreated,
    commitmentRate,
    actionsReported,
    actionFollowThroughRate,
    managerConfirmedActions,
    followUpRequested,
    outstandingManagerReviews,
    categoryDistribution,
    esgBreakdown,
    departmentSummary,
    disclaimer: "Manager review confirms workplace report receipt only. Does not constitute an independent environmental audit.",
  };
}

export async function exportCompanyActionEvidenceCsv(companyId: number): Promise<string> {
  const commitments = await db
    .select()
    .from(learnerCommitmentsTable)
    .where(eq(learnerCommitmentsTable.companyId, companyId));

  const empIds = Array.from(new Set(commitments.map((c) => c.employeeId)));
  const courseIds = Array.from(new Set(commitments.map((c) => c.courseId)));

  const employees = empIds.length > 0
    ? await db.select().from(employeesTable).where(inArray(employeesTable.id, empIds))
    : [];

  const courses = courseIds.length > 0
    ? await db.select().from(coursesTable).where(inArray(coursesTable.id, courseIds))
    : [];

  const empMap = new Map(employees.map((e) => [e.id, e]));
  const courseMap = new Map(courses.map((c) => [c.id, c]));

  const headers = [
    "ID",
    "Employee Identifier",
    "Department",
    "Course Code",
    "Course Title",
    "Action Category",
    "Workplace Commitment",
    "Status",
    "Employee Progress Note",
    "Manager Response Note",
    "Reported Date",
    "Reviewed Date",
    "Evidence Disclaimer",
  ];

  const rows = commitments.map((c) => {
    const emp = empMap.get(c.employeeId);
    const course = courseMap.get(c.courseId);

    return [
      escapeCsvCell(c.id),
      escapeCsvCell(emp ? emp.name || (emp as any).fullName || `Employee #${emp.id}` : `Employee #${c.employeeId}`),
      escapeCsvCell(emp?.department ?? "Unassigned"),
      escapeCsvCell(course?.courseCode ?? `COURSE-${c.courseId}`),
      escapeCsvCell(course?.title ?? "Course"),
      escapeCsvCell(c.actionCategory),
      escapeCsvCell(c.commitmentText),
      escapeCsvCell(c.status),
      escapeCsvCell(c.employeeProgressNote ?? c.learnerReflection ?? ""),
      escapeCsvCell(c.managerResponseNote ?? ""),
      escapeCsvCell(c.actionReportedAt ? c.actionReportedAt.toISOString() : ""),
      escapeCsvCell(c.managerReviewedAt || c.managerConfirmedAt ? (c.managerReviewedAt || c.managerConfirmedAt)!.toISOString() : ""),
      escapeCsvCell("Manager review confirms receipt only. Not an independent environmental audit."),
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}
