import { useQuery } from "@tanstack/react-query";

export interface ManagerTrainingFilters {
  search?: string;
  status?: "completed" | "in_progress" | "not_started" | "all";
  certificationStatus?: "certified" | "not_certified" | "all";
  role?: string;
  courseId?: number;
  department?: string;
  overdue?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: "name" | "email" | "status" | "progress" | "lastActive";
  sortDirection?: "asc" | "desc";
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

export function useGetManagerTrainingOverview() {
  return useQuery({
    queryKey: ["manager-training-overview"],
    queryFn: () => apiJson<any>("/api/manager/training/overview"),
  });
}

function buildQuery(params: ManagerTrainingFilters): string {
  const search = new URLSearchParams();
  if (params.search) search.set("search", params.search);
  if (params.status && params.status !== "all") search.set("status", params.status);
  if (params.certificationStatus && params.certificationStatus !== "all") {
    search.set("certificationStatus", params.certificationStatus);
  }
  if (params.role) search.set("role", params.role);
  if (params.courseId) search.set("courseId", String(params.courseId));
  if (params.department) search.set("department", params.department);
  if (params.overdue !== undefined) search.set("overdue", String(params.overdue));
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
  if (params.sortBy) search.set("sortBy", params.sortBy);
  if (params.sortDirection) search.set("sortDirection", params.sortDirection);
  
  const query = search.toString();
  return query ? `?${query}` : "";
}

export function useGetManagerTrainingEmployees(filters: ManagerTrainingFilters) {
  return useQuery({
    queryKey: ["manager-training-employees", filters],
    queryFn: () => apiJson<any>(`/api/manager/training/employees${buildQuery(filters)}`),
  });
}

export function useGetEmployeeTrainingDetail(employeeId: number | null) {
  return useQuery({
    queryKey: ["employee-training-detail", employeeId],
    queryFn: () => {
      if (employeeId === null) return null;
      return apiJson<any>(`/api/manager/training/employees/${employeeId}`);
    },
    enabled: employeeId !== null,
  });
}
