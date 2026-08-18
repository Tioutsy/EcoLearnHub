import { useMutation, useQuery } from "@tanstack/react-query";

export type AssignmentStatus = "not_started" | "in_progress" | "completed" | "overdue";
export type EmployeeTrainingStatus = "not_started" | "in_progress" | "completed";

export interface TrainingReportRow {
  assignmentId: number;
  employeeId: number;
  employeeName: string;
  email: string;
  department: string | null;
  jobTitle: string | null;
  courseId: number;
  courseTitle: string;
  assignedAt: string;
  dueDate: string | null;
  completedAt: string | null;
  progressPct: number;
  status: AssignmentStatus;
  certificateId: number | null;
  certificateCode: string | null;
  certificateIssuedAt: string | null;
  lastAccessedAt: string | null;
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

export interface CompanyLmsOverview {
  companyName: string;
  stats: {
    totalEmployees: number;
    activeLearners: number;
    coursesAssigned: number;
    coursesCompleted: number;
    averageCompletionRate: number;
    certificatesEarned: number;
  };
  employeeTraining: EmployeeTrainingSummary[];
  actionNeeded: TrainingReportRow[];
}

export interface AssignCompanyCoursesInput {
  courseIds: number[];
  employeeIds?: number[];
  department?: string;
  dueDate?: string;
}

export interface AssignCompanyCoursesResult {
  assigned: number;
  updated?: number;
  skipped: number;
}

export interface EmployeeInvitation {
  employeeId: number;
  email: string;
  invitationLink: string;
  emailSent: boolean;
  message: string;
}

export interface TrainingReportParams {
  employeeId?: number;
  department?: string;
  courseId?: number;
  status?: AssignmentStatus | "all";
}

import { customFetch } from "@workspace/api-client-react";

async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  return customFetch<T>(path, init);
}

function reportQuery(params: TrainingReportParams): string {
  const search = new URLSearchParams();
  if (params.employeeId) search.set("employeeId", String(params.employeeId));
  if (params.department) search.set("department", params.department);
  if (params.courseId) search.set("courseId", String(params.courseId));
  if (params.status && params.status !== "all") search.set("status", params.status);
  const query = search.toString();
  return query ? `?${query}` : "";
}

export function useCompanyLmsOverview() {
  return useQuery({
    queryKey: ["company-lms-overview"],
    queryFn: () => apiJson<CompanyLmsOverview>("/api/company/lms-overview"),
    retry: (failureCount, error: any) => {
      if (error?.message?.includes("404") || error?.message?.includes("403")) return false;
      return failureCount < 2;
    },
  });
}

export function useTrainingReport(params: TrainingReportParams) {
  return useQuery({
    queryKey: ["training-report", params],
    queryFn: () => apiJson<TrainingReportRow[]>(`/api/company/reports/training${reportQuery(params)}`),
  });
}

