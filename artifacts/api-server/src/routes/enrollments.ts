import { Router } from "express";
import { db } from "@workspace/db";
import { enrollmentsTable, coursesTable, lessonsTable } from "@workspace/db";
import { eq, and, or, inArray } from "drizzle-orm";
import { CreateEnrollmentBody } from "@workspace/api-zod";
import { getCompanyAccess, sendHttpError } from "../lib/access";
import { getAssignmentStatus } from "../lib/lms";

const router = Router();

router.get("/", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    const clauses = [eq(enrollmentsTable.userId, access.userId)];
    if (access.employee) {
      clauses.push(eq(enrollmentsTable.employeeId, access.employee.id));
      clauses.push(inArray(enrollmentsTable.userId, [access.employee.email]));
    } else if (access.email) {
      clauses.push(eq(enrollmentsTable.userId, access.email));
    }

    const enrollments = await db
      .select({
        id: enrollmentsTable.id,
        userId: enrollmentsTable.userId,
        companyId: enrollmentsTable.companyId,
        employeeId: enrollmentsTable.employeeId,
        courseId: enrollmentsTable.courseId,
        courseName: coursesTable.title,
        courseThumbnail: coursesTable.thumbnailUrl,
        status: enrollmentsTable.status,
        progressPct: enrollmentsTable.progressPct,
        dueDate: enrollmentsTable.dueDate,
        lastAccessedAt: enrollmentsTable.lastAccessedAt,
        completedAt: enrollmentsTable.completedAt,
        createdAt: enrollmentsTable.createdAt,
      })
      .from(enrollmentsTable)
      .leftJoin(coursesTable, eq(enrollmentsTable.courseId, coursesTable.id))
      .where(or(...clauses))
      .orderBy(enrollmentsTable.dueDate, enrollmentsTable.createdAt);

    res.json(
      enrollments.map((enrollment) => ({
        ...enrollment,
        assignmentStatus: getAssignmentStatus(enrollment),
      })),
    );
  } catch (err) {
    if (!sendHttpError(res, err)) {
      req.log?.error({ err }, "Failed to list enrollments");
      res.status(500).json({ error: "Failed to list enrollments" });
    }
  }
});

router.post("/", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    const parsed = CreateEnrollmentBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const existingClauses = [eq(enrollmentsTable.userId, access.userId)];
    if (access.employee) {
      existingClauses.push(eq(enrollmentsTable.employeeId, access.employee.id));
      existingClauses.push(eq(enrollmentsTable.userId, access.employee.email));
    }

    const [course] = await db
      .select({ isPublished: coursesTable.isPublished })
      .from(coursesTable)
      .where(eq(coursesTable.id, parsed.data.courseId));

    if (!course) {
      res.status(404).json({ error: "Course not found" });
      return;
    }

    if (!course.isPublished && access.role !== "platform_admin") {
      res.status(403).json({ error: "Cannot enroll in an unpublished course" });
      return;
    }

    const { checkCourseEligibility } = await import("../lib/prerequisites");
    const eligibility = await checkCourseEligibility(parsed.data.courseId, access);
    if (!eligibility.eligible) {
      res.status(403).json({ 
        error: "PREREQUISITES_INCOMPLETE",
        message: "You must complete all prerequisite courses before enrolling.",
        completedCount: eligibility.completedCount,
        totalCount: eligibility.totalCount,
        prerequisites: eligibility.prerequisites,
      });
      return;
    }

    const existing = await db
      .select()
      .from(enrollmentsTable)
      .where(
        and(
          eq(enrollmentsTable.courseId, parsed.data.courseId),
          or(...existingClauses),
        ),
      );

    if (existing.length > 0) {
      res.status(400).json({ error: "Already enrolled in this course" });
      return;
    }

    const [enrollment] = await db
      .insert(enrollmentsTable)
      .values({
        userId: access.userId,
        companyId: access.employee?.companyId ?? access.companyId,
        employeeId: access.employee?.id,
        courseId: parsed.data.courseId,
      })
      .returning();
    res.status(201).json({
      ...enrollment,
      assignmentStatus: getAssignmentStatus(enrollment),
    });
  } catch (err) {
    if (!sendHttpError(res, err)) {
      req.log?.error({ err }, "Failed to create enrollment");
      res.status(500).json({ error: "Failed to create enrollment" });
    }
  }
});

router.get("/:id", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(raw, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const [enrollment] = await db
      .select({
        id: enrollmentsTable.id,
        userId: enrollmentsTable.userId,
        companyId: enrollmentsTable.companyId,
        employeeId: enrollmentsTable.employeeId,
        courseId: enrollmentsTable.courseId,
        courseName: coursesTable.title,
        courseThumbnail: coursesTable.thumbnailUrl,
        status: enrollmentsTable.status,
        progressPct: enrollmentsTable.progressPct,
        dueDate: enrollmentsTable.dueDate,
        lastAccessedAt: enrollmentsTable.lastAccessedAt,
        completedAt: enrollmentsTable.completedAt,
        createdAt: enrollmentsTable.createdAt,
      })
      .from(enrollmentsTable)
      .leftJoin(coursesTable, eq(enrollmentsTable.courseId, coursesTable.id))
      .where(eq(enrollmentsTable.id, id));

    if (!enrollment) {
      res.status(404).json({ error: "Enrollment not found" });
      return;
    }

    const canAccess =
      access.role !== "employee" ||
      enrollment.userId === access.userId ||
      enrollment.employeeId === access.employee?.id ||
      Boolean(access.email && enrollment.userId === access.email);
    if (!canAccess) {
      res.status(403).json({ error: "You can only view your assigned training" });
      return;
    }

    const [course] = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.id, enrollment.courseId))
      .limit(1);

    if (!course) {
      res.status(404).json({ error: "Course not found" });
      return;
    }



    // Block non-admin learners from accessing unpublished courses
    const isPlatformAdmin = access.role === "platform_admin";
    if (!course.isPublished && !isPlatformAdmin) {
      res.status(403).json({ error: "This course is not published yet" });
      return;
    }

    const { checkCourseEligibility } = await import("../lib/prerequisites");
    const eligibility = await checkCourseEligibility(enrollment.courseId, access);
    if (!eligibility.eligible && !isPlatformAdmin) {
      res.status(403).json({
        error: "PREREQUISITES_INCOMPLETE",
        message: "You must complete all prerequisite courses before accessing this course content."
      });
      return;
    }

    const lessons = await db
      .select()
      .from(lessonsTable)
      .where(eq(lessonsTable.courseId, enrollment.courseId))
      .orderBy(lessonsTable.orderIndex);

    res.json({
      ...enrollment,
      assignmentStatus: getAssignmentStatus(enrollment),
      course: course
        ? {
            ...course,
            priceUsd: parseFloat(course.priceUsd),
            rating: course.rating != null ? parseFloat(course.rating) : null,
            lessons,
          }
        : null,
    });
  } catch (err) {
    if (!sendHttpError(res, err)) {
      req.log?.error({ err }, "Failed to get enrollment");
      res.status(500).json({ error: "Failed to get enrollment" });
    }
  }
});

export default router;
