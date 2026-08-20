import { Router } from "express";
import { db } from "@workspace/db";
import { enrollmentsTable, coursesTable, lessonsTable, courseAssignmentsTable } from "@workspace/db";
import { eq, and, or, inArray, sql } from "drizzle-orm";
import { CreateEnrollmentBody } from "@workspace/api-zod";
import { getCompanyAccess, requireCompletedProfile, sendHttpError } from "../lib/access";
import { getAssignmentStatus } from "../lib/lms";

const router = Router();

router.get("/", async (req, res): Promise<void> => {
  try {
    const access = await requireCompletedProfile(req);
    const clauses = [eq(enrollmentsTable.userId, access.userId)];

    if (access.email) {
      clauses.push(sql`lower(${enrollmentsTable.userId}) = ${access.email.toLowerCase()}`);
    }

    if (access.employee) {
      clauses.push(eq(enrollmentsTable.employeeId, access.employee.id));
      if (access.employee.email) {
        clauses.push(sql`lower(${enrollmentsTable.userId}) = ${access.employee.email.toLowerCase()}`);
      }

      // Sync any active course_assignments into enrollmentsTable idempotently
      try {
        const assignments = await db
          .select()
          .from(courseAssignmentsTable)
          .where(eq(courseAssignmentsTable.employeeId, access.employee.id));

        for (const assignment of assignments) {
          const [existing] = await db
            .select({ id: enrollmentsTable.id })
            .from(enrollmentsTable)
            .where(
              and(
                eq(enrollmentsTable.courseId, assignment.courseId),
                or(
                  eq(enrollmentsTable.userId, access.userId),
                  eq(enrollmentsTable.employeeId, access.employee.id),
                )
              )
            )
            .limit(1);

          if (!existing) {
            await db
              .insert(enrollmentsTable)
              .values({
                userId: access.userId,
                companyId: access.employee.companyId,
                employeeId: access.employee.id,
                courseId: assignment.courseId,
                assignmentSource: "company",
                dueDate: assignment.dueDate,
                status: assignment.completedAt ? "completed" : "active",
                completedAt: assignment.completedAt,
                progressPct: assignment.completedAt ? 100 : 0,
              });
          }
        }
      } catch (err) {
        // Non-blocking sync
      }
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
      .orderBy(sql`${enrollmentsTable.createdAt} DESC`);

    res.json(
      enrollments.map((e) => ({
        ...e,
        assignmentStatus: getAssignmentStatus(e),
      }))
    );
  } catch (err) {
    if (!sendHttpError(res, err)) {
      req.log?.error({ err }, "Failed to get enrollments");
      res.status(500).json({ error: "Failed to get enrollments" });
    }
  }
});

router.post("/", async (req, res): Promise<void> => {
  try {
    const access = await requireCompletedProfile(req);
    const parsed = CreateEnrollmentBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const existingClauses = [eq(enrollmentsTable.userId, access.userId)];
    if (access.email) {
      existingClauses.push(sql`lower(${enrollmentsTable.userId}) = ${access.email.toLowerCase()}`);
    }
    if (access.employee) {
      existingClauses.push(eq(enrollmentsTable.employeeId, access.employee.id));
      if (access.employee.email) {
        existingClauses.push(sql`lower(${enrollmentsTable.userId}) = ${access.employee.email.toLowerCase()}`);
      }
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

    const { evaluateCourseAccess } = await import("../lib/courseAccessService");
    const accessDecision = await evaluateCourseAccess(parsed.data.courseId, access);

    if (!accessDecision.allowed) {
      const errorResponse: Record<string, any> = {
        error: accessDecision.reason === "PREREQUISITE_REQUIRED"
          ? "PREREQUISITES_INCOMPLETE"
          : accessDecision.reason,
        message: accessDecision.reason === "PLAN_UPGRADE_REQUIRED"
          ? `This course is available with the ${accessDecision.requiredPlanName} plan. Contact your company administrator to upgrade your subscription.`
          : accessDecision.reason === "PREREQUISITE_REQUIRED"
          ? "You must complete all prerequisite courses before enrolling in this course."
          : accessDecision.reason === "COMPANY_NOT_ASSIGNED"
          ? "Your account is not assigned to an active company subscription."
          : accessDecision.reason === "SUBSCRIPTION_INACTIVE"
          ? "Your company subscription is inactive."
          : "Access denied.",
      };
      if (accessDecision.requiredPlanCode) {
        errorResponse.requiredPlanCode = accessDecision.requiredPlanCode;
      }
      if (accessDecision.requiredPlanName) {
        errorResponse.requiredPlanName = accessDecision.requiredPlanName;
      }
      if (accessDecision.missingPrerequisiteCourseIds) {
        errorResponse.missingPrerequisiteCourseIds = accessDecision.missingPrerequisiteCourseIds;
      }
      if (accessDecision.prerequisiteDetails) {
        errorResponse.prerequisites = accessDecision.prerequisiteDetails;
      }
      res.status(403).json(errorResponse);
      return;
    }

    const existing = await db
      .select({
        id: enrollmentsTable.id,
        userId: enrollmentsTable.userId,
        companyId: enrollmentsTable.companyId,
        employeeId: enrollmentsTable.employeeId,
        courseId: enrollmentsTable.courseId,
        status: enrollmentsTable.status,
        progressPct: enrollmentsTable.progressPct,
        dueDate: enrollmentsTable.dueDate,
        lastAccessedAt: enrollmentsTable.lastAccessedAt,
        completedAt: enrollmentsTable.completedAt,
        createdAt: enrollmentsTable.createdAt,
      })
      .from(enrollmentsTable)
      .where(
        and(
          eq(enrollmentsTable.courseId, parsed.data.courseId),
          or(...existingClauses),
        ),
      );

    if (existing.length > 0) {
      const existingEnrollment = existing[0]!;
      // Link to current session credentials if not already linked
      if (existingEnrollment.userId !== access.userId || (access.employee && !existingEnrollment.employeeId)) {
        await db
          .update(enrollmentsTable)
          .set({
            userId: access.userId,
            employeeId: access.employee?.id ?? existingEnrollment.employeeId,
            companyId: access.employee?.companyId ?? access.companyId ?? existingEnrollment.companyId,
          })
          .where(eq(enrollmentsTable.id, existingEnrollment.id));
      }

      res.status(200).json({
        ...existingEnrollment,
        assignmentStatus: getAssignmentStatus(existingEnrollment),
      });
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
    const access = await requireCompletedProfile(req);
    const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(raw, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    let [enrollment] = await db
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

    // Fallback: If not found by enrollment ID, check if :id is a courseId for which the user is enrolled or assigned
    if (!enrollment) {
      const userClauses = [eq(enrollmentsTable.userId, access.userId)];
      if (access.email) {
        userClauses.push(sql`lower(${enrollmentsTable.userId}) = ${access.email.toLowerCase()}`);
      }
      if (access.employee) {
        userClauses.push(eq(enrollmentsTable.employeeId, access.employee.id));
        if (access.employee.email) {
          userClauses.push(sql`lower(${enrollmentsTable.userId}) = ${access.employee.email.toLowerCase()}`);
        }
      }

      const [courseEnrollment] = await db
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
        .where(
          and(
            eq(enrollmentsTable.courseId, id),
            or(...userClauses),
          ),
        )
        .limit(1);

      if (courseEnrollment) {
        enrollment = courseEnrollment;
      } else {
        // Auto-hydrate: check if assigned or if id is a valid course in the catalogue
        let assignment: any = null;
        if (access.employee) {
          const [foundAssignment] = await db
            .select()
            .from(courseAssignmentsTable)
            .where(
              and(
                eq(courseAssignmentsTable.employeeId, access.employee.id),
                eq(courseAssignmentsTable.courseId, id),
              ),
            )
            .limit(1);
          assignment = foundAssignment ?? null;
        }

        const [courseRecord] = await db.select().from(coursesTable).where(eq(coursesTable.id, id)).limit(1);

        if (assignment || courseRecord) {
          const targetCourseId = assignment ? assignment.courseId : courseRecord.id;
          const [created] = await db
            .insert(enrollmentsTable)
            .values({
              userId: access.userId,
              companyId: access.employee?.companyId ?? (access.companyId ?? null),
              employeeId: access.employee?.id ?? null,
              courseId: targetCourseId,
              assignmentSource: assignment ? "company" : "self",
              dueDate: assignment?.dueDate ?? null,
              status: assignment?.completedAt ? "completed" : "active",
              completedAt: assignment?.completedAt ?? null,
              progressPct: assignment?.completedAt ? 100 : 0,
            })
            .returning();

          const [hydrated] = await db
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
            .where(eq(enrollmentsTable.id, created.id));

          enrollment = hydrated;
        }
      }
    }

    if (!enrollment) {
      res.status(404).json({ error: "Enrollment not found" });
      return;
    }

    const isOwner =
      enrollment.userId === access.userId ||
      (access.email && enrollment.userId && enrollment.userId.toLowerCase() === access.email.toLowerCase()) ||
      (access.employee && (enrollment.employeeId === access.employee.id || (enrollment.userId && enrollment.userId.toLowerCase() === access.employee.email.toLowerCase())));

    const isCompanyStaff =
      access.role === "platform_admin" ||
      access.role === "company_admin" ||
      access.role === "manager" ||
      (access.companyId && enrollment.companyId === access.companyId);

    const canAccess = isOwner || isCompanyStaff;
    if (!canAccess) {
      res.status(403).json({ error: "You can only view your assigned training" });
      return;
    }

    // Auto-link enrollment to current session userId if needed
    if (enrollment.userId !== access.userId) {
      await db
        .update(enrollmentsTable)
        .set({
          userId: access.userId,
          employeeId: access.employee?.id ?? enrollment.employeeId,
          companyId: access.employee?.companyId ?? access.companyId ?? enrollment.companyId,
        })
        .where(eq(enrollmentsTable.id, enrollment.id));
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

    // Learners with an active or assigned enrollment can always access their course lessons
    const isPlatformAdmin = access.role === "platform_admin";
    if (!course.isPublished && !isPlatformAdmin) {
      res.status(403).json({ error: "This course is not published yet" });
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
