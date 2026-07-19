import { and, eq, inArray, or } from "drizzle-orm";
import {
  certificatesTable,
  companiesTable,
  courseAssignmentsTable,
  coursesTable,
  db,
  employeesTable,
  enrollmentsTable,
  quizAttemptsTable,
  type Course,
  type Employee,
  type Enrollment,
} from "@workspace/db";
import {
  getAssignmentStatus,
  getCompletionRate,
  getEmployeeTrainingStatus,
  isActionNeeded,
  calculateEmployeeAverageScore,
  type AssignmentStatus,
  type EmployeeTrainingStatus,
} from "./lms";

export interface AssignCoursesInput {
  companyId: number;
  employees: Employee[];
  courseIds: number[];
  dueDate: Date | null;
  assignedByUserId: string;
}

export interface AssignCoursesResult {
  assigned: number;
  updated: number;
  skipped: number;
}

export interface TrainingReportFilters {
  employeeId?: number;
  department?: string;
  courseId?: number;
  status?: AssignmentStatus | "all";
}

export interface TrainingReportRow {
  assignmentId: number;
  employeeId: number;
  employeeName: string;
  email: string;
  department: string | null;
  jobTitle: string | null;
  courseId: number;
  courseTitle: string;
  assignedAt: Date;
  dueDate: Date | null;
  completedAt: Date | null;
  progressPct: number;
  status: AssignmentStatus;
  certificateId: number | null;
  certificateCode: string | null;
  certificateIssuedAt: Date | null;
  lastAccessedAt: Date | null;
}

export interface EmployeeTrainingSummary {
  employeeId: number;
  employeeName: string;
  email: string;
  department: string | null;
  jobTitle: string | null;
  assignedCourses: number;
  completedCourses: number;
  overdueCourses: number;
  completionRate: number;
  status: EmployeeTrainingStatus;
}

function uniqueStrings(values: Array<string | null | undefined>): string[] {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
}

export function getEmployeeUserKeys(employee: Employee): string[] {
  return uniqueStrings([employee.clerkUserId, employee.email]);
}

async function findEnrollmentForEmployee(
  employee: Employee,
  courseId: number,
): Promise<Enrollment | null> {
  const keys = getEmployeeUserKeys(employee);
  const clauses = [eq(enrollmentsTable.employeeId, employee.id)];
  if (keys.length > 0) clauses.push(inArray(enrollmentsTable.userId, keys));

  const [enrollment] = await db
    .select()
    .from(enrollmentsTable)
    .where(and(eq(enrollmentsTable.courseId, courseId), or(...clauses)))
    .orderBy(enrollmentsTable.id)
    .limit(1);

  return enrollment ?? null;
}

export async function syncEmployeeLearningStats(
  employeeId: number,
): Promise<void> {
  const [employee] = await db
    .select()
    .from(employeesTable)
    .where(eq(employeesTable.id, employeeId))
    .limit(1);
  if (!employee) return;

  const enrollments = await db
    .select()
    .from(enrollmentsTable)
    .where(eq(enrollmentsTable.employeeId, employee.id));

  const courseIds = Array.from(new Set(enrollments.map((row) => row.courseId)));
  const courses = courseIds.length
    ? await db.select().from(coursesTable).where(inArray(coursesTable.id, courseIds))
    : [];
  const courseMap = new Map(courses.map((course) => [course.id, course]));
  const completedEnrollments = enrollments.filter(
    (row) => row.status === "completed" || Boolean(row.completedAt),
  );
  const learningMinutes = completedEnrollments.reduce((total, row) => {
    return total + (courseMap.get(row.courseId)?.durationMinutes ?? 0);
  }, 0);

  const userKeys = getEmployeeUserKeys(employee);
  const certClauses = [eq(certificatesTable.employeeId, employee.id)];
  if (userKeys.length > 0) certClauses.push(inArray(certificatesTable.userId, userKeys));
  const certificates = await db
    .select()
    .from(certificatesTable)
    .where(or(...certClauses));

  let avgScore = 0;
  if (userKeys.length > 0) {
    const attempts = await db
      .select()
      .from(quizAttemptsTable)
      .where(inArray(quizAttemptsTable.userId, userKeys));
    avgScore = calculateEmployeeAverageScore(attempts);
  }

  await db
    .update(employeesTable)
    .set({
      enrolledCourses: enrollments.length,
      completedCourses: completedEnrollments.length,
      certificates: certificates.length,
      avgScore,
      learningMinutes,
      lastActiveAt:
        enrollments
          .map((row) => row.lastAccessedAt)
          .filter((value): value is Date => Boolean(value))
          .sort((a, b) => b.getTime() - a.getTime())[0] ?? employee.lastActiveAt,
    })
    .where(eq(employeesTable.id, employee.id));
}