export function useAssignCompanyCourses() {
  return useMutation({
    mutationFn: (data: AssignCompanyCoursesInput) =>
      apiJson<AssignCompanyCoursesResult>("/api/company/assignments", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}

// ─── Sprint 12: Seat Usage & Employee Invitations ───────────────────────────

export interface SeatUsageData {
  companyId: number;
  companyName: string;
  activeEmployees: number;
  pendingInvitations: number;
  reservedSeats: number;
  maxSeats: number;
  remainingSeats: number;
  subscriptionStatus: string;
  subscriptionPlanCode: string | null;
  subscriptionPlanName: string | null;
  bandCode: string | null;
  bandLabel: string | null;
  canInvite: boolean;
  reason: string | null;
}

export interface CompanyInvitation {
  id: number;
  companyId: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  department: string | null;
  intendedRole: string;
  displayCode: string;
  status: "pending" | "accepted" | "expired" | "revoked";
  expiresAt: string;
  invitationLink?: string;
  rawToken?: string;
  emailSent?: boolean;
  message?: string;
  createdAt: string;
  acceptedAt?: string | null;
}

export function useCompanySeatUsage() {
  return useQuery({
    queryKey: ["company-seat-usage"],
    queryFn: () => apiJson<SeatUsageData>("/api/company/employees/seat-usage"),
  });
}

export function useCompanyEmployeeInvitations() {
  return useQuery({
    queryKey: ["company-employee-invitations"],
    queryFn: () => apiJson<CompanyInvitation[]>("/api/company/employee-invitations"),
  });
}

export function useInviteEmployee() {
  return useMutation({
    mutationFn: (data: {
      email: string;
      firstName?: string;
      lastName?: string;
      department?: string;
      intendedRole?: "employee" | "manager" | "admin";
    }) =>
      apiJson<CompanyInvitation>("/api/company/employee-invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
  });
}

export function useResendEmployeeInvitation() {
  return useMutation({
    mutationFn: (invitationId: number) =>
      apiJson<CompanyInvitation>(`/api/company/employee-invitations/${invitationId}/resend`, {
        method: "POST",
      }),
  });
}

export function useRevokeEmployeeInvitation() {
  return useMutation({
    mutationFn: (invitationId: number) =>
      apiJson<{ id: number; status: string; message: string }>(`/api/company/employee-invitations/${invitationId}/revoke`, {
        method: "POST",
      }),
  });
}

export function useDeactivateEmployee() {
  return useMutation({
    mutationFn: (employeeId: number) =>
      apiJson<{ message: string; employee: any }>(`/api/company/employees/${employeeId}/deactivate`, {
        method: "POST",
      }),
  });
}

export function useReactivateEmployee() {
  return useMutation({
    mutationFn: (employeeId: number) =>
      apiJson<{ message: string; employee: any }>(`/api/company/employees/${employeeId}/reactivate`, {
        method: "POST",
      }),
  });
}

export function useCreateEmployeeInvitation() {
  return useMutation({
    mutationFn: (id: number) =>
      apiJson<EmployeeInvitation>(`/api/company/employees/${id}/invite`, {
        method: "POST",
      }),
  });
}

// ─── Sprint 11A: AI Training Insights ─────────────────────────────────────

export interface TrainingInsightAttentionItem {
  id: string;
  priority: "high" | "medium";
  title: string;
  explanation: string;
  recommendedAction: string;
  actionType: "remind_overdue" | "view_course_performance" | "manage_assignments" | "learner_checkin";
  targetUrl: string;
}

export interface TrainingInsightPositiveSignal {
  id: string;
  title: string;
  explanation: string;
}

export interface TrainingInsightAction {
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

  summary: string;
  needsAttention: TrainingInsightAttentionItem[];
  positiveSignals: TrainingInsightPositiveSignal[];
  recommendedNextAction: TrainingInsightAction;

  organisationSummary: OrganisationTrainingSummary;
  coursePerformance: CoursePerformanceSummary[];
  departmentPerformance: DepartmentPerformanceSummary[];
  learnerRiskSummary: LearnerRiskSummary;

  dataQuality: {
    warnings: string[];
    hasSufficientData: boolean;
  };
}

export function useCompanyTrainingInsights(forceRefresh: boolean = false) {
  return useQuery({
    queryKey: ["company-training-insights", forceRefresh],
    queryFn: () => apiJson<CompanyTrainingInsights>(`/api/company/training-insights${forceRefresh ? "?refresh=true" : ""}`),
    retry: (failureCount, error: any) => {
      if (error?.message?.includes("403")) return false;
      return failureCount < 2;
    },
  });
}

// ─── Sprint 11B: Management Action Hub ────────────────────────────────────

export type TrainingManagementActionType =
  | "VIEW_OVERDUE"
  | "VIEW_NOT_STARTED"
  | "VIEW_STRUGGLING_LEARNERS"
  | "SEND_REMINDER"
  | "RECOMMEND_REFRESHER"
  | "ASSIGN_REFRESHER"
  | "VIEW_COURSE_PERFORMANCE"
  | "VIEW_DEPARTMENT_PERFORMANCE";

export interface TrainingManagementAction {
  actionType: TrainingManagementActionType;
  targetType: "overdue_assignments" | "unstarted_assignments" | "struggling_learners" | "course" | "department" | "company";
  targetCount?: number;
  courseId?: number;
  courseCode?: string;
  courseTitle?: string;
  departmentName?: string;
  employeeIds?: number[];
  label: string;
  description: string;
  requiresConfirmation: boolean;
  confirmationPrompt?: string;
  targetUrl: string;
}

export interface OverdueLearnerRecord {
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  department: string;
  courseId: number;
  courseCode: string;
  courseTitle: string;
  assignmentDate: string | null;
  dueDate: string | null;
  daysOverdue: number;
  status: "overdue";
}

export interface NotStartedLearnerRecord {
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  department: string;
  courseId: number;
  courseCode: string;
  courseTitle: string;
  assignmentDate: string | null;
  dueDate: string | null;
  status: "not_started";
}

export interface StrugglingLearnerRecord {
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  department: string;
  courseId: number;
  courseCode: string;
  courseTitle: string;
  totalAttempts: number;
  maxQuizScore: number;
  passed: boolean;
  supportRecommendation: string;
  status: "needs_support";
}

export interface SendReminderBatchInput {
  employeeIds?: number[];
  courseId?: number;
  category: "overdue" | "not_started" | "manual";
  customNote?: string;
  source?: "training-insight" | "manual" | "AI-copilot";
}

export interface ReminderDispatchDetail {
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  courseTitle: string;
  status: "delivered" | "skipped" | "failed";
  reason?: string;
}

export interface SendReminderBatchResult {
  attemptedCount: number;
  deliveredCount: number;
  skippedCount: number;
  failedCount: number;
  details: ReminderDispatchDetail[];
}

export interface AssignRefresherBatchInput {
  employeeIds: number[];
  courseId: number;
  dueDate?: string;
  source?: "training-insight" | "manual" | "AI-copilot";
}

export interface FollowUpAuditRecord {
  id: number | string;
  action: string;
  actorUserId: string;
  actorRole: string;
  targetType: string;
  targetId: string | null;
  metadata: Record<string, unknown> | null;
  timestamp: string;
}

export function useCompanyTrainingActions() {
  return useQuery({
    queryKey: ["company-training-actions"],
    queryFn: () => apiJson<{ companyId: number; resolvedAt: string; actions: TrainingManagementAction[] }>("/api/company/training-actions"),
  });
}

export function useOverdueLearners(courseId?: number) {
  return useQuery({
    queryKey: ["overdue-learners", courseId],
    queryFn: () => apiJson<{ learners: OverdueLearnerRecord[]; count: number }>(`/api/company/training-actions/learners/overdue${courseId ? `?courseId=${courseId}` : ""}`),
  });
}

export function useNotStartedLearners(courseId?: number) {
  return useQuery({
    queryKey: ["not-started-learners", courseId],
    queryFn: () => apiJson<{ learners: NotStartedLearnerRecord[]; count: number }>(`/api/company/training-actions/learners/not-started${courseId ? `?courseId=${courseId}` : ""}`),
  });
}

export function useStrugglingLearners(courseId?: number) {
  return useQuery({
    queryKey: ["struggling-learners", courseId],
    queryFn: () => apiJson<{ learners: StrugglingLearnerRecord[]; count: number }>(`/api/company/training-actions/learners/struggling${courseId ? `?courseId=${courseId}` : ""}`),
  });
}

export function useSendTrainingReminders() {
  return useMutation({
    mutationFn: (input: SendReminderBatchInput) =>
      apiJson<SendReminderBatchResult>("/api/company/training-actions/remind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
  });
}

export function useAssignRefresherTraining() {
  return useMutation({
    mutationFn: (input: AssignRefresherBatchInput) =>
      apiJson<any>("/api/company/training-actions/assign-refresher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
  });
}

export function useFollowUpAuditHistory() {
  return useQuery({
    queryKey: ["follow-up-audit-history"],
    queryFn: () => apiJson<{ history: FollowUpAuditRecord[]; count: number }>("/api/company/training-actions/audit-history"),
  });
}

// Sprint 11D Workplace Actions & Training Impact
export interface WorkplaceActionRecord {
  id: number;
  companyId: number;
  employeeId: number;
  courseId: number;
  courseVersion: number;
  enrollmentId: number | null;
  commitmentType: "suggested" | "custom";
  commitmentText: string;
  actionCategory: string;
  status: string;
  completedAt: string | null;
  employeeProgressNote: string | null;
  learnerReflection: string | null;
  managerResponseNote: string | null;
  managerConfirmationStatus: string;
  managerConfirmedByUserId: string | null;
  managerConfirmedAt: string | null;
  employeeSubmittedAt: string | null;
  actionReportedAt: string | null;
  managerReviewedAt: string | null;
  reviewedByEmployeeId: number | null;
  createdAt: string;
  updatedAt: string;
  employeeName?: string;
  department?: string;
  courseCode?: string;
  courseTitle?: string;
}

export interface TrainingImpactSummary {
  companyId: number;
  eligibleCompletions: number;
  commitmentsCreated: number;
  commitmentRate: number;
  actionsReported: number;
  actionFollowThroughRate: number;
  managerConfirmedActions: number;
  followUpRequested: number;
  outstandingManagerReviews: number;
  categoryDistribution: Record<string, number>;
  esgBreakdown: {
    environmental: number;
    social: number;
    governance: number;
  };
  departmentSummary: Record<string, { employeeCount: number; commitmentCount: number; suppressed: boolean }>;
  disclaimer: string;
}

export interface TrainingImpactNarrative {
  summaryInterpretation: string;
  keyStrengthsAndGaps: string;
  suggestedManagementActions: string[];
  isAiGenerated: boolean;
  disclaimer: string;
}

export function useLearnerWorkplaceActions() {
  return useQuery({
    queryKey: ["learner-workplace-actions"],
    queryFn: () => apiJson<WorkplaceActionRecord[]>("/api/learning/workplace-actions"),
  });
}

export function useCreateWorkplaceCommitment() {
  return useMutation({
    mutationFn: (input: {
      courseId: number;
      enrollmentId?: number;
      commitmentText: string;
      actionCategory?: string;
      commitmentType?: "suggested" | "custom";
    }) =>
      apiJson<WorkplaceActionRecord>("/api/learning/workplace-actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
  });
}

export function useReportWorkplaceAction() {
  return useMutation({
    mutationFn: (input: { commitmentId: number; progressNote?: string }) =>
      apiJson<WorkplaceActionRecord>(`/api/learning/workplace-actions/${input.commitmentId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progressNote: input.progressNote }),
      }),
  });
}

export function useCompanyTrainingImpact() {
  return useQuery({
    queryKey: ["company-training-impact"],
    queryFn: () => apiJson<{ summary: TrainingImpactSummary; narrative: TrainingImpactNarrative }>("/api/company/training-impact"),
  });
}

export function useCompanyWorkplaceActions(filters?: { status?: string; category?: string; courseId?: number }) {
  const search = new URLSearchParams();
  if (filters?.status) search.set("status", filters.status);
  if (filters?.category) search.set("category", filters.category);
  if (filters?.courseId) search.set("courseId", String(filters.courseId));
  const query = search.toString() ? `?${search.toString()}` : "";

  return useQuery({
    queryKey: ["company-workplace-actions", filters],
    queryFn: () => apiJson<{ records: WorkplaceActionRecord[]; count: number }>(`/api/company/workplace-actions${query}`),
  });
}

export function useReviewWorkplaceAction() {
  return useMutation({
    mutationFn: (input: { commitmentId: number; decision: "confirm" | "request_followup" | "close"; managerResponseNote?: string }) =>
      apiJson<WorkplaceActionRecord>(`/api/company/workplace-actions/${input.commitmentId}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision: input.decision, managerResponseNote: input.managerResponseNote }),
      }),
  });
}
