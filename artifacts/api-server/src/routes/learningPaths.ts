import { Router } from "express";
import { db } from "@workspace/db";
import {
  learningPathsTable,
  learningPathCoursesTable,
  coursesTable,
  enrollmentsTable,
} from "@workspace/db";
import { eq, asc, and, inArray } from "drizzle-orm";

const router = Router();

// GET /learning-paths
router.get("/", async (req, res): Promise<void> => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // 1. Fetch published paths
    const paths = await db
      .select()
      .from(learningPathsTable)
      .where(eq(learningPathsTable.status, "active"))
      .orderBy(asc(learningPathsTable.id)); // orderIndex is deprecated

    // 2. Fetch path courses
    const pathIds = paths.map((p) => p.id);
    if (pathIds.length === 0) {
      res.json([]);
      return;
    }

    const pathCourses = await db
      .select({
        pathId: learningPathCoursesTable.pathId,
        position: learningPathCoursesTable.position,
        courseId: coursesTable.id,
        courseTitle: coursesTable.title,
        durationMinutes: coursesTable.durationMinutes,
      })
      .from(learningPathCoursesTable)
      .innerJoin(coursesTable, eq(learningPathCoursesTable.courseId, coursesTable.id))
      .where(inArray(learningPathCoursesTable.pathId, pathIds))
      .orderBy(asc(learningPathCoursesTable.pathId), asc(learningPathCoursesTable.position));

    // 3. Fetch user's completed enrollments
    const completedRows = await db
      .select({ courseId: enrollmentsTable.courseId })
      .from(enrollmentsTable)
      .where(
        and(
          eq(enrollmentsTable.userId, userId),
          eq(enrollmentsTable.status, "completed")
        )
      );
    const completedSet = new Set(completedRows.map((r) => r.courseId));

    // 4. Map to summary
    const result = paths.map((path) => {
      const coursesForPath = pathCourses.filter((c) => c.pathId === path.id);
      const totalCourses = coursesForPath.length;
      let completedCourses = 0;
      let nextCourse = null;

      for (const c of coursesForPath) {
        if (completedSet.has(c.courseId)) {
          completedCourses++;
        } else if (!nextCourse) {
          nextCourse = {
            id: c.courseId,
            title: c.courseTitle,
          };
        }
      }

      const progressPct = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;
      const isComplete = totalCourses > 0 && completedCourses === totalCourses;

      return {
        id: path.id,
        slug: path.slug,
        title: path.title,
        description: path.description,
        audience: path.audience,
        level: path.level,
        providerLabel: path.providerLabel,
        isSystemManaged: path.isSystemManaged,
        totalCourses,
        completedCourses,
        progressPct,
        isComplete,
        estimatedDurationMinutes: path.estimatedDurationMinutes,
        nextCourse,
      };
    });

    res.json(result);
  } catch (err) {
    req.log?.error?.({ err }, "Failed to list learning paths");
    res.status(500).json({ error: "Failed to load learning paths" });
  }
});

