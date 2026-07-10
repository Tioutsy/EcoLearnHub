import { useMutation, useQuery } from "@tanstack/react-query";

export type RecyclingServiceStatus =
  | "NOT_CLIENT"
  | "ACTIVE_CLIENT"
  | "PAUSED"
  | "FORMER_CLIENT";

export type RecyclingMaterialKey =
  | "paperCardboardKg"
  | "plasticKg"
  | "glassKg"
  | "aluminiumMetalKg"
  | "otherKg";

export interface RecyclingProfile {
  id: number;
  name: string;
  slug: string;
  industry: string | null;
  recyclingServiceStatus: RecyclingServiceStatus;
  recycleanCustomerRef: string | null;
  recyclingServiceStartDate: string | null;
  defaultCollectionSiteName: string | null;
  recyclingServiceFrequency: string | null;
  recyclingInternalNotes?: string | null;
}

export interface RecyclingTotals {
  materialTotals: Record<RecyclingMaterialKey, number>;
  totalKg: number;
  collectionsCount: number;
  latestCollectionDate?: string | null;
}

export interface RecyclingMonthlyTrend extends RecyclingTotals {
  month: string;
}

export interface RecyclingCollection {
  id: number;
  companyId: number;
  siteName: string;
  collectionDate: string;
  reportingMonth: string;
  paperCardboardKg: number;
  plasticKg: number;
  glassKg: number;
  aluminiumMetalKg: number;
  otherKg: number;
  totalKg: number;
  internalComment: string | null;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RecyclingEquivalent {
  metricName: string;
  metricLabel: string;
  value: number;
  unit: string;
  materialType: string;
  sourceName: string;
  sourceReference: string | null;
  effectiveDate: string;
  note: string;
  estimated: true;
}

export interface RecyclingSummary {
  profile: RecyclingProfile;
  filters: RecyclingSummaryParams;
  generatedAt: string;
  currentMonth: RecyclingTotals & { month: string };
  cumulative: RecyclingTotals;
  period: RecyclingTotals;
  monthlyTrend: RecyclingMonthlyTrend[];
  recentCollections: RecyclingCollection[];
  records: RecyclingCollection[];
  equivalents: RecyclingEquivalent[];
  equivalentsNote: string;
}

export interface RecyclingSummaryParams {
  month?: string;
  fromMonth?: string;
  toMonth?: string;
  site?: string;
}

export interface RecyclingCollectionInput {
  siteName: string;
  collectionDate: string;
  reportingMonth?: string;
  paperCardboardKg: string | number;
  plasticKg: string | number;
  glassKg: string | number;
  aluminiumMetalKg: string | number;
  otherKg: string | number;
  internalComment?: string | null;
}

export interface RecyclingServiceInput {
  recyclingServiceStatus?: RecyclingServiceStatus;
  recycleanCustomerRef?: string | null;
  recyclingServiceStartDate?: string | null;
  defaultCollectionSiteName?: string | null;
  recyclingServiceFrequency?: string | null;
  recyclingInternalNotes?: string | null;
}

export interface RecyclingEnquiryInput {
  contactName: string;
  email: string;
  phone?: string;
  siteLocation?: string;
  currentArrangement?: string;
  message?: string;
}

export interface RecyclingEnquiry {
  id: number;
  companyId: number | null;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  siteLocation: string | null;
  currentArrangement: string | null;
  message: string | null;
  status: string;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
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
    const payload = await response.json().catch(() => null);
    throw new Error(
      payload?.error ?? `Request failed with status ${response.status}`,
    );
  }
  if (response.status === 204) return null as T;
  return response.json() as Promise<T>;
}

function query(params: RecyclingSummaryParams = {}): string {
  const search = new URLSearchParams();
  if (params.month) search.set("month", params.month);
  if (params.fromMonth) search.set("fromMonth", params.fromMonth);
  if (params.toMonth) search.set("toMonth", params.toMonth);
  if (params.site) search.set("site", params.site);
  const text = search.toString();
  return text ? `?${text}` : "";
}

export function useCompanyRecyclingSummary(params: RecyclingSummaryParams = {}) {
  return useQuery({
    queryKey: ["company-recycling-summary", params],
    queryFn: () =>
      apiJson<RecyclingSummary>(`/api/recycling/company/summary${query(params)}`),
  });
}

export function useCompanyRecyclingReport(params: RecyclingSummaryParams = {}) {
  return useQuery({
    queryKey: ["company-recycling-report", params],
    queryFn: () =>
      apiJson<RecyclingSummary>(`/api/recycling/company/report${query(params)}`),
  });
}

export function useSubmitRecyclingEnquiry() {
  return useMutation({
    mutationFn: (data: RecyclingEnquiryInput) =>
      apiJson<RecyclingEnquiry>("/api/recycling/company/enquiries", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}

export function useAdminRecyclingCompanies(search = "") {
  const path = search
    ? `/api/recycling/admin/companies?search=${encodeURIComponent(search)}`
    : "/api/recycling/admin/companies";
  return useQuery({
    queryKey: ["admin-recycling-companies", search],
    queryFn: () => apiJson<RecyclingProfile[]>(path),
  });
}

export function useAdminRecyclingSummary(
  companyId: number | null,
  params: RecyclingSummaryParams = {},
) {
  return useQuery({
    queryKey: ["admin-recycling-summary", companyId, params],
    queryFn: () =>
      apiJson<RecyclingSummary>(
        `/api/recycling/admin/companies/${companyId}/summary${query(params)}`,
      ),
    enabled: Boolean(companyId),
  });
}

export function useAdminRecyclingRecords(
  companyId: number | null,
  params: RecyclingSummaryParams = {},
) {
  return useQuery({
    queryKey: ["admin-recycling-records", companyId, params],
    queryFn: () =>
      apiJson<RecyclingCollection[]>(
        `/api/recycling/admin/companies/${companyId}/records${query(params)}`,
      ),
    enabled: Boolean(companyId),
  });
}

export function useUpdateRecyclingService() {
  return useMutation({
    mutationFn: ({
      companyId,
      data,
    }: {
      companyId: number;
      data: RecyclingServiceInput;
    }) =>
      apiJson<RecyclingProfile>(
        `/api/recycling/admin/companies/${companyId}/service`,
        {
          method: "PATCH",
          body: JSON.stringify(data),
        },
      ),
  });
}

export function useCreateRecyclingRecord() {
  return useMutation({
    mutationFn: ({
      companyId,
      data,
    }: {
      companyId: number;
      data: RecyclingCollectionInput;
    }) =>
      apiJson<RecyclingCollection>(
        `/api/recycling/admin/companies/${companyId}/records`,
        {
          method: "POST",
          body: JSON.stringify(data),
        },
      ),
  });
}

export function useUpdateRecyclingRecord() {
  return useMutation({
    mutationFn: ({
      recordId,
      data,
    }: {
      recordId: number;
      data: RecyclingCollectionInput;
    }) =>
      apiJson<RecyclingCollection>(`/api/recycling/admin/records/${recordId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
  });
}

export function useDeleteRecyclingRecord() {
  return useMutation({
    mutationFn: (recordId: number) =>
      apiJson<void>(`/api/recycling/admin/records/${recordId}`, {
        method: "DELETE",
      }),
  });
}

export function useAdminRecyclingEnquiries() {
  return useQuery({
    queryKey: ["admin-recycling-enquiries"],
    queryFn: () =>
      apiJson<RecyclingEnquiry[]>("/api/recycling/admin/enquiries"),
  });
}
