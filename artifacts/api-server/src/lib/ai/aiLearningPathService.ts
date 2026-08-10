import { db } from "@workspace/db";
import {
  coursesTable,
  companiesTable,
  employeesTable,
  enrollmentsTable,
  courseAssignmentsTable,
  coursePrerequisitesTable,
} from "@workspace/db";
import { eq, and, or, inArray } from "drizzle-orm";
import { CompanyAccess } from "../access";
import {
  CourseCatalogItem,
  RecommendationInput,
  RecommendationResult,
} from "./recommendationProvider";
import { GeminiRecommendationProvider } from "./recommendationProviders";
import { logger } from "../logger";

export interface VerifiedRecommendation {
  courseId: number;
  courseCode: string;
  title: string;
  description: string;
  level: string;
  durationMinutes: number;
  thumbnailUrl: string | null;
  reason: string;
  priority: "high" | "medium" | "optional";
  prerequisitesMet: boolean;
  missingPrerequisiteTitles: string[];
}

export interface RecommendationResponse {
  employeeId: number;
  employeeName: string;
  department: string | null;
  jobTitle: string | null;
  companySector: string | null;
  trainingPriorities: string[];
  recommendations: VerifiedRecommendation[];
  pathwayReason: string;
  confidence: "high" | "medium" | "low";
  providerTag: "gemini" | "fallback";
  modelUsed: string;
  isFallback: boolean;
}