// GET /learning-paths/:slug
router.get("/:slug", async (req, res): Promise<void> => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const { slug } = req.params;

    // 1. Fetch the path
    const [path] = await db
      .select()
      .from(learningPathsTable)
      .where(
        and(
          eq(learningPathsTable.slug, slug),
          eq(learningPathsTable.status, "active")
        )
      )
      .limit(1);

    if (!path) {
      res.status(404).json({ error: "Learning path not found" });
      return;
    }

    // 2. Fetch the ordered courses + catalogue metadata
    const pathCourses = await db
      .select({
        position: learningPathCoursesTable.position,
        isRequired: learningPathCoursesTable.isRequired,
        course: {
          id: coursesTable.id,
          title: coursesTable.title,
          slug: coursesTable.slug,
          courseCode: coursesTable.courseCode,
          description: coursesTable.description,
          durationMinutes: coursesTable.durationMinutes,
          level: coursesTable.level,
          thumbnailUrl: coursesTable.thumbnailUrl,
        }
      })
      .from(learningPathCoursesTable)
      .innerJoin(coursesTable, eq(learningPathCoursesTable.courseId, coursesTable.id))
      .where(eq(learningPathCoursesTable.pathId, path.id))
      .orderBy(asc(learningPathCoursesTable.position));

    // 3. Fetch user enrollments for these courses
    const courseIds = pathCourses.map(c => c.course.id);
    let enrollmentsMap = new Map<number, any>();
    if (courseIds.length > 0) {
      const enrollments = await db
        .select()
        .from(enrollmentsTable)
        .where(
          and(
            eq(enrollmentsTable.userId, userId),
            inArray(enrollmentsTable.courseId, courseIds)
          )
        );
      for (const enr of enrollments) {
        enrollmentsMap.set(enr.courseId, enr);
      }
    }

    // 4. Calculate progress and lock state
    let completedRequired = 0;
    let totalRequired = 0;
    
    // Check if courses 1-11 are complete to unlock Course 12 (idempotent generic check if they have prerequisites)
    // The instructions say: "Course 12 must retain its existing requirement that Courses 1-11 are completed"
    // To implement this visually, we evaluate completeness sequentially for Course 1-11.
    // Since this is the Core Sustainability Certificate, we can enforce: Course 12 is locked if completedRequired < 11
    
    let allFirstElevenCompleted = true;

    for (let i = 0; i < pathCourses.length; i++) {
      const c = pathCourses[i];
      if (c.isRequired) totalRequired++;
      
      const enr = enrollmentsMap.get(c.course.id);
      const isCompleted = enr?.status === "completed";
      if (isCompleted && c.isRequired) {
        completedRequired++;
      }

      // Check the first 11 positions for completion
      if (c.position! < 12 && !isCompleted) {
        allFirstElevenCompleted = false;
      }
    }

    const progressPct = totalRequired > 0 ? Math.round((completedRequired / totalRequired) * 100) : 0;
    const isPathComplete = totalRequired > 0 && completedRequired === totalRequired;

    let nextCourse = null;
    let firstInProgress: number | null = null;
    let firstNotStarted: number | null = null;

    const mappedCourses = pathCourses.map((c) => {
      const enr = enrollmentsMap.get(c.course.id);
      let status = "not_started";
      if (enr) {
        status = enr.status === "completed" ? "completed" : "in_progress";
      }

      // Determine visual lock
      let isLocked = false;
      // Core curriculum logic: Course 12 is locked if courses 1-11 are not complete
      if (c.course.courseCode === 'ELH-12' && !allFirstElevenCompleted) {
        isLocked = true;
        status = "locked";
      }

      if (status === "in_progress" && !firstInProgress) firstInProgress = c.course.id;
      if (status === "not_started" && !firstNotStarted && !isLocked) firstNotStarted = c.course.id;

      let action = "Start course";
      if (status === "completed") action = "Review course";
      else if (status === "in_progress") action = "Continue course";
      else if (status === "locked") action = "Locked";

      return {
        position: c.position,
        isRequired: c.isRequired,
        course: c.course,
        status,
        isLocked,
        action,
        enrollmentId: enr?.id
      };
    });

    nextCourse = firstInProgress || firstNotStarted;

    res.json({
      id: path.id,
      slug: path.slug,
      title: path.title,
      description: path.description,
      audience: path.audience,
      level: path.level,
      providerLabel: path.providerLabel,
      isSystemManaged: path.isSystemManaged,
      estimatedDurationMinutes: path.estimatedDurationMinutes,
      totalCourses: pathCourses.length,
      completedCourses: completedRequired,
      progressPct,
      isComplete: isPathComplete,
      nextCourse,
      courses: mappedCourses,
    });
  } catch (err) {
    req.log?.error?.({ err }, "Failed to get learning path details");
    res.status(500).json({ error: "Failed to load learning path details" });
  }
});

export default router;
