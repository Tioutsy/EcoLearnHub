import {
  db,
  employeesTable,
  coursesTable,
  courseAssignmentsTable,
  enrollmentsTable,
  learningPathsTable,
  learningPathCoursesTable,
} from "@workspace/db";
import { eq, and, inArray } from "drizzle-orm";
import { evaluateCourseAccess } from "./courseAccessService";
import { checkCourseEligibility } from "./prerequisites";
import { logAuditEvent } from "./auditLogService";

export interface AssignTrainingOptions {
  companyId: number;
  assignedByUserId: string;
  assignedByRole: string;
  courseIds?: number[];
  learningPathId?: number;
  employeeIds?: number[];
  department?: string;
  dueDate?: Date | null;
  assignmentSource?: string; // "required" | "recommended"
}

export interface AssignmentRowResult {
  employeeId: number;
  employeeName: string;
  courseId: number;
  courseTitle: string;
  status:
    | "assigned"
    | "already_assigned"
    | "already_completed"
    | "missing_prerequisite"
    | "not_entitled"
    | "inactive_employee"
    | "error";
  reason?: string;
}

export interface BulkAssignmentSummary {
  totalTargeted: number;
  assignedCount: number;
  skippedCount: number;
  rows: AssignmentRowResult[];
}

export async function assignTrainingToCompanyEmployees(
  options: AssignTrainingOptions
): Promise<BulkAssignmentSummary> {
  const {
    companyId,
    assignedByUserId,
    assignedByRole,
    dueDate,
    assignmentSource = "required",
  } = options;

  // Resolve target courses
  let targetCourseIds: number[] = [];
  if (options.courseIds && options.courseIds.length > 0) {
    targetCourseIds = Array.from(new Set(options.courseIds));
  } else if (options.learningPathId) {
    const pathCourses = await db
      .select({ courseId: learningPathCoursesTable.courseId })
      .from(learningPathCoursesTable)
      .where(eq(learningPathCoursesTable.pathId, options.learningPathId));
    targetCourseIds = pathCourses.map((pc) => pc.courseId);
  }

  if (targetCourseIds.length === 0) {
    throw new Error("Select at least one valid course or learning pathway");
  }

  const courses = await db
    .select()
    .from(coursesTable)
    .where(inArray(coursesTable.id, targetCourseIds));

  // Resolve target employees
  let targetEmployees: any[] = [];
  const companyEmployees = await db
    .select()
    .from(employeesTable)
    .where(eq(employeesTable.companyId, companyId));

  if (options.employeeIds && options.employeeIds.length > 0) {
    const targetSet = new Set(options.employeeIds);
    targetEmployees = companyEmployees.filter((e) => targetSet.has(e.id));
  } else if (options.department) {
    targetEmployees = companyEmployees.filter((e) => e.department === options.department);
  } else {
    targetEmployees = companyEmployees;
  }

  if (targetEmployees.length === 0) {
    throw new Error("No eligible target employees found for assignment");
  }

  // Get existing assignments & enrollments
  const existingAssignments = await db
    .select()
    .from(courseAssignmentsTable)
    .where(eq(courseAssignmentsTable.companyId, companyId));

  const existingEnrollments = await db
    .select()
    .from(enrollmentsTable)
    .where(eq(enrollmentsTable.companyId, companyId));

  const rowResults: AssignmentRowResult[] = [];
  let assignedCount = 0;
  let skippedCount = 0;

  for (const emp of targetEmployees) {
    if (emp.status === "deactivated") {
      for (const crs of courses) {
        rowResults.push({
          employeeId: emp.id,
          employeeName: emp.name,
          courseId: crs.id,
          courseTitle: crs.title,
          status: "inactive_employee",
          reason: "Employee account is deactivated",
        });
        skippedCount++;
      }
      continue;
    }

    for (const crs of courses) {
      const empAccess = {
        userId: emp.clerkUserId ?? String(emp.id),
        email: emp.email,
        companyId,
        role: "employee" as const,
        employee: emp,
        isDemo: false,
      };

      // 1. Entitlement check
      const entitlement = await evaluateCourseAccess(crs.id, empAccess);
      if (!entitlement.allowed) {
        rowResults.push({
          employeeId: emp.id,
          employeeName: emp.name,
          courseId: crs.id,
          courseTitle: crs.title,
          status: "not_entitled",
          reason: entitlement.reason || "Course is not included in company subscription plan",
        });
        skippedCount++;
        continue;
      }

      // 2. Prerequisite check
      const prereqCheck = await checkCourseEligibility(crs.id, empAccess);
      if (!prereqCheck.eligible) {
        rowResults.push({
          employeeId: emp.id,
          employeeName: emp.name,
          courseId: crs.id,
          courseTitle: crs.title,
          status: "missing_prerequisite",
          reason: "Missing required prerequisite courses",
        });
        skippedCount++;
        continue;
      }

      // 3. Existing completion check
      const existingEnr = existingEnrollments.find(
        (e) => e.employeeId === emp.id && e.courseId === crs.id
      );
      if (existingEnr && (existingEnr.status === "completed" || existingEnr.completedAt)) {
        rowResults.push({
          employeeId: emp.id,
          employeeName: emp.name,
          courseId: crs.id,
          courseTitle: crs.title,
          status: "already_completed",
          reason: "Employee has already completed this course",
        });
        skippedCount++;
        continue;
      }

      // 4. Existing active assignment check
      const existingAsgn = existingAssignments.find(
        (a) => a.employeeId === emp.id && a.courseId === crs.id
      );
      if (existingAsgn && !existingAsgn.completedAt) {
        rowResults.push({
          employeeId: emp.id,
          employeeName: emp.name,
          courseId: crs.id,
          courseTitle: crs.title,
          status: "already_assigned",
          reason: "Course is already actively assigned to employee",
        });
        skippedCount++;
        continue;
      }

      // Create course assignment & enrollment idempotently
      try {
        await db
          .insert(courseAssignmentsTable)
          .values({
            companyId,
            employeeId: emp.id,
            courseId: crs.id,
            dueDate: dueDate ?? null,
          })
          .onConflictDoNothing();

        if (emp.clerkUserId) {
          await db
            .insert(enrollmentsTable)
            .values({
              userId: emp.clerkUserId,
              companyId,
              employeeId: emp.id,
              courseId: crs.id,
              assignedByUserId,
              assignmentSource,
              dueDate: dueDate ?? null,
              status: "active",
              progressPct: 0,
            })
            .onConflictDoNothing();
        }

        rowResults.push({
          employeeId: emp.id,
          employeeName: emp.name,
          courseId: crs.id,
          courseTitle: crs.title,
          status: "assigned",
        });
        assignedCount++;

        await logAuditEvent({
          companyId,
          actorUserId: assignedByUserId,
          actorRole: assignedByRole,
          action: "course.assigned",
          targetType: "course_assignment",
          targetId: `${emp.id}_${crs.id}`,
          metadata: { employeeName: emp.name, courseTitle: crs.title, dueDate: dueDate?.toISOString() },
        });
      } catch (err: any) {
        rowResults.push({
          employeeId: emp.id,
          employeeName: emp.name,
          courseId: crs.id,
          courseTitle: crs.title,
          status: "error",
          reason: err.message || "Failed to create course assignment",
        });
        skippedCount++;
      }
    }
  }

  return {
    totalTargeted: rowResults.length,
    assignedCount,
    skippedCount,
    rows: rowResults,
  };
}
