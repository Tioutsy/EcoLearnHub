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

async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: "include",
    ...init,
    headers: {
      ...(init?.body ? { "content-type": "application/json" } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with ${response.status}`);
  }
  if (response.status === 204) return null as T;
  return response.json() as Promise<T>;
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

export function useCreateEmployeeInvitation() {
  return useMutation({
    mutationFn: (id: number) =>
      apiJson<EmployeeInvitation>(`/api/company/employees/${id}/invite`, {
        method: "POST",
      }),
  });
}