export async function assignCoursesToEmployees({
  companyId,
  employees,
  courseIds,
  dueDate,
  assignedByUserId,
}: AssignCoursesInput): Promise<AssignCoursesResult> {
  let assigned = 0;
  let updated = 0;
  let skipped = 0;

  for (const employee of employees) {
    for (const courseId of courseIds) {
      const [existingAssignment] = await db
        .select()
        .from(courseAssignmentsTable)
        .where(
          and(
            eq(courseAssignmentsTable.employeeId, employee.id),
            eq(courseAssignmentsTable.courseId, courseId),
          ),
        )
        .limit(1);

      if (existingAssignment) {
        await db
          .update(courseAssignmentsTable)
          .set({ dueDate })
          .where(eq(courseAssignmentsTable.id, existingAssignment.id));
        updated += 1;
      } else {
        await db.insert(courseAssignmentsTable).values({
          companyId,
          employeeId: employee.id,
          courseId,
          dueDate,
        });
        assigned += 1;
      }

      const existingEnrollment = await findEnrollmentForEmployee(employee, courseId);
      const userId = employee.clerkUserId ?? employee.email;
      if (existingEnrollment) {
        await db
          .update(enrollmentsTable)
          .set({
            companyId,
            employeeId: employee.id,
            assignedByUserId,
            assignmentSource: "company",
            dueDate,
            status:
              existingEnrollment.status === "completed"
                ? existingEnrollment.status
                : "active",
          })
          .where(eq(enrollmentsTable.id, existingEnrollment.id));
      } else {
        await db.insert(enrollmentsTable).values({
          userId,
          companyId,
          employeeId: employee.id,
          courseId,
          assignedByUserId,
          assignmentSource: "company",
          dueDate,
          status: "active",
          progressPct: 0,
        });
      }
    }
    await syncEmployeeLearningStats(employee.id);
  }

  if (assigned === 0 && updated === 0) skipped = employees.length * courseIds.length;

  return { assigned, updated, skipped };
}

function filterRows(
  rows: TrainingReportRow[],
  filters: TrainingReportFilters,
): TrainingReportRow[] {
  return rows.filter((row) => {
    if (filters.employeeId && row.employeeId !== filters.employeeId) return false;
    if (filters.department && row.department !== filters.department) return false;
    if (filters.courseId && row.courseId !== filters.courseId) return false;
    if (filters.status && filters.status !== "all" && row.status !== filters.status) {
      return false;
    }
    return true;
  });
}

