import { db } from "@workspace/db";
import {
  coursesTable,
  enrollmentsTable,
  learningPathCoursesTable,
  learningPathsTable,
  courseCategoryAssignmentsTable,
  categoriesTable,
} from "@workspace/db";
import { eq, and, asc, inArray, or } from "drizzle-orm";
import { CompanyAccess } from "./access";

export type RecommendedCourseRecommendation = {
  courseId: number;
  courseCode: string | null;
  title: string;
  slug: string | null;
  thumbnailUrl: string | null;
  reasonHeading: string;
  reasonDescription: string;
  actionText: string;
  actionHref: string;
  isLocked: boolean;
  lockReason: string | null;
};

export async function getRecommendedNextCourse(
  access: CompanyAccess | null
): Promise<RecommendedCourseRecommendation | null> {
  // If no user, default recommendation is ELH-01 (Sustainability Foundations)
  if (!access) {
    const elh01 = await db
      .select({
        id: coursesTable.id,
        courseCode: coursesTable.courseCode,
        title: coursesTable.title,
        slug: coursesTable.slug,
        thumbnailUrl: coursesTable.thumbnailUrl,
      })
      .from(coursesTable)
      .where(eq(coursesTable.courseCode, "ELH-01"))
      .limit(1)
      .then(rows => rows[0]);

    if (!elh01) return null;

    return {
      courseId: elh01.id,
      courseCode: elh01.courseCode,
      title: elh01.title,
      slug: elh01.slug,
      thumbnailUrl: elh01.thumbnailUrl,
      reasonHeading: "Start your sustainability journey",
      reasonDescription: "Begin with Sustainability Foundations, the first course in your Core Sustainability Certificate.",
      actionText: "Start course",
      actionHref: `/courses/${elh01.id}`,
      isLocked: false,
      lockReason: null,
    };
  }

  // Get user enrollments
  const enrollmentClauses = [eq(enrollmentsTable.userId, access.userId)];
  if (access.employee) {
    enrollmentClauses.push(eq(enrollmentsTable.employeeId, access.employee.id));
    enrollmentClauses.push(inArray(enrollmentsTable.userId, [access.employee.email]));
  } else if (access.email) {
    enrollmentClauses.push(eq(enrollmentsTable.userId, access.email));
  }

  const userEnrollments = await db
    .select({
      id: enrollmentsTable.id,
      courseId: enrollmentsTable.courseId,
      status: enrollmentsTable.status,
      dueDate: enrollmentsTable.dueDate,
    })
    .from(enrollmentsTable)
    .where(or(...enrollmentClauses));

  const completedSet = new Set(userEnrollments.filter(e => e.status === "completed").map(e => e.courseId));
  const inProgressMap = new Map(userEnrollments.filter(e => e.status === "in_progress").map(e => [e.courseId, e]));

  const now = new Date();

  // Priority 1: Overdue assigned course
  const overdueEnrollment = userEnrollments.find(
    e => e.status !== "completed" && e.dueDate && new Date(e.dueDate) < now
  );
  if (overdueEnrollment) {
    const course = await getCourseById(overdueEnrollment.courseId);
    if (course) {
      return {
        courseId: course.id,
        courseCode: course.courseCode,
        title: course.title,
        slug: course.slug,
        thumbnailUrl: course.thumbnailUrl,
        reasonHeading: "Overdue Assignment",
        reasonDescription: `You have an overdue training requirement for ${course.title}. Complete it to maintain compliance.`,
        actionText: inProgressMap.has(course.id) ? "Continue course" : "Start course",
        actionHref: `/learn/${overdueEnrollment.id}`,
        isLocked: false,
        lockReason: null,
      };
    }
  }

  // Priority 2: Assigned course in progress
  const assignedInProgress = userEnrollments.find(e => e.status === "in_progress" && e.dueDate);
  if (assignedInProgress) {
    const course = await getCourseById(assignedInProgress.courseId);
    if (course) {
      return {
        courseId: course.id,
        courseCode: course.courseCode,
        title: course.title,
        slug: course.slug,
        thumbnailUrl: course.thumbnailUrl,
        reasonHeading: "Assigned Training In Progress",
        reasonDescription: `Continue working on ${course.title} assigned by your organisation.`,
        actionText: "Continue course",
        actionHref: `/learn/${assignedInProgress.id}`,
        isLocked: false,
        lockReason: null,
      };
    }
  }

  // Priority 3: Assigned course not yet started
  const assignedNotStarted = userEnrollments.find(e => e.status === "not_started" && e.dueDate);
  if (assignedNotStarted) {
    const course = await getCourseById(assignedNotStarted.courseId);
    if (course) {
      return {
        courseId: course.id,
        courseCode: course.courseCode,
        title: course.title,
        slug: course.slug,
        thumbnailUrl: course.thumbnailUrl,
        reasonHeading: "Assigned Training",
        reasonDescription: `Begin your assigned course: ${course.title}.`,
        actionText: "Start course",
        actionHref: `/courses/${course.id}`,
        isLocked: false,
        lockReason: null,
      };
    }
  }

  // Priority 4: General in-progress course
  const anyInProgress = userEnrollments.find(e => e.status === "in_progress");
  if (anyInProgress) {
    const course = await getCourseById(anyInProgress.courseId);
    if (course) {
      return {
        courseId: course.id,
        courseCode: course.courseCode,
        title: course.title,
        slug: course.slug,
        thumbnailUrl: course.thumbnailUrl,
        reasonHeading: "Continue where you left off",
        reasonDescription: `You have already started ${course.title}. Complete the remaining lessons.`,
        actionText: "Continue course",
        actionHref: `/learn/${anyInProgress.id}`,
        isLocked: false,
        lockReason: null,
      };
    }
  }

  // Fetch all core courses ELH-01 to ELH-12 in order
  const coreCourses = await db
    .select({
      id: coursesTable.id,
      courseCode: coursesTable.courseCode,
      title: coursesTable.title,
      slug: coursesTable.slug,
      thumbnailUrl: coursesTable.thumbnailUrl,
    })
    .from(coursesTable)
    .where(
      inArray(coursesTable.courseCode, [
        "ELH-01", "ELH-02", "ELH-03", "ELH-04", "ELH-05", "ELH-06",
        "ELH-07", "ELH-08", "ELH-09", "ELH-10", "ELH-11", "ELH-12"
      ])
    )
    .orderBy(asc(coursesTable.id));

  // Priority 5: Next unfinished core course (ELH-01 to ELH-11)
  for (const c of coreCourses) {
    if (c.courseCode !== "ELH-12" && !completedSet.has(c.id)) {
      const isFirst = c.courseCode === "ELH-01";
      return {
        courseId: c.id,
        courseCode: c.courseCode,
        title: c.title,
        slug: c.slug,
        thumbnailUrl: c.thumbnailUrl,
        reasonHeading: isFirst ? "Start your sustainability journey" : "Next core course",
        reasonDescription: isFirst
          ? "Begin with Sustainability Foundations, the first course in your Core Sustainability Certificate."
          : `Continue your Core Sustainability Certificate with ${c.title}.`,
        actionText: "Start course",
        actionHref: `/courses/${c.id}`,
        isLocked: false,
        lockReason: null,
      };
    }
  }

  // Priority 6: ELH-12 if all ELH-01..11 are completed and ELH-12 is unfinished
  const elh12 = coreCourses.find(c => c.courseCode === "ELH-12");
  if (elh12 && !completedSet.has(elh12.id)) {
    const core1to11Count = coreCourses.filter(c => c.courseCode !== "ELH-12" && completedSet.has(c.id)).length;
    const allCoreDone = core1to11Count >= 11;

    return {
      courseId: elh12.id,
      courseCode: elh12.courseCode,
      title: elh12.title,
      slug: elh12.slug,
      thumbnailUrl: elh12.thumbnailUrl,
      reasonHeading: "Your certification is within reach",
      reasonDescription: allCoreDone
        ? "You have completed all prerequisite courses. Complete the Final Sustainability Certification assessment to earn your credential."
        : `Complete your remaining core courses (${core1to11Count}/11 finished) to unlock the Final Sustainability Certification.`,
      actionText: allCoreDone ? "Start certification" : "View prerequisite",
      actionHref: `/courses/${elh12.id}`,
      isLocked: !allCoreDone,
      lockReason: allCoreDone ? null : "Complete remaining Core Sustainability Certificate courses first.",
    };
  }

  // Priority 7: Applied Courses (ELH-13) if core is completed
  const elh13 = await db
    .select({
      id: coursesTable.id,
      courseCode: coursesTable.courseCode,
      title: coursesTable.title,
      slug: coursesTable.slug,
      thumbnailUrl: coursesTable.thumbnailUrl,
    })
    .from(coursesTable)
    .where(eq(coursesTable.courseCode, "ELH-13"))
    .limit(1)
    .then(rows => rows[0]);

  if (elh13 && !completedSet.has(elh13.id)) {
    return {
      courseId: elh13.id,
      courseCode: elh13.courseCode,
      title: elh13.title,
      slug: elh13.slug,
      thumbnailUrl: elh13.thumbnailUrl,
      reasonHeading: "Put your learning into practice",
      reasonDescription: "Sustainability Action Planning is the recommended next step after core certification.",
      actionText: "Start course",
      actionHref: `/courses/${elh13.id}`,
      isLocked: false,
      lockReason: null,
    };
  }

  // Default: First incomplete published course
  const firstIncomplete = await db
    .select({
      id: coursesTable.id,
      courseCode: coursesTable.courseCode,
      title: coursesTable.title,
      slug: coursesTable.slug,
      thumbnailUrl: coursesTable.thumbnailUrl,
    })
    .from(coursesTable)
    .where(eq(coursesTable.isPublished, true))
    .orderBy(asc(coursesTable.id));

  const nextUnfinished = firstIncomplete.find(c => !completedSet.has(c.id));
  if (nextUnfinished) {
    return {
      courseId: nextUnfinished.id,
      courseCode: nextUnfinished.courseCode,
      title: nextUnfinished.title,
      slug: nextUnfinished.slug,
      thumbnailUrl: nextUnfinished.thumbnailUrl,
      reasonHeading: "Expand your expertise",
      reasonDescription: `Explore ${nextUnfinished.title} to further develop your workplace sustainability skills.`,
      actionText: "Start course",
      actionHref: `/courses/${nextUnfinished.id}`,
      isLocked: false,
      lockReason: null,
    };
  }

  return null;
}

async function getCourseById(id: number) {
  return db
    .select({
      id: coursesTable.id,
      courseCode: coursesTable.courseCode,
      title: coursesTable.title,
      slug: coursesTable.slug,
      thumbnailUrl: coursesTable.thumbnailUrl,
    })
    .from(coursesTable)
    .where(eq(coursesTable.id, id))
    .limit(1)
    .then(rows => rows[0] || null);
}
