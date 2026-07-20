import { db } from "@workspace/db";
import {
  coursePrerequisitesTable,
  coursesTable,
  enrollmentsTable,
} from "@workspace/db";
import { and, eq, inArray, or } from "drizzle-orm";
import { CompanyAccess } from "./access";

export type PrerequisiteStatus = {
  courseId: number;
  title: string;
  slug: string;
  completed: boolean;
};

export type EligibilityResult = {
  eligible: boolean;
  completedCount: number;
  totalCount: number;
  prerequisites: PrerequisiteStatus[];
};

export async function checkCourseEligibility(
  courseId: number,
  access: CompanyAccess | null
): Promise<EligibilityResult> {
  // 1. Get all prerequisites for the target course
  const prereqs = await db
    .select({
      courseId: coursesTable.id,
      title: coursesTable.title,
      slug: coursesTable.slug,
    })
    .from(coursePrerequisitesTable)
    .innerJoin(
      coursesTable,
      eq(coursePrerequisitesTable.prerequisiteCourseId, coursesTable.id)
    )
    .where(eq(coursePrerequisitesTable.courseId, courseId));

  const totalCount = prereqs.length;
  
  if (totalCount === 0) {
    return {
      eligible: true,
      completedCount: 0,
      totalCount: 0,
      prerequisites: [],
    };
  }

  const prereqIds = prereqs.map(p => p.courseId);

  let completedCourseIds = new Set<number>();

  if (access) {
    // 2. Fetch enrollments for the user
    const enrollmentClauses = [eq(enrollmentsTable.userId, access.userId)];
    if (access.employee) {
      enrollmentClauses.push(eq(enrollmentsTable.employeeId, access.employee.id));
      enrollmentClauses.push(inArray(enrollmentsTable.userId, [access.employee.email]));
    } else if (access.email) {
      enrollmentClauses.push(eq(enrollmentsTable.userId, access.email));
    }

    const userEnrollments = await db
      .select({
        courseId: enrollmentsTable.courseId,
        status: enrollmentsTable.status,
      })
      .from(enrollmentsTable)
      .where(
        and(
          inArray(enrollmentsTable.courseId, prereqIds),
          or(...enrollmentClauses)
        )
      );

    completedCourseIds = new Set(
      userEnrollments
        .filter(e => e.status === "completed")
        .map(e => e.courseId)
    );
  }

  let completedCount = 0;
  const prerequisitesState: PrerequisiteStatus[] = prereqs.map(p => {
    const isCompleted = completedCourseIds.has(p.courseId);
    if (isCompleted) {
      completedCount++;
    }
    if (!p.slug) {
      throw new Error(`Data integrity violation: Prerequisite course (ID: ${p.courseId}) is missing a unique URL slug.`);
    }
    return {
      courseId: p.courseId,
      title: p.title,
      slug: p.slug,
      completed: isCompleted,
    };
  });

  return {
    eligible: completedCount === totalCount,
    completedCount,
    totalCount,
    prerequisites: prerequisitesState,
  };
}
