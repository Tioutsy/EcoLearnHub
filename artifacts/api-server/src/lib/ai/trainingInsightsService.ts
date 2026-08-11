import { CompanyAccess, HttpError } from "../access";
import { db } from "@workspace/db";
import {
  companiesTable,
  employeesTable,
  courseAssignmentsTable,
  enrollmentsTable,
  quizAttemptsTable,
  coursesTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { logger } from "../logger";

export type AttentionPriority = "high" | "medium";

export interface AttentionItem {
  id: string;
  priority: AttentionPriority;
  title: string;
  explanation: string;
  recommendedAction: string;
  actionType: "remind_overdue" | "view_course_performance" | "manage_assignments" | "learner_checkin";
  targetUrl: string;
}

export interface PositiveSignal {
  id: string;
  title: string;
  explanation: string;
}

export interface RecommendedNextAction {
  title: string;
  description: string;
  actionLabel: string;
  actionUrl: string;
}

export interface CoursePerformanceSummary {
  courseId: number;
  courseCode: string;
  title: string;
  assignedCount: number;
  startedCount: number;
  completedCount: number;
  completionRatePct: number;
  avgQuizScore: number;
  failureRatePct: number;
  avgQuizAttempts: number;
  overdueAssignmentsCount: number;
}

export interface DepartmentPerformanceSummary {
  departmentName: string;
  employeeCount: number;
  completionRatePct: number;
  overdueCount: number;
  avgQuizScore: number;
  hasSufficientSample: boolean;
}

export interface LearnerRiskSummary {
  overdueCount: number;
  assignedNotStartedCount: number;
  inactiveInProgressCount: number;
  repeatQuizFailuresCount: number;
  consistentlyLowQuizScoresCount: number;
}

export interface OrganisationTrainingSummary {
  totalActiveLearners: number;
  assignedLearnersCount: number;
  completedLearnersCount: number;
  inProgressLearnersCount: number;
  notStartedLearnersCount: number;
  overdueLearnersCount: number;
  overallCompletionPct: number;
}

export interface CompanyTrainingInsights {
  companyId: number;
  companyName: string;
  generatedAt: string;
  providerTag: "gemini" | "fallback";
  isFallback: boolean;

  // Narrative and Priorities
  summary: string;
  needsAttention: AttentionItem[];
  positiveSignals: PositiveSignal[];
  recommendedNextAction: RecommendedNextAction;

  // Deterministic Metrics Data
  organisationSummary: OrganisationTrainingSummary;
  coursePerformance: CoursePerformanceSummary[];
  departmentPerformance: DepartmentPerformanceSummary[];
  learnerRiskSummary: LearnerRiskSummary;

  dataQuality: {
    warnings: string[];
    hasSufficientData: boolean;
  };
}

// In-memory cache for 15 minutes per company
const insightsCache = new Map<number, { data: CompanyTrainingInsights; timestamp: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000;

/**
 * Calculates deterministic platform training metrics directly from real database tables.
 */
export async function calculateDeterministicTrainingMetrics(companyId: number): Promise<{
  companyName: string;
  organisationSummary: OrganisationTrainingSummary;
  coursePerformance: CoursePerformanceSummary[];
  departmentPerformance: DepartmentPerformanceSummary[];
  learnerRiskSummary: LearnerRiskSummary;
  warnings: string[];
}> {
  const warnings: string[] = [];

  // Fetch company
  const [company] = await db
    .select({ id: companiesTable.id, name: companiesTable.name })
    .from(companiesTable)
    .where(eq(companiesTable.id, companyId))
    .limit(1);

  const companyName = company?.name || "Your Organisation";

  // Fetch active employees
  const employees = await db
    .select()
    .from(employeesTable)
    .where(and(eq(employeesTable.companyId, companyId), eq(employeesTable.status, "active")));

  const activeEmployeeIds = new Set(employees.map((e) => e.id));
  const totalActiveLearners = employees.length;

  if (totalActiveLearners === 0) {
    warnings.push("No active employees found in organisation.");
  }

  // Fetch all assignments and enrollments for this company
  const assignments = await db
    .select()
    .from(courseAssignmentsTable)
    .where(eq(courseAssignmentsTable.companyId, companyId));

  const enrollments = await db
    .select()
    .from(enrollmentsTable)
    .where(eq(enrollmentsTable.companyId, companyId));

  // Fetch catalog courses
  const catalog = await db.select().from(coursesTable);
  const coursesMap = new Map(catalog.map((c) => [c.id, c]));

  // Filter scoped to active employees
  const scopedAssignments = assignments.filter((a) => activeEmployeeIds.has(a.employeeId));
  const scopedEnrollments = enrollments.filter((e) => e.employeeId && activeEmployeeIds.has(e.employeeId));

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Group stats by employee
  const employeeAssignedMap = new Map<number, number>();
  const employeeCompletedMap = new Map<number, number>();
  const employeeOverdueMap = new Map<number, number>();

  let totalAssignedEntries = 0;
  let totalCompletedEntries = 0;
  let totalOverdueEntries = 0;
  let totalNotStartedEntries = 0;
  let totalInProgressEntries = 0;
  let totalInactiveInProgressEntries = 0;

  for (const enr of scopedEnrollments) {
    const isCompleted = enr.status === "completed" || !!enr.completedAt;
    const isOverdue = enr.dueDate ? new Date(enr.dueDate) < now && !isCompleted : false;

    totalAssignedEntries++;
    if (isCompleted) {
      totalCompletedEntries++;
      if (enr.employeeId) {
        employeeCompletedMap.set(enr.employeeId, (employeeCompletedMap.get(enr.employeeId) || 0) + 1);
      }
    } else if (enr.progressPct > 0) {
      totalInProgressEntries++;
      if (enr.updatedAt && new Date(enr.updatedAt) < sevenDaysAgo) {
        totalInactiveInProgressEntries++;
      }
      if (isOverdue) totalOverdueEntries++;
    } else {
      totalNotStartedEntries++;
      if (isOverdue) totalOverdueEntries++;
    }

    if (enr.employeeId) {
      employeeAssignedMap.set(enr.employeeId, (employeeAssignedMap.get(enr.employeeId) || 0) + 1);
      if (isOverdue) {
        employeeOverdueMap.set(enr.employeeId, (employeeOverdueMap.get(enr.employeeId) || 0) + 1);
      }
    }
  }

  // Count unstarted assignments without existing enrollment record
  for (const asgn of scopedAssignments) {
    const hasEnrollment = scopedEnrollments.some(
      (e) => e.employeeId === asgn.employeeId && e.courseId === asgn.courseId
    );
    if (!hasEnrollment) {
      totalAssignedEntries++;
      totalNotStartedEntries++;
      const isOverdue = asgn.dueDate ? new Date(asgn.dueDate) < now && !asgn.completedAt : false;
      if (isOverdue) totalOverdueEntries++;

      employeeAssignedMap.set(asgn.employeeId, (employeeAssignedMap.get(asgn.employeeId) || 0) + 1);
      if (isOverdue) {
        employeeOverdueMap.set(asgn.employeeId, (employeeOverdueMap.get(asgn.employeeId) || 0) + 1);
      }
    }
  }

  const assignedLearnersCount = Array.from(employeeAssignedMap.keys()).length;
  const completedLearnersCount = Array.from(employeeCompletedMap.keys()).length;
  const inProgressLearnersCount = Math.max(0, assignedLearnersCount - completedLearnersCount);
  const notStartedLearnersCount = employees.filter(
    (e) => !employeeCompletedMap.get(e.id) && (employeeAssignedMap.get(e.id) || 0) > 0
  ).length;
  const overdueLearnersCount = Array.from(employeeOverdueMap.keys()).length;

  const overallCompletionPct =
    totalAssignedEntries > 0 ? Math.round((totalCompletedEntries / totalAssignedEntries) * 100) : 0;

  const organisationSummary: OrganisationTrainingSummary = {
    totalActiveLearners,
    assignedLearnersCount,
    completedLearnersCount,
    inProgressLearnersCount,
    notStartedLearnersCount,
    overdueLearnersCount,
    overallCompletionPct,
  };

  // Fetch Quiz Attempts (all, then scope by active employee userId)
  const quizAttempts = await db.select().from(quizAttemptsTable);
  const activeEmpIdsStr = new Set(employees.map((e) => String(e.id)));

  const scopedAttempts = quizAttempts.filter((att) => att.userId && activeEmpIdsStr.has(String(att.userId)));

  // Calculate repeat quiz failures & low scores
  const userCourseAttemptsMap = new Map<string, { attempts: number; passed: boolean; maxScore: number }>();
  for (const att of scopedAttempts) {
    const key = `${att.userId}_${att.courseId}`;
    const existing = userCourseAttemptsMap.get(key) || { attempts: 0, passed: false, maxScore: 0 };
    existing.attempts += 1;
    if (att.passed) existing.passed = true;
    if ((att.score || 0) > existing.maxScore) existing.maxScore = att.score || 0;
    userCourseAttemptsMap.set(key, existing);
  }

  let repeatQuizFailuresCount = 0;
  let consistentlyLowQuizScoresCount = 0;

  for (const [_, stats] of userCourseAttemptsMap.entries()) {
    if (stats.attempts >= 2 && !stats.passed) {
      repeatQuizFailuresCount++;
    }
    if (stats.attempts >= 2 && stats.maxScore < 60) {
      consistentlyLowQuizScoresCount++;
    }
  }

  const learnerRiskSummary: LearnerRiskSummary = {
    overdueCount: totalOverdueEntries,
    assignedNotStartedCount: totalNotStartedEntries,
    inactiveInProgressCount: totalInactiveInProgressEntries,
    repeatQuizFailuresCount,
    consistentlyLowQuizScoresCount,
  };

  // Course Performance Summary
  const courseAssignedStats = new Map<
    number,
    {
      assignedCount: number;
      startedCount: number;
      completedCount: number;
      overdueCount: number;
    }
  >();

  for (const enr of scopedEnrollments) {
    const cId = enr.courseId;
    const existing = courseAssignedStats.get(cId) || {
      assignedCount: 0,
      startedCount: 0,
      completedCount: 0,
      overdueCount: 0,
    };
    existing.assignedCount++;
    if (enr.progressPct > 0 || enr.status === "completed") existing.startedCount++;
    if (enr.status === "completed" || enr.completedAt) existing.completedCount++;
    if (enr.dueDate && new Date(enr.dueDate) < now && enr.status !== "completed" && !enr.completedAt) {
      existing.overdueCount++;
    }
    courseAssignedStats.set(cId, existing);
  }

  for (const asgn of scopedAssignments) {
    const cId = asgn.courseId;
    const hasEnr = scopedEnrollments.some((e) => e.employeeId === asgn.employeeId && e.courseId === cId);
    if (!hasEnr) {
      const existing = courseAssignedStats.get(cId) || {
        assignedCount: 0,
        startedCount: 0,
        completedCount: 0,
        overdueCount: 0,
      };
      existing.assignedCount++;
      if (asgn.dueDate && new Date(asgn.dueDate) < now && !asgn.completedAt) {
        existing.overdueCount++;
      }
      courseAssignedStats.set(cId, existing);
    }
  }

  const coursePerformance: CoursePerformanceSummary[] = [];
  for (const [cId, stats] of courseAssignedStats.entries()) {
    const courseObj = coursesMap.get(cId);
    if (!courseObj) continue;

    const courseAttempts = scopedAttempts.filter((a) => a.courseId === cId);
    const totalAttempts = courseAttempts.length;
    const passedAttempts = courseAttempts.filter((a) => a.passed).length;
    const avgScore = totalAttempts > 0 ? Math.round(courseAttempts.reduce((acc, a) => acc + (a.score || 0), 0) / totalAttempts) : 0;
    const failureRatePct = totalAttempts > 0 ? Math.round(((totalAttempts - passedAttempts) / totalAttempts) * 100) : 0;
    const uniqueUsersAttempted = new Set(courseAttempts.map((a) => a.userId)).size;
    const avgAttempts = uniqueUsersAttempted > 0 ? Math.round((totalAttempts / uniqueUsersAttempted) * 10) / 10 : 1;

    const completionRatePct = stats.assignedCount > 0 ? Math.round((stats.completedCount / stats.assignedCount) * 100) : 0;

    coursePerformance.push({
      courseId: cId,
      courseCode: courseObj.courseCode || `COURSE-${cId}`,
      title: courseObj.title,
      assignedCount: stats.assignedCount,
      startedCount: stats.startedCount,
      completedCount: stats.completedCount,
      completionRatePct,
      avgQuizScore: avgScore,
      failureRatePct,
      avgQuizAttempts: avgAttempts,
      overdueAssignmentsCount: stats.overdueCount,
    });
  }

  // Sort course performance by urgency (overdue + failure rate)
  coursePerformance.sort((a, b) => b.overdueAssignmentsCount + b.failureRatePct - (a.overdueAssignmentsCount + a.failureRatePct));

  // Department Performance Summary
  const deptEmployeesMap = new Map<string, number[]>();
  for (const emp of employees) {
    const dept = emp.department ? emp.department.trim() : "Unassigned";
    const list = deptEmployeesMap.get(dept) || [];
    list.push(emp.id);
    deptEmployeesMap.set(dept, list);
  }

  const departmentPerformance: DepartmentPerformanceSummary[] = [];

  for (const [deptName, empIds] of deptEmployeesMap.entries()) {
    const empIdSet = new Set(empIds);
    const deptEnrollments = scopedEnrollments.filter((e) => e.employeeId && empIdSet.has(e.employeeId));
    const deptAssignments = scopedAssignments.filter((a) => empIdSet.has(a.employeeId));

    let deptTotalAssigned = deptEnrollments.length;
    let deptCompleted = deptEnrollments.filter((e) => e.status === "completed" || e.completedAt).length;
    let deptOverdue = deptEnrollments.filter((e) => e.dueDate && new Date(e.dueDate) < now && e.status !== "completed").length;

    for (const asgn of deptAssignments) {
      const hasEnr = deptEnrollments.some((e) => e.employeeId === asgn.employeeId && e.courseId === asgn.courseId);
      if (!hasEnr) {
        deptTotalAssigned++;
        if (asgn.dueDate && new Date(asgn.dueDate) < now && !asgn.completedAt) {
          deptOverdue++;
        }
      }
    }

    const deptAttempts = scopedAttempts.filter((a) => a.userId && empIdSet.has(Number(a.userId)));
    const deptAvgScore = deptAttempts.length > 0 ? Math.round(deptAttempts.reduce((acc, a) => acc + (a.score || 0), 0) / deptAttempts.length) : 0;
    const deptCompletionPct = deptTotalAssigned > 0 ? Math.round((deptCompleted / deptTotalAssigned) * 100) : 0;

    departmentPerformance.push({
      departmentName: deptName,
      employeeCount: empIds.length,
      completionRatePct: deptCompletionPct,
      overdueCount: deptOverdue,
      avgQuizScore: deptAvgScore,
      hasSufficientSample: empIds.length >= 2,
    });
  }

  departmentPerformance.sort((a, b) => b.overdueCount - a.overdueCount);

  return {
    companyName,
    organisationSummary,
    coursePerformance,
    departmentPerformance,
    learnerRiskSummary,
    warnings,
  };
}

/**
 * Deterministically generates prioritised attention items, positive signals, and recommended next action.
 * Pure function — no DB calls, no Gemini calls. Safe to unit test directly.
 */
export function prioritiseTrainingInsights(metrics: {
  companyName: string;
  organisationSummary: OrganisationTrainingSummary;
  coursePerformance: CoursePerformanceSummary[];
  departmentPerformance: DepartmentPerformanceSummary[];
  learnerRiskSummary: LearnerRiskSummary;
}): {
  summary: string;
  needsAttention: AttentionItem[];
  positiveSignals: PositiveSignal[];
  recommendedNextAction: RecommendedNextAction;
} {
  const { organisationSummary, coursePerformance, departmentPerformance, learnerRiskSummary, companyName } = metrics;
  const needsAttention: AttentionItem[] = [];
  const positiveSignals: PositiveSignal[] = [];

  // Rule 1: Overdue Training Assignments
  if (organisationSummary.overdueLearnersCount > 0 || learnerRiskSummary.overdueCount > 0) {
    needsAttention.push({
      id: "att-overdue",
      priority: "high",
      title: "Overdue Training Assignments",
      explanation: `${organisationSummary.overdueLearnersCount} employee(s) currently have ${learnerRiskSummary.overdueCount} overdue course assignment(s) requiring management attention.`,
      recommendedAction: "Send automated reminders or review completion deadlines with department managers.",
      actionType: "remind_overdue",
      targetUrl: "/company/compliance",
    });
  }

  // Rule 2: Course Failure Rates or Low Completion
  const strugglingCourse = coursePerformance.find((c) => c.failureRatePct >= 25 || (c.assignedCount >= 2 && c.completionRatePct < 40));
  if (strugglingCourse) {
    needsAttention.push({
      id: `att-course-${strugglingCourse.courseId}`,
      priority: "high",
      title: `${strugglingCourse.courseCode} Low Completion / High Failure Rate`,
      explanation: `Course ${strugglingCourse.courseCode} (${strugglingCourse.title}) has a completion rate of ${strugglingCourse.completionRatePct}% and quiz failure rate of ${strugglingCourse.failureRatePct}%.`,
      recommendedAction: "Review course content guidance or check in with learners attempting this module.",
      actionType: "view_course_performance",
      targetUrl: "/courses",
    });
  }

  // Rule 3: Multiple Quiz Retries
  if (learnerRiskSummary.repeatQuizFailuresCount > 0) {
    needsAttention.push({
      id: "att-quiz-retries",
      priority: "medium",
      title: "Multiple Quiz Retries Detected",
      explanation: `${learnerRiskSummary.repeatQuizFailuresCount} learner/course pair(s) show 2 or more failed quiz attempts without achieving a pass.`,
      recommendedAction: "Offer targeted manager support or review supplementary training materials.",
      actionType: "learner_checkin",
      targetUrl: "/company/employees",
    });
  }

  // Rule 4: Assigned Training Not Started
  if (learnerRiskSummary.assignedNotStartedCount > 3 || (organisationSummary.assignedLearnersCount > 0 && learnerRiskSummary.assignedNotStartedCount / organisationSummary.assignedLearnersCount >= 0.3)) {
    needsAttention.push({
      id: "att-unstarted",
      priority: "medium",
      title: "Assigned Courses Not Started",
      explanation: `${learnerRiskSummary.assignedNotStartedCount} assigned course enrollment(s) have not been started by learners yet.`,
      recommendedAction: "Issue a welcome broadcast or assign completion deadlines to encourage initial login.",
      actionType: "manage_assignments",
      targetUrl: "/company/assignments",
    });
  }

  // Rule 5: Department Inequity
  const laggingDept = departmentPerformance.find((d) => d.hasSufficientSample && d.overdueCount >= 2);
  if (laggingDept && !needsAttention.some((a) => a.id === "att-dept")) {
    needsAttention.push({
      id: "att-dept",
      priority: "medium",
      title: `Department Lagging: ${laggingDept.departmentName}`,
      explanation: `Department ${laggingDept.departmentName} has ${laggingDept.overdueCount} overdue assignment(s) and completion rate of ${laggingDept.completionRatePct}%.`,
      recommendedAction: `Coordinate with ${laggingDept.departmentName} manager to address learning bottlenecks.`,
      actionType: "remind_overdue",
      targetUrl: "/company/compliance",
    });
  }

  // Positive Signal 1: High Overall Completion
  if (organisationSummary.overallCompletionPct >= 70) {
    positiveSignals.push({
      id: "pos-completion",
      title: "Strong Overall Completion Rate",
      explanation: `${companyName} maintains a ${organisationSummary.overallCompletionPct}% overall completion rate across assigned learning modules.`,
    });
  }

  // Positive Signal 2: Zero Overdue
  if (organisationSummary.overdueLearnersCount === 0 && organisationSummary.assignedLearnersCount > 0) {
    positiveSignals.push({
      id: "pos-overdue",
      title: "Zero Overdue Assignments",
      explanation: "All assigned employees are fully up-to-date with their learning deadlines.",
    });
  }

  // Positive Signal 3: Strong Quiz Pass Rate
  const topCourse = coursePerformance.find((c) => c.assignedCount >= 2 && c.completionRatePct >= 80 && c.avgQuizScore >= 80);
  if (topCourse) {
    positiveSignals.push({
      id: `pos-course-${topCourse.courseId}`,
      title: `High Achievement in ${topCourse.courseCode}`,
      explanation: `${topCourse.courseCode} (${topCourse.title}) achieved an ${topCourse.completionRatePct}% completion rate with average quiz score of ${topCourse.avgQuizScore}%.`,
    });
  }

  // Fallback default positive signal if empty
  if (positiveSignals.length === 0) {
    positiveSignals.push({
      id: "pos-default",
      title: "Active Learning Engagement",
      explanation: `${organisationSummary.completedLearnersCount} of ${organisationSummary.totalActiveLearners} active employees have completed at least one training module.`,
    });
  }

  // Determine Primary Recommended Next Action
  let recommendedNextAction: RecommendedNextAction;

  if (organisationSummary.overdueLearnersCount > 0) {
    recommendedNextAction = {
      title: "Follow Up with Overdue Learners",
      description: `Prioritise messaging the ${organisationSummary.overdueLearnersCount} employee(s) with overdue training assignments to restore compliance.`,
      actionLabel: "View Overdue Employees",
      actionUrl: "/company/compliance",
    };
  } else if (strugglingCourse) {
    recommendedNextAction = {
      title: `Review ${strugglingCourse.courseCode} Course Performance`,
      description: `Course ${strugglingCourse.courseCode} shows a ${strugglingCourse.failureRatePct}% failure rate. Review quiz performance details.`,
      actionLabel: "View Course Performance",
      actionUrl: "/courses",
    };
  } else if (learnerRiskSummary.assignedNotStartedCount > 0) {
    recommendedNextAction = {
      title: "Kickstart Unstarted Enrollments",
      description: `Encourage the ${learnerRiskSummary.assignedNotStartedCount} unstarted learner enrollment(s) to begin their assigned sustainability paths.`,
      actionLabel: "Manage Course Assignments",
      actionUrl: "/company/assignments",
    };
  } else {
    recommendedNextAction = {
      title: "Expand Role-Based Sustainability Paths",
      description: "Learning performance is on track. Consider assigning advanced ESG courses to broaden organizational sustainability capabilities.",
      actionLabel: "Assign Additional Courses",
      actionUrl: "/company/assignments",
    };
  }

  // Generate Concise Summary
  let summary = `${companyName} has an overall training completion rate of ${organisationSummary.overallCompletionPct}% across ${organisationSummary.totalActiveLearners} active employees.`;
  if (needsAttention.length > 0) {
    summary += ` ${needsAttention.length} area(s) require management attention, led by ${needsAttention[0].title.toLowerCase()}.`;
  } else {
    summary += ` Training progress is healthy with no critical compliance bottlenecks identified.`;
  }

  return {
    summary,
    needsAttention: needsAttention.slice(0, 5),
    positiveSignals: positiveSignals.slice(0, 3),
    recommendedNextAction,
  };
}

/**
 * Calls Gemini via native fetch to enhance insights narrative.
 * Matches the pattern used in askElevioProvider.ts — no @google/genai SDK needed.
 * Always falls back gracefully if Gemini is unavailable.
 */
async function callGeminiForInsights(
  metrics: {
    companyName: string;
    organisationSummary: OrganisationTrainingSummary;
    coursePerformance: CoursePerformanceSummary[];
    departmentPerformance: DepartmentPerformanceSummary[];
    learnerRiskSummary: LearnerRiskSummary;
  },
  deterministicPriorities: {
    summary: string;
    needsAttention: AttentionItem[];
    positiveSignals: PositiveSignal[];
    recommendedNextAction: RecommendedNextAction;
  },
  apiKey: string
): Promise<{
  summary: string;
  needsAttention: AttentionItem[];
  positiveSignals: PositiveSignal[];
  recommendedNextAction: RecommendedNextAction;
} | null> {
  const promptPayload = {
    companyName: metrics.companyName,
    organisationSummary: metrics.organisationSummary,
    learnerRiskSummary: metrics.learnerRiskSummary,
    topStrugglingCourses: metrics.coursePerformance.slice(0, 3),
    departmentSummaries: metrics.departmentPerformance.slice(0, 3),
    deterministicAttentionItems: deterministicPriorities.needsAttention,
    deterministicPositiveSignals: deterministicPriorities.positiveSignals,
    deterministicRecommendedAction: deterministicPriorities.recommendedNextAction,
  };

  const systemInstruction = `You are ELEVIO SKILLS AI Training Insights Engine.
Your task is to interpret company training metrics for company administrators and HR/ESG managers.

STRICT INSTRUCTIONS:
1. GROUNDED IN METRICS: Rely strictly on the supplied metrics JSON. Do not invent employee names, missing departments, or unmeasured stats.
2. CONCISE & OBJECTIVE: Provide clear, professional management explanations without promotional fluff.
3. MINIMISE PII: Refer strictly to aggregated counts, department names, and course codes (e.g., ELH-01).
4. OUTPUT FORMAT: Respond ONLY with valid JSON matching the exact specified schema.`;

  const prompt = `${systemInstruction}

Analyze these organization training metrics and refine the insights:
${JSON.stringify(promptPayload, null, 2)}

Respond with JSON in this exact format:
{
  "summary": "Executive 2-sentence summary of training health",
  "needsAttention": [
    {
      "id": "string",
      "priority": "high" | "medium",
      "title": "string",
      "explanation": "string",
      "recommendedAction": "string",
      "actionType": "remind_overdue" | "view_course_performance" | "manage_assignments" | "learner_checkin",
      "targetUrl": "string"
    }
  ],
  "positiveSignals": [
    { "id": "string", "title": "string", "explanation": "string" }
  ],
  "recommendedNextAction": {
    "title": "string",
    "description": "string",
    "actionLabel": "string",
    "actionUrl": "string"
  }
}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      logger.warn({ status: response.status }, "Gemini training-insights API error — using deterministic fallback.");
      return null;
    }

    const resJson = (await response.json()) as any;
    const rawText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      logger.warn("Empty Gemini training-insights response — using deterministic fallback.");
      return null;
    }

    const parsed = JSON.parse(rawText);
    if (!parsed || typeof parsed.summary !== "string") {
      logger.warn("Invalid JSON schema from Gemini training-insights — using deterministic fallback.");
      return null;
    }

    logger.info({ model: "gemini-2.5-flash" }, "Gemini training-insights response received.");
    return {
      summary: parsed.summary || deterministicPriorities.summary,
      needsAttention: Array.isArray(parsed.needsAttention) && parsed.needsAttention.length > 0
        ? parsed.needsAttention
        : deterministicPriorities.needsAttention,
      positiveSignals: Array.isArray(parsed.positiveSignals) && parsed.positiveSignals.length > 0
        ? parsed.positiveSignals
        : deterministicPriorities.positiveSignals,
      recommendedNextAction: parsed.recommendedNextAction || deterministicPriorities.recommendedNextAction,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    logger.warn({ err: err?.message }, "Gemini training-insights call failed or timed out — using deterministic fallback.");
    return null;
  }
}

/**
 * Main Service Handler for AI Training Insights.
 * Executes deterministic data gathering, priority calculation, and optional Gemini narrative enhancement.
 * Requires manager or admin role (enforced in route handler).
 */
export async function getCompanyTrainingInsights(
  access: CompanyAccess,
  forceRefresh: boolean = false
): Promise<CompanyTrainingInsights> {
  const companyId = access.companyId;

  // Check cache
  if (!forceRefresh && insightsCache.has(companyId)) {
    const cached = insightsCache.get(companyId)!;
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  // Step 1: Compute Deterministic Metrics
  const metrics = await calculateDeterministicTrainingMetrics(companyId);

  // Step 2: Compute Deterministic Priorities
  const deterministicPriorities = prioritiseTrainingInsights(metrics);

  const fallbackResult: CompanyTrainingInsights = {
    companyId,
    companyName: metrics.companyName,
    generatedAt: new Date().toISOString(),
    providerTag: "fallback",
    isFallback: true,
    summary: deterministicPriorities.summary,
    needsAttention: deterministicPriorities.needsAttention,
    positiveSignals: deterministicPriorities.positiveSignals,
    recommendedNextAction: deterministicPriorities.recommendedNextAction,
    organisationSummary: metrics.organisationSummary,
    coursePerformance: metrics.coursePerformance,
    departmentPerformance: metrics.departmentPerformance,
    learnerRiskSummary: metrics.learnerRiskSummary,
    dataQuality: {
      warnings: metrics.warnings,
      hasSufficientData: metrics.organisationSummary.totalActiveLearners > 0,
    },
  };

  // Step 3: Check for GEMINI_API_KEY (server-side only)
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    insightsCache.set(companyId, { data: fallbackResult, timestamp: Date.now() });
    return fallbackResult;
  }

  // Step 4: Call Gemini for AI Narrative Interpretation (graceful fallback)
  const geminiResult = await callGeminiForInsights(metrics, deterministicPriorities, apiKey);

  if (!geminiResult) {
    insightsCache.set(companyId, { data: fallbackResult, timestamp: Date.now() });
    return fallbackResult;
  }

  const finalResult: CompanyTrainingInsights = {
    companyId,
    companyName: metrics.companyName,
    generatedAt: new Date().toISOString(),
    providerTag: "gemini",
    isFallback: false,
    summary: geminiResult.summary,
    needsAttention: geminiResult.needsAttention,
    positiveSignals: geminiResult.positiveSignals,
    recommendedNextAction: geminiResult.recommendedNextAction,
    organisationSummary: metrics.organisationSummary,
    coursePerformance: metrics.coursePerformance,
    departmentPerformance: metrics.departmentPerformance,
    learnerRiskSummary: metrics.learnerRiskSummary,
    dataQuality: {
      warnings: metrics.warnings,
      hasSufficientData: metrics.organisationSummary.totalActiveLearners > 0,
    },
  };

  insightsCache.set(companyId, { data: finalResult, timestamp: Date.now() });
  return finalResult;
}