export async function getTrainingReportRows(
  companyId: number,
  filters: TrainingReportFilters = {},
): Promise<TrainingReportRow[]> {
  const employees = await db
    .select()
    .from(employeesTable)
    .where(eq(employeesTable.companyId, companyId));
  if (employees.length === 0) return [];

  const employeeIds = employees.map((employee) => employee.id);
  const assignments = await db
    .select()
    .from(courseAssignmentsTable)
    .where(eq(courseAssignmentsTable.companyId, companyId));
  if (assignments.length === 0) return [];

  const courseIds = Array.from(new Set(assignments.map((row) => row.courseId)));
  const [courses, enrollments, certificates] = await Promise.all([
    db.select().from(coursesTable).where(inArray(coursesTable.id, courseIds)),
    db
      .select()
      .from(enrollmentsTable)
      .where(inArray(enrollmentsTable.employeeId, employeeIds)),
    db
      .select()
      .from(certificatesTable)
      .where(inArray(certificatesTable.employeeId, employeeIds)),
  ]);

  const employeeMap = new Map(employees.map((employee) => [employee.id, employee]));
  const courseMap = new Map(courses.map((course) => [course.id, course as Course]));
  const enrollmentMap = new Map(
    enrollments.map((enrollment) => [
      `${enrollment.employeeId}:${enrollment.courseId}`,
      enrollment,
    ]),
  );
  const certificateMap = new Map(
    certificates.map((certificate) => [
      `${certificate.employeeId}:${certificate.courseId}`,
      certificate,
    ]),
  );

  const rows = assignments
    .map((assignment): TrainingReportRow | null => {
      const employee = employeeMap.get(assignment.employeeId);
      if (!employee) return null;
      const course = courseMap.get(assignment.courseId);
      const enrollment = enrollmentMap.get(
        `${assignment.employeeId}:${assignment.courseId}`,
      );
      const certificate = certificateMap.get(
        `${assignment.employeeId}:${assignment.courseId}`,
      );
      const completedAt =
        enrollment?.completedAt ?? assignment.completedAt ?? certificate?.issuedAt ?? null;
      const progressPct = enrollment?.progressPct ?? (completedAt ? 100 : 0);
      const status = getAssignmentStatus({
        progressPct,
        completedAt,
        dueDate: enrollment?.dueDate ?? assignment.dueDate,
      });

      return {
        assignmentId: assignment.id,
        employeeId: employee.id,
        employeeName: employee.name,
        email: employee.email,
        department: employee.department,
        jobTitle: employee.jobTitle,
        courseId: assignment.courseId,
        courseTitle: course?.title ?? "Unknown course",
        assignedAt: assignment.assignedAt,
        dueDate: enrollment?.dueDate ?? assignment.dueDate,
        completedAt,
        progressPct,
        status,
        certificateId: certificate?.id ?? null,
        certificateCode: certificate?.uniqueCode ?? null,
        certificateIssuedAt: certificate?.issuedAt ?? null,
        lastAccessedAt: enrollment?.lastAccessedAt ?? null,
      };
    })
    .filter((row): row is TrainingReportRow => Boolean(row));

  return filterRows(rows, filters).sort((a, b) => {
    const statusOrder: Record<AssignmentStatus, number> = {
      overdue: 0,
      in_progress: 1,
      not_started: 2,
      completed: 3,
    };
    return statusOrder[a.status] - statusOrder[b.status];
  });
}

export async function getCompanyLmsOverview(companyId: number) {
  const [company] = await db
    .select()
    .from(companiesTable)
    .where(eq(companiesTable.id, companyId))
    .limit(1);
  const employees = await db
    .select()
    .from(employeesTable)
    .where(eq(employeesTable.companyId, companyId));
  const rows = await getTrainingReportRows(companyId);
  const now = new Date();

  const byEmployee = new Map<number, TrainingReportRow[]>();
  for (const row of rows) {
    const list = byEmployee.get(row.employeeId) ?? [];
    list.push(row);
    byEmployee.set(row.employeeId, list);
  }

  const employeeTraining: EmployeeTrainingSummary[] = employees
    .map((employee) => {
      const assigned = byEmployee.get(employee.id) ?? [];
      const completedCourses = assigned.filter((row) => row.status === "completed").length;
      const overdueCourses = assigned.filter((row) => row.status === "overdue").length;
      return {
        employeeId: employee.id,
        employeeName: employee.name,
        email: employee.email,
        department: employee.department,
        jobTitle: employee.jobTitle,
        assignedCourses: assigned.length,
        completedCourses,
        overdueCourses,
        completionRate: getCompletionRate(completedCourses, assigned.length),
        status: getEmployeeTrainingStatus(assigned),
      };
    })
    .sort((a, b) => {
      const order: Record<EmployeeTrainingStatus, number> = {
        not_started: 0,
        in_progress: 1,
        completed: 2,
      };
      return order[a.status] - order[b.status] || a.employeeName.localeCompare(b.employeeName);
    });

  const coursesCompleted = rows.filter((row) => row.status === "completed").length;
  const activeLearnerIds = new Set(
    rows
      .filter((row) => row.progressPct > 0 || row.status === "completed")
      .map((row) => row.employeeId),
  );
  const certificateRefs = rows.filter((row) => row.certificateCode).length;

  return {
    companyName: company?.name ?? "EcoLearn company",
    stats: {
      totalEmployees: employees.length,
      activeLearners: activeLearnerIds.size,
      coursesAssigned: rows.length,
      coursesCompleted,
      averageCompletionRate: getCompletionRate(coursesCompleted, rows.length),
      certificatesEarned: certificateRefs,
    },
    employeeTraining,
    actionNeeded: rows
      .filter((row) =>
        isActionNeeded(
          {
            progressPct: row.progressPct,
            completedAt: row.completedAt,
            dueDate: row.dueDate,
          },
          now,
        ),
      )
      .slice(0, 10),
  };
}