export async function generateEmployeeRecommendations(
  employeeId: number,
  access: CompanyAccess
): Promise<RecommendationResponse> {
  // 1. Fetch & verify employee belongs to admin's company
  const [emp] = await db
    .select()
    .from(employeesTable)
    .where(and(eq(employeesTable.id, employeeId), eq(employeesTable.companyId, access.companyId)))
    .limit(1);

  if (!emp) {
    throw new Error("Employee not found in your organization");
  }

  // 2. Fetch company profile
  const [company] = await db
    .select()
    .from(companiesTable)
    .where(eq(companiesTable.id, access.companyId))
    .limit(1);

  // 3. Fetch completed & assigned courses for this employee
  const enrollmentClauses = [];
  if (emp.clerkUserId) enrollmentClauses.push(eq(enrollmentsTable.userId, emp.clerkUserId));
  if (emp.email) enrollmentClauses.push(eq(enrollmentsTable.userId, emp.email));
  enrollmentClauses.push(eq(enrollmentsTable.employeeId, emp.id));

  const enrollments = await db
    .select({
      courseId: enrollmentsTable.courseId,
      status: enrollmentsTable.status,
    })
    .from(enrollmentsTable)
    .where(or(...enrollmentClauses));

  const completedCourseIds = Array.from(
    new Set(enrollments.filter((e) => e.status === "completed").map((e) => e.courseId))
  );

  const assignments = await db
    .select({ courseId: courseAssignmentsTable.courseId })
    .from(courseAssignmentsTable)
    .where(eq(courseAssignmentsTable.employeeId, emp.id));

  const assignedCourseIds = Array.from(
    new Set([
      ...enrollments.filter((e) => e.status === "in_progress" || e.status === "assigned").map((e) => e.courseId),
      ...assignments.map((a) => a.courseId),
    ])
  );

  // 4. Fetch active published courses
  const allCourses = await db
    .select({
      id: coursesTable.id,
      courseCode: coursesTable.courseCode,
      title: coursesTable.title,
      description: coursesTable.description,
      level: coursesTable.level,
      durationMinutes: coursesTable.durationMinutes,
      thumbnailUrl: coursesTable.thumbnailUrl,
    })
    .from(coursesTable)
    .where(eq(coursesTable.isPublished, true));

  const courseIds = allCourses.map((c) => c.id);

  // Fetch prerequisites map
  const rawPrereqs = courseIds.length > 0
    ? await db
        .select({
          courseId: coursePrerequisitesTable.courseId,
          prerequisiteCourseId: coursePrerequisitesTable.prerequisiteCourseId,
          prereqCode: coursesTable.courseCode,
          prereqTitle: coursesTable.title,
        })
        .from(coursePrerequisitesTable)
        .leftJoin(coursesTable, eq(coursePrerequisitesTable.prerequisiteCourseId, coursesTable.id))
        .where(inArray(coursePrerequisitesTable.courseId, courseIds))
    : [];

  const prereqMap = new Map<number, { id: number; code: string | null; title: string }[]>();
  for (const p of rawPrereqs) {
    if (!prereqMap.has(p.courseId)) prereqMap.set(p.courseId, []);
    prereqMap.get(p.courseId)!.push({
      id: p.prerequisiteCourseId,
      code: p.prereqCode,
      title: p.prereqTitle || "Prerequisite",
    });
  }

  const catalogItems: CourseCatalogItem[] = allCourses.map((c) => ({
    id: c.id,
    courseCode: c.courseCode || `ELH-${c.id}`,
    title: c.title,
    description: c.description || "",
    level: c.level || "Intermediate",
    durationMinutes: c.durationMinutes || 45,
    prerequisites: (prereqMap.get(c.id) || []).map((p) => p.code || String(p.id)),
  }));

  const input: RecommendationInput = {
    company: {
      sector: company?.industry || "Sustainability",
      employeeBand: String(company?.maxEmployees || 25),
      trainingPriorities: company?.trainingPriorities || [],
    },
    learner: {
      department: emp.department || "General",
      roleCategory: emp.role || "employee",
      jobTitle: emp.jobTitle || "Employee",
      completedCourseIds,
      assignedCourseIds,
    },
    availableCourses: catalogItems,
  };

  const provider = new GeminiRecommendationProvider();
  const rawResult = await provider.generateRecommendation(input);

  // 5. Strict Grounding & Validation
  const validCoursesMap = new Map(allCourses.map((c) => [c.id, c]));
  const validCodeMap = new Map(allCourses.map((c) => [(c.courseCode || "").toUpperCase(), c]));
  const completedSet = new Set(completedCourseIds);

  const verifiedList: VerifiedRecommendation[] = [];
  const seenIds = new Set<number>();

  for (const rec of rawResult.recommendedCourses) {
    // 5a. Validate ID / Code against database
    const numId = typeof rec.courseId === "number" ? rec.courseId : (typeof rec.courseId === "string" && /^\d+$/.test(rec.courseId) ? parseInt(rec.courseId, 10) : undefined);
    let matchedCourse = numId !== undefined ? validCoursesMap.get(numId) : undefined;
    if (!matchedCourse && rec.courseCode) {
      const codeClean = (rec.courseCode || "").trim().toUpperCase();
      matchedCourse = validCodeMap.get(codeClean);
    }
    if (!matchedCourse && typeof rec.courseId === "string") {
      const codeClean = rec.courseId.trim().toUpperCase();
      matchedCourse = validCodeMap.get(codeClean);
    }

    // 5b. Reject hallucinated course
    if (!matchedCourse) {
      logger.warn(`AI recommended hallucinated course ID/code (${rec.courseId} / ${rec.courseCode}). Rejecting safely.`);
      continue;
    }

    // 5c. Filter completed course & duplicates
    if (completedSet.has(matchedCourse.id) || seenIds.has(matchedCourse.id)) {
      continue;
    }

    seenIds.add(matchedCourse.id);

    // 5d. Check prerequisites
    const prereqs = prereqMap.get(matchedCourse.id) || [];
    const missing = prereqs.filter((p) => !completedSet.has(p.id));
    const prerequisitesMet = missing.length === 0;

    verifiedList.push({
      courseId: matchedCourse.id,
      courseCode: matchedCourse.courseCode || `ELH-${matchedCourse.id}`,
      title: matchedCourse.title,
      description: matchedCourse.description || "",
      level: matchedCourse.level || "Intermediate",
      durationMinutes: matchedCourse.durationMinutes || 45,
      thumbnailUrl: matchedCourse.thumbnailUrl,
      reason: rec.reason || "Recommended based on employee role and company priorities.",
      priority: rec.priority === "high" || rec.priority === "medium" ? rec.priority : "optional",
      prerequisitesMet,
      missingPrerequisiteTitles: missing.map((m) => m.title),
    });
  }

  return {
    employeeId: emp.id,
    employeeName: emp.name,
    department: emp.department,
    jobTitle: emp.jobTitle,
    companySector: company?.industry || null,
    trainingPriorities: company?.trainingPriorities || [],
    recommendations: verifiedList,
    pathwayReason: rawResult.pathwayReason,
    confidence: rawResult.confidence,
    providerTag: rawResult.providerTag || (process.env.GEMINI_API_KEY ? "gemini" : "fallback"),
    modelUsed: rawResult.providerTag === "gemini" ? "gemini-3.6-flash" : "rule-based-fallback",
    isFallback: rawResult.providerTag === "fallback" || !process.env.GEMINI_API_KEY,
  };
}
