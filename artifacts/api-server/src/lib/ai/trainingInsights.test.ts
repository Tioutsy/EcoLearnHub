import assert from "node:assert";
import { test } from "node:test";
import {
  prioritiseTrainingInsights,
  OrganisationTrainingSummary,
  CoursePerformanceSummary,
  DepartmentPerformanceSummary,
  LearnerRiskSummary,
} from "./trainingInsightsService";

// Ensure no real network Gemini calls during unit testing
process.env.GEMINI_API_KEY = "";

test("Prioritization Engine — High Priority Overdue Training", () => {
  const organisationSummary: OrganisationTrainingSummary = {
    totalActiveLearners: 25,
    assignedLearnersCount: 20,
    completedLearnersCount: 10,
    inProgressLearnersCount: 5,
    notStartedLearnersCount: 5,
    overdueLearnersCount: 4,
    overallCompletionPct: 50,
  };

  const coursePerformance: CoursePerformanceSummary[] = [
    {
      courseId: 1,
      courseCode: "ELH-01",
      title: "Sustainability Foundations",
      assignedCount: 15,
      startedCount: 12,
      completedCount: 10,
      completionRatePct: 67,
      avgQuizScore: 82,
      failureRatePct: 10,
      avgQuizAttempts: 1.1,
      overdueAssignmentsCount: 2,
    },
  ];

  const departmentPerformance: DepartmentPerformanceSummary[] = [
    {
      departmentName: "Operations",
      employeeCount: 10,
      completionRatePct: 40,
      overdueCount: 3,
      avgQuizScore: 70,
      hasSufficientSample: true,
    },
  ];

  const learnerRiskSummary: LearnerRiskSummary = {
    overdueCount: 4,
    assignedNotStartedCount: 5,
    inactiveInProgressCount: 2,
    repeatQuizFailuresCount: 1,
    consistentlyLowQuizScoresCount: 0,
  };

  const result = prioritiseTrainingInsights({
    companyName: "Test Hotel",
    organisationSummary,
    coursePerformance,
    departmentPerformance,
    learnerRiskSummary,
  });

  assert.ok(result.summary.includes("Test Hotel"));
  assert.ok(result.needsAttention.length > 0);

  const overdueItem = result.needsAttention.find((i) => i.id === "att-overdue");
  assert.ok(overdueItem, "Should generate overdue training attention item");
  assert.strictEqual(overdueItem?.priority, "high");
  assert.strictEqual(overdueItem?.actionType, "remind_overdue");
  assert.strictEqual(overdueItem?.targetUrl, "/company/compliance");

  assert.strictEqual(
    result.recommendedNextAction.actionLabel,
    "View Overdue Employees"
  );
});

test("Prioritization Engine — High Course Failure Rate Trigger", () => {
  const organisationSummary: OrganisationTrainingSummary = {
    totalActiveLearners: 15,
    assignedLearnersCount: 15,
    completedLearnersCount: 12,
    inProgressLearnersCount: 3,
    notStartedLearnersCount: 0,
    overdueLearnersCount: 0,
    overallCompletionPct: 80,
  };

  const coursePerformance: CoursePerformanceSummary[] = [
    {
      courseId: 9,
      courseCode: "ELH-09",
      title: "Advanced Waste Circularity",
      assignedCount: 10,
      startedCount: 8,
      completedCount: 3,
      completionRatePct: 30,
      avgQuizScore: 52,
      failureRatePct: 45,
      avgQuizAttempts: 2.8,
      overdueAssignmentsCount: 0,
    },
  ];

  const departmentPerformance: DepartmentPerformanceSummary[] = [];

  const learnerRiskSummary: LearnerRiskSummary = {
    overdueCount: 0,
    assignedNotStartedCount: 0,
    inactiveInProgressCount: 0,
    repeatQuizFailuresCount: 3,
    consistentlyLowQuizScoresCount: 2,
  };

  const result = prioritiseTrainingInsights({
    companyName: "EcoResort",
    organisationSummary,
    coursePerformance,
    departmentPerformance,
    learnerRiskSummary,
  });

  const courseItem = result.needsAttention.find((i) => i.id === "att-course-9");
  assert.ok(courseItem, "Should identify ELH-09 as a high failure rate course");
  assert.strictEqual(courseItem?.priority, "high");
  assert.strictEqual(courseItem?.actionType, "view_course_performance");
  assert.strictEqual(courseItem?.targetUrl, "/courses");
});

test("Prioritization Engine — Positive Signals & Healthy Status", () => {
  const organisationSummary: OrganisationTrainingSummary = {
    totalActiveLearners: 50,
    assignedLearnersCount: 50,
    completedLearnersCount: 45,
    inProgressLearnersCount: 5,
    notStartedLearnersCount: 0,
    overdueLearnersCount: 0,
    overallCompletionPct: 90,
  };

  const coursePerformance: CoursePerformanceSummary[] = [
    {
      courseId: 1,
      courseCode: "ELH-01",
      title: "Sustainability Foundations",
      assignedCount: 50,
      startedCount: 50,
      completedCount: 45,
      completionRatePct: 90,
      avgQuizScore: 88,
      failureRatePct: 2,
      avgQuizAttempts: 1.0,
      overdueAssignmentsCount: 0,
    },
  ];

  const departmentPerformance: DepartmentPerformanceSummary[] = [];

  const learnerRiskSummary: LearnerRiskSummary = {
    overdueCount: 0,
    assignedNotStartedCount: 0,
    inactiveInProgressCount: 0,
    repeatQuizFailuresCount: 0,
    consistentlyLowQuizScoresCount: 0,
  };

  const result = prioritiseTrainingInsights({
    companyName: "Green Hotel",
    organisationSummary,
    coursePerformance,
    departmentPerformance,
    learnerRiskSummary,
  });

  assert.strictEqual(result.needsAttention.length, 0);
  assert.ok(result.positiveSignals.length >= 2);
  const completionSignal = result.positiveSignals.find((s) => s.id === "pos-completion");
  assert.ok(completionSignal, "Should report strong completion rate signal");
  const overdueSignal = result.positiveSignals.find((s) => s.id === "pos-overdue");
  assert.ok(overdueSignal, "Should report zero overdue signal");
});
