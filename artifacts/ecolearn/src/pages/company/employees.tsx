import { Layout } from "@/components/layout/Layout";
import {
  getListEmployeesQueryKey,
  useAddEmployee,
  useListCourses,
  useListEmployees,
  useRemoveEmployee,
  useUpdateEmployee,
} from "@workspace/api-client-react";
import type { Course, Employee } from "@workspace/api-client-react";
import {
  useAssignCompanyCourses,
  useCompanySeatUsage,
  useCompanyEmployeeInvitations,
  useInviteEmployee,
  useResendEmployeeInvitation,
  useRevokeEmployeeInvitation,
  useDeactivateEmployee,
  useReactivateEmployee,
  type CompanyInvitation,
  type SeatUsageData,
} from "@/lib/lms-api";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Search,
  UserCircle,
  ArrowLeft,
  Pencil,
  Trash2,
  Send,
  ClipboardList,
  Copy,
  CheckCircle2,
  Sparkles,
  Users,
  Mail,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  XCircle,
  Key,
  ExternalLink,
  Clock,
  UserCheck,
  UserX,
  Upload,
  FileDown,
  FileUp,
  Loader2,
  X,
  Building2,
} from "lucide-react";
import { SmartRecommendationDialog } from "@/components/SmartRecommendationDialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/react";
import { hasCapability } from "@/lib/authHelpers";
import { useLanguage } from "@/context/LanguageContext";
import { customFetch } from "@workspace/api-client-react";

const EMPTY_INVITE_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  department: "",
  role: "employee" as "employee" | "manager" | "admin",
};

const EMPTY_EDIT_FORM = {
  name: "",
  email: "",
  department: "",
  jobTitle: "",
  role: "employee" as "employee" | "manager" | "admin",
};

type ManagedEmployee = Employee & {
  jobTitle?: string | null;
  status?: string;
  invitationStatus?: string;
  invitationSentAt?: string | null;
  invitationAcceptedAt?: string | null;
};

export default function CompanyEmployees() {
  const { t } = useLanguage();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const canManageEmployees = hasCapability(user, "employees.create");

  // Queries
  const { data: employeeData, isLoading: isLoadingEmployees } = useListEmployees();
  const { data: seatUsage, isLoading: isLoadingSeats, refetch: refetchSeats } = useCompanySeatUsage();
  const { data: invitations, isLoading: isLoadingInvitations, refetch: refetchInvitations } = useCompanyEmployeeInvitations();
  const { data: courses } = useListCourses();

  // Mutations
  const updateEmployee = useUpdateEmployee();
  const removeEmployee = useRemoveEmployee();
  const inviteEmployee = useInviteEmployee();
  const resendInvitation = useResendEmployeeInvitation();
  const revokeInvitation = useRevokeEmployeeInvitation();
  const deactivateEmployee = useDeactivateEmployee();
  const reactivateEmployee = useReactivateEmployee();
  const assignCourses = useAssignCompanyCourses();

  const { toast } = useToast();

  // Local state
  const [activeTab, setActiveTab] = useState<"members" | "invitations">("members");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [bulkUploadFile, setBulkUploadFile] = useState<File | null>(null);
  const [bulkDragActive, setBulkDragActive] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkResult, setBulkResult] = useState<{
    batchId: number;
    totalRows: number;
    validRows: number;
    skippedRows: number;
    queuedCount: number;
    status: string;
    skippedReport: { rowNumber: number; email: string; reasonCode: string; explanation: string }[];
  } | null>(null);
  const [bulkErrorMessage, setBulkErrorMessage] = useState<string | null>(null);
  const bulkFileInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState<ManagedEmployee | null>(null);
  const [recommendingEmployee, setRecommendingEmployee] = useState<ManagedEmployee | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Invitation Success Modal State
  const [createdInvite, setCreatedInvite] = useState<CompanyInvitation | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const { data: activeDepartments = [] } = useQuery<{ id: number; name: string }[]>({
    queryKey: ["company", "departments"],
    queryFn: async () => {
      const res = await customFetch("/api/company/departments");
      return (res as any) || [];
    },
  });

  const { data: activeJobTitles = [] } = useQuery<{ id: number; name: string }[]>({
    queryKey: ["company", "job-titles"],
    queryFn: async () => {
      const res = await customFetch("/api/company/job-titles");
      return (res as any) || [];
    },
  });

  const employees = (employeeData ?? []) as ManagedEmployee[];

  const departments = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((employee) => {
      if (employee.department) set.add(employee.department);
    });
    return Array.from(set).sort();
  }, [employees]);

  const filteredEmployees = employees.filter((employee) =>
    [employee.name, employee.email, employee.department, employee.jobTitle]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(search.toLowerCase())),
  );

  const filteredInvitations = (invitations ?? []).filter((inv) =>
    [inv.email, inv.firstName, inv.lastName, inv.department, inv.displayCode]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(search.toLowerCase())),
  );

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: getListEmployeesQueryKey() });
    refetchSeats();
    refetchInvitations();
  };

  const toggleEmployee = (id: number) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  };

  const allVisibleSelected =
    filteredEmployees.length > 0 &&
    filteredEmployees.every((employee) => selectedIds.includes(employee.id));

  const handleDeactivate = async (employee: ManagedEmployee) => {
    if (!window.confirm(`Deactivate ${employee.name}? They will lose access to training but their completed certifications and progress will be preserved.`)) return;
    try {
      await deactivateEmployee.mutateAsync(employee.id);
      invalidateAll();
      toast({ title: "Employee deactivated", description: "Seat has been released." });
    } catch (err: any) {
      toast({
        title: "Failed to deactivate employee",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReactivate = async (employee: ManagedEmployee) => {
    try {
      await reactivateEmployee.mutateAsync(employee.id);
      invalidateAll();
      toast({ title: "Employee reactivated", description: "Seat capacity has been updated." });
    } catch (err: any) {
      toast({
        title: "Failed to reactivate employee",
        description: err.message || "Seat limit reached or subscription inactive.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (employee: ManagedEmployee) => {
    if (!window.confirm(`Permanently remove ${employee.name}? Their training assignments and records will be deleted.`)) return;
    try {
      await removeEmployee.mutateAsync({ id: employee.id });
      setSelectedIds((current) => current.filter((id) => id !== employee.id));
      invalidateAll();
      toast({ title: "Employee deleted" });
    } catch (err: any) {
      toast({
        title: "Failed to delete employee",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleResend = async (invitationId: number) => {
    try {
      const refreshed = await resendInvitation.mutateAsync(invitationId);
      setCreatedInvite(refreshed);
      invalidateAll();
      toast({ title: "Invitation refreshed", description: refreshed.message || "New secure link and code generated." });
    } catch (err: any) {
      toast({
        title: "Failed to resend invitation",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRevoke = async (invitationId: number) => {
    if (!window.confirm("Revoke this invitation? The recipient will no longer be able to use this code or link to join.")) return;
    try {
      await revokeInvitation.mutateAsync(invitationId);
      invalidateAll();
      toast({ title: "Invitation revoked", description: "Reserved seat has been released." });
    } catch (err: any) {
      toast({
        title: "Failed to revoke invitation",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string, type: "link" | "code") => {
    navigator.clipboard?.writeText(text);
    if (type === "link") {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
    toast({ title: `${type === "link" ? "Invitation link" : "Access code"} copied to clipboard` });
  };

  return (
    <Layout>
      {/* Header Banner */}
      <div className="bg-primary/5 border-b py-8">
        <div className="container mx-auto px-4">
          <Link
            href="/company"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to overview
          </Link>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-serif mb-2">Manage Employees & Invitations</h1>
              <p className="text-muted-foreground">
                Invite team members with secure single-use access codes, track seat usage, and manage training assignments.
              </p>
            </div>
            {canManageEmployees && (
              <div className="flex flex-wrap gap-2">
                <Link href="/company/settings/lists">
                  <Button variant="outline">
                    <Building2 className="mr-2 h-4 w-4" /> Company Lists
                  </Button>
                </Link>
                <Button variant="outline" onClick={() => setAssignOpen(true)}>
                  <ClipboardList className="mr-2 h-4 w-4" /> Assign Training
                </Button>
                <Button
                  variant="outline"
                  id="bulk-invite-btn"
                  onClick={() => {
                    setBulkUploadFile(null);
                    setBulkResult(null);
                    setBulkErrorMessage(null);
                    setIsBulkUploadOpen(true);
                  }}
                >
                  <Upload className="mr-2 h-4 w-4" /> Bulk Invite (CSV)
                </Button>
                <Button
                  id="invite-employee-btn"
                  onClick={() => setIsInviteOpen(true)}
                  disabled={seatUsage?.canInvite === false}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm"
                >
                  <Plus className="mr-2 h-4 w-4" /> Invite Employee
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Seat Usage Overview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" /> Subscription Seat Capacity
            </h2>
            {seatUsage && (
              <Badge variant="outline" className="font-medium bg-background">
                {seatUsage.bandLabel || "Corporate Band"} ({seatUsage.maxSeats} Max Seats)
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 rounded-xl border bg-card shadow-sm">
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active Employees</div>
              <div className="text-2xl font-bold text-foreground mt-1">
                {isLoadingSeats ? <Skeleton className="h-7 w-12" /> : seatUsage?.activeEmployees ?? 0}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">Enrolled & learning</div>
            </div>

            <div className="p-4 rounded-xl border bg-card shadow-sm">
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Pending Invites</div>
              <div className="text-2xl font-bold text-amber-600 mt-1">
                {isLoadingSeats ? <Skeleton className="h-7 w-12" /> : seatUsage?.pendingInvitations ?? 0}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">Awaiting signup</div>
            </div>

            <div className="p-4 rounded-xl border bg-card shadow-sm">
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Reserved Seats</div>
              <div className="text-2xl font-bold text-primary mt-1">
                {isLoadingSeats ? <Skeleton className="h-7 w-12" /> : seatUsage?.reservedSeats ?? 0}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">Active + Pending</div>
            </div>

            <div className="p-4 rounded-xl border bg-card shadow-sm">
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Remaining Seats</div>
              <div className={`text-2xl font-bold mt-1 ${(seatUsage?.remainingSeats ?? 0) <= 2 ? "text-amber-600" : "text-emerald-700"}`}>
                {isLoadingSeats ? <Skeleton className="h-7 w-12" /> : seatUsage?.remainingSeats ?? 0}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">Available to invite</div>
            </div>

            <div className="p-4 rounded-xl border bg-card shadow-sm col-span-2 md:col-span-1">
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Subscription Max</div>
              <div className="text-2xl font-bold text-foreground mt-1">
                {isLoadingSeats ? <Skeleton className="h-7 w-12" /> : seatUsage?.maxSeats ?? 0}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5 truncate">{seatUsage?.subscriptionPlanName || "Standard Plan"}</div>
            </div>
          </div>

          {/* Warning / Gating Alert */}
          {seatUsage && !seatUsage.canInvite && (
            <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold">Invitations Disabled</p>
                <p className="mt-0.5 text-xs text-amber-800 dark:text-amber-300">{seatUsage.reason}</p>
              </div>
            </div>
          )}
        </div>

        {/* Tabs: Active Team vs Invitations */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("members")}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  activeTab === "members"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                Team Members ({employees.length})
              </button>
              <button
                onClick={() => setActiveTab("invitations")}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === "invitations"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Mail className="h-4 w-4" /> Invitations ({(invitations ?? []).length})
              </button>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={activeTab === "members" ? "Search employees..." : "Search invitations or codes..."}
                className="pl-9"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          {/* TAB 1: Team Members Table */}
          {activeTab === "members" && (
            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={allVisibleSelected}
                          onCheckedChange={(checked) => {
                            const visible = filteredEmployees.map((employee) => employee.id);
                            setSelectedIds((current) =>
                              checked
                                ? Array.from(new Set([...current, ...visible]))
                                : current.filter((id) => !visible.includes(id)),
                            );
                          }}
                        />
                      </TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Courses</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingEmployees ? (
                      Array(5).fill(0).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                          <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-12 mx-auto" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-28 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredEmployees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                          No employees found matching your search.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEmployees.map((employee) => (
                        <TableRow key={employee.id} className={employee.status === "deactivated" ? "opacity-60 bg-muted/20" : ""}>
                          <TableCell>
                            <Checkbox
                              checked={selectedIds.includes(employee.id)}
                              onCheckedChange={() => toggleEmployee(employee.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <UserCircle className="h-8 w-8 text-muted-foreground shrink-0" />
                              <div>
                                <div className="font-medium text-foreground">{employee.name}</div>
                                <div className="text-xs text-muted-foreground">{employee.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{employee.department || "-"}</TableCell>
                          <TableCell>{employee.jobTitle || "-"}</TableCell>
                          <TableCell>
                            {employee.role === "admin" ? (
                              <Badge className="bg-emerald-800 hover:bg-emerald-900 text-white font-medium capitalize">
                                Admin
                              </Badge>
                            ) : employee.role === "manager" ? (
                              <Badge className="bg-purple-700 hover:bg-purple-800 text-white font-medium capitalize shadow-sm">
                                Manager
                              </Badge>
                            ) : (
                              <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-medium capitalize">
                                Employee
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {employee.status === "deactivated" ? (
                              <Badge variant="outline" className="border-rose-500/40 text-rose-700 bg-rose-50/50">
                                Deactivated
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-emerald-500/40 text-emerald-700 bg-emerald-50/50">
                                Active
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center font-medium">
                            <span className="text-primary">{employee.completedCourses || 0}</span>
                            <span className="text-muted-foreground">/{employee.enrolledCourses || 0}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Smart Training Recommendation"
                                onClick={() => setRecommendingEmployee(employee)}
                              >
                                <Sparkles className="h-4 w-4 text-emerald-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Edit employee details"
                                onClick={() => setEditing(employee)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              {employee.status === "active" ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Deactivate employee (releases seat)"
                                  onClick={() => handleDeactivate(employee)}
                                >
                                  <UserX className="h-4 w-4 text-amber-600" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Reactivate employee"
                                  onClick={() => handleReactivate(employee)}
                                >
                                  <UserCheck className="h-4 w-4 text-emerald-600" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Delete employee permanently"
                                onClick={() => handleDelete(employee)}
                                disabled={removeEmployee.isPending}
                              >
                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* TAB 2: Invitations Table */}
          {activeTab === "invitations" && (
            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Access Code</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingInvitations ? (
                      Array(4).fill(0).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton className="h-8 w-44" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredInvitations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                          No invitations created yet. Click <strong>Invite Employee</strong> to issue single-use invitation links and access codes.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInvitations.map((inv) => {
                        const isPending = inv.status === "pending";
                        const isAccepted = inv.status === "accepted";
                        const isExpired = inv.status === "expired";
                        const isRevoked = inv.status === "revoked";

                        return (
                          <TableRow key={inv.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium text-foreground">
                                  {[inv.firstName, inv.lastName].filter(Boolean).join(" ") || "Invited Colleague"}
                                </div>
                                <div className="text-xs text-muted-foreground">{inv.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>{inv.department || "-"}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {inv.intendedRole}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold bg-muted px-2.5 py-1 rounded-md border">
                                <Key className="h-3 w-3 text-muted-foreground" />
                                {inv.displayCode}
                              </div>
                            </TableCell>
                            <TableCell>
                              {isPending && (
                                <Badge className="bg-amber-500/15 text-amber-800 border-amber-500/30 font-medium">
                                  Pending
                                </Badge>
                              )}
                              {isAccepted && (
                                <Badge className="bg-emerald-500/15 text-emerald-800 border-emerald-500/30 font-medium">
                                  Accepted
                                </Badge>
                              )}
                              {isExpired && (
                                <Badge className="bg-slate-500/15 text-slate-700 border-slate-500/30 font-medium">
                                  Expired
                                </Badge>
                              )}
                              {isRevoked && (
                                <Badge className="bg-rose-500/15 text-rose-800 border-rose-500/30 font-medium">
                                  Revoked
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {new Date(inv.expiresAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Copy Access Code"
                                  onClick={() => copyToClipboard(inv.displayCode, "code")}
                                >
                                  <Key className="h-3.5 w-3.5 mr-1" /> Code
                                </Button>
                                {isPending && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      title="Resend & refresh invitation"
                                      onClick={() => handleResend(inv.id)}
                                      disabled={resendInvitation.isPending}
                                    >
                                      <RefreshCw className="h-3.5 w-3.5 mr-1" /> Resend
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-destructive hover:text-destructive"
                                      title="Revoke invitation"
                                      onClick={() => handleRevoke(inv.id)}
                                      disabled={revokeInvitation.isPending}
                                    >
                                      <XCircle className="h-3.5 w-3.5 mr-1" /> Revoke
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 0: Bulk CSV Invitation Upload Dialog */}
      <Dialog open={isBulkUploadOpen} onOpenChange={(open) => {
        if (!open) { setBulkUploadFile(null); setBulkResult(null); setBulkErrorMessage(null); }
        setIsBulkUploadOpen(open);
      }}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-emerald-600" />
              Bulk Employee Invitation (CSV)
            </DialogTitle>
          </DialogHeader>

          {!bulkResult ? (
            <div className="space-y-4 py-2">
              {(activeDepartments.length === 0 || activeJobTitles.length === 0) && (
                <div className="flex items-start gap-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-3 text-amber-800 dark:text-amber-300 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <div className="flex-1">
                    <p className="font-semibold">Company lists not yet configured</p>
                    <p className="mt-0.5">
                      Invited employees will select their department and job title autonomously. We recommend setting up your company lists first.
                    </p>
                    <div className="mt-1.5">
                      <Link href="/company/settings/lists" className="underline font-semibold hover:text-amber-950 dark:hover:text-amber-100">
                        Configure Departments & Job Titles →
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Download Template */}
              <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                <div className="text-sm">
                  <p className="font-medium">Download the official CSV template</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Columns: first_name, surname, email</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  id="download-csv-template-btn"
                  onClick={() => {
                    const csv = "first_name,surname,email\n";
                    const blob = new Blob([csv], { type: "text/csv" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "elevio-bulk-invitation-template.csv";
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <FileDown className="mr-1.5 h-4 w-4" /> Template
                </Button>
              </div>

              {/* Drop Zone */}
              <div
                id="bulk-csv-dropzone"
                className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer
                  ${bulkDragActive ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30" : "border-border hover:border-emerald-400 hover:bg-muted/40"}
                `}
                onDragOver={(e) => { e.preventDefault(); setBulkDragActive(true); }}
                onDragLeave={() => setBulkDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setBulkDragActive(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file && (file.name.endsWith(".csv") || file.type === "text/csv")) {
                    setBulkUploadFile(file);
                    setBulkErrorMessage(null);
                  } else {
                    setBulkErrorMessage("Please upload a .csv file.");
                  }
                }}
                onClick={() => bulkFileInputRef.current?.click()}
              >
                <input
                  ref={bulkFileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) { setBulkUploadFile(file); setBulkErrorMessage(null); }
                  }}
                />
                {bulkUploadFile ? (
                  <div className="flex items-center gap-3">
                    <FileUp className="h-8 w-8 text-emerald-600" />
                    <div className="text-left">
                      <p className="font-medium text-foreground text-sm">{bulkUploadFile.name}</p>
                      <p className="text-xs text-muted-foreground">{(bulkUploadFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button
                      className="ml-2 text-muted-foreground hover:text-destructive"
                      onClick={(e) => { e.stopPropagation(); setBulkUploadFile(null); }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground mb-3" />
                    <p className="text-sm font-medium text-foreground">Drop your CSV file here</p>
                    <p className="text-xs text-muted-foreground mt-1">or click to browse — .csv files only</p>
                  </>
                )}
              </div>

              {bulkErrorMessage && (
                <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-destructive text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{bulkErrorMessage}</span>
                </div>
              )}
            </div>
          ) : (
            /* Results View */
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Total Rows", value: bulkResult.totalRows, color: "text-foreground" },
                  { label: "Invited", value: bulkResult.validRows, color: "text-emerald-600" },
                  { label: "Skipped", value: bulkResult.skippedRows, color: bulkResult.skippedRows > 0 ? "text-amber-600" : "text-foreground" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-lg border bg-muted/30 p-3 text-center">
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>

              {bulkResult.validRows > 0 && (
                <div className="flex items-start gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3 text-emerald-800 dark:text-emerald-300 text-sm">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>{bulkResult.validRows}</strong> employees have been sent individual invitations. They will receive a separate email with their access code.
                  </span>
                </div>
              )}

              {bulkResult.skippedRows > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Skipped Rows ({bulkResult.skippedRows}):</p>
                  <div className="max-h-40 overflow-y-auto rounded-lg border divide-y text-xs">
                    {bulkResult.skippedReport.slice(0, 30).map((r, i) => (
                      <div key={i} className="flex items-start gap-2 px-3 py-2">
                        <span className="text-muted-foreground shrink-0 font-mono">Row {r.rowNumber}</span>
                        <span className="text-foreground font-medium shrink-0">{r.email}</span>
                        <span className="text-muted-foreground truncate">{r.explanation}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    id="download-error-report-btn"
                    onClick={() => {
                      const rows = bulkResult.skippedReport;
                      const csv = "row_number,email,reason_code,explanation\n" + rows.map(
                        r => [r.rowNumber, r.email, r.reasonCode, `"${r.explanation.replace(/"/g, '""')}"`].join(",")
                      ).join("\n");
                      const blob = new Blob([csv], { type: "text/csv" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `elevio-batch-${bulkResult.batchId}-skipped-report.csv`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <FileDown className="mr-1.5 h-4 w-4" /> Download Full Skipped Report
                  </Button>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            {bulkResult ? (
              <>
                <Button variant="outline" onClick={() => {
                  setBulkResult(null);
                  setBulkUploadFile(null);
                  setBulkErrorMessage(null);
                }}>
                  Upload Another File
                </Button>
                <Button onClick={() => {
                  setIsBulkUploadOpen(false);
                  setBulkResult(null);
                  setBulkUploadFile(null);
                  invalidateAll();
                }} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                  Done
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsBulkUploadOpen(false)}>
                  Cancel
                </Button>
                <Button
                  id="process-bulk-upload-btn"
                  disabled={!bulkUploadFile || bulkUploading}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white"
                  onClick={async () => {
                    if (!bulkUploadFile) return;
                    setBulkUploading(true);
                    setBulkErrorMessage(null);
                    try {
                      const text = await bulkUploadFile.text();
                      const result = await customFetch<typeof bulkResult>("/api/company/bulk-invitations/upload", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ csvContent: text, fileName: bulkUploadFile.name }),
                      });
                      setBulkResult(result);
                      invalidateAll();
                    } catch (err: any) {
                      let msg = err?.message || "Upload failed. Please check your file and try again.";
                      try {
                        const parsed = JSON.parse(msg);
                        if (parsed.message) msg = parsed.message;
                      } catch {}
                      setBulkErrorMessage(msg);
                    } finally {
                      setBulkUploading(false);
                    }
                  }}
                >
                  {bulkUploading ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Processing…</>
                  ) : (
                    <><Upload className="h-4 w-4 mr-2" /> Upload & Send Invitations</>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 1: Invite Employee Dialog */}
      <InviteEmployeeDialog
        open={isInviteOpen}
        onOpenChange={setIsInviteOpen}
        pending={inviteEmployee.isPending}
        onInvite={async (formData) => {
          try {
            const result = await inviteEmployee.mutateAsync(formData);
            setIsInviteOpen(false);
            setCreatedInvite(result);
            invalidateAll();
            toast({
              title: "Invitation Created",
              description: `Invitation generated for ${formData.email}.`,
            });
          } catch (err: any) {
            toast({
              title: "Failed to invite employee",
              description: err.message || "Please check seat limit and subscription status.",
              variant: "destructive",
            });
          }
        }}
      />

      {/* MODAL 2: Invitation Created / Share Dialog */}
      <Dialog open={Boolean(createdInvite)} onOpenChange={(open) => !open && setCreatedInvite(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Invitation Link & Access Code Ready
            </DialogTitle>
          </DialogHeader>

          {createdInvite && (
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                An invitation has been generated for <strong>{createdInvite.email}</strong> with role <strong>{createdInvite.intendedRole}</strong>.
              </p>

              {/* Delivery notification notice */}
              <div className="p-3 rounded-lg border bg-muted/40 text-xs flex items-start gap-2.5">
                <Mail className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-foreground">Delivery Status: </span>
                  {createdInvite.emailSent ? (
                    <span className="text-emerald-700 dark:text-emerald-300">Email automatically dispatched to {createdInvite.email}.</span>
                  ) : (
                    <span className="text-muted-foreground">
                      Email delivery not configured in this environment. Share the link or access code below directly with the employee.
                    </span>
                  )}
                </div>
              </div>

              {/* Direct Invitation Link */}
              {createdInvite.invitationLink && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Direct Invitation Link (Pre-filled)
                  </label>
                  <div className="flex gap-2">
                    <Input readOnly value={createdInvite.invitationLink} className="font-mono text-xs select-all bg-muted/50" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(createdInvite.invitationLink!, "link")}
                      className="shrink-0"
                    >
                      {copiedLink ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                      <span className="ml-1.5">{copiedLink ? "Copied" : "Copy Link"}</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* Display Access Code */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Manual Access Code
                </label>
                <div className="flex items-center justify-between p-3 rounded-lg border bg-emerald-50/50 dark:bg-emerald-950/20">
                  <div className="font-mono text-lg font-bold text-emerald-900 dark:text-emerald-200">
                    {createdInvite.displayCode}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(createdInvite.displayCode, "code")}
                  >
                    {copiedCode ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Key className="h-4 w-4" />}
                    <span className="ml-1.5">{copiedCode ? "Copied" : "Copy Code"}</span>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Employees can enter this code at <strong>/join</strong> or during registration to join your company. Valid for 7 days.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setCreatedInvite(null)} className="w-full">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <EditEmployeeDialog
        open={Boolean(editing)}
        onOpenChange={(open) => !open && setEditing(null)}
        initial={editing ? {
          name: editing.name,
          email: editing.email,
          department: editing.department ?? "",
          jobTitle: editing.jobTitle ?? "",
          role: editing.role as any,
        } : EMPTY_EDIT_FORM}
        pending={updateEmployee.isPending}
        onSubmit={async (values) => {
          if (!editing) return;
          try {
            await updateEmployee.mutateAsync({ id: editing.id, data: values });
            setEditing(null);
            invalidateAll();
            toast({ title: "Employee updated" });
          } catch (err: any) {
            toast({
              title: "Failed to update employee",
              description: err.message || "Please try again.",
              variant: "destructive",
            });
          }
        }}
      />

      {/* Assign Training Dialog */}
      <AssignTrainingDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        employees={employees}
        courses={courses ?? []}
        departments={departments}
        selectedIds={selectedIds}
        pending={assignCourses.isPending}
        onAssign={async (payload) => {
          const result = await assignCourses.mutateAsync(payload);
          setAssignOpen(false);
          invalidateAll();
          toast({
            title: `Assigned ${result.assigned + (result.updated ?? 0)} training record${result.assigned + (result.updated ?? 0) === 1 ? "" : "s"}`,
            description: result.updated ? `${result.updated} existing assignment${result.updated === 1 ? "" : "s"} updated.` : undefined,
          });
        }}
      />

      {/* Smart Recommendation Dialog */}
      <SmartRecommendationDialog
        open={Boolean(recommendingEmployee)}
        onOpenChange={(open) => !open && setRecommendingEmployee(null)}
        employee={recommendingEmployee}
        onSuccessAssignment={() => invalidateAll()}
      />
    </Layout>
  );
}

// ─── Sub-Dialogs ─────────────────────────────────────────────────────────────

export const PRESET_DEPARTMENTS: {
  name: string;
  jobTitles: string[];
}[] = [
  {
    name: "Operations & Frontline",
    jobTitles: [
      "Operations Manager",
      "Site Supervisor",
      "Field Technician",
      "Line Operator",
      "Logistics & Stores Officer",
      "Frontline Team Member",
    ],
  },
  {
    name: "Facilities & Maintenance",
    jobTitles: [
      "Facilities Manager",
      "Maintenance Supervisor",
      "Building Engineer",
      "Health, Safety & Environment (HSE) Officer",
      "Property Officer",
    ],
  },
  {
    name: "Procurement & Supply Chain",
    jobTitles: [
      "Procurement Manager",
      "Purchasing Officer",
      "Buyer / Sourcing Specialist",
      "Supply Chain Coordinator",
      "Inventory Controller",
    ],
  },
  {
    name: "Human Resources & Administration",
    jobTitles: [
      "HR Manager",
      "HR Executive",
      "Training & Development Coordinator",
      "Office Administrator",
      "People & Culture Lead",
    ],
  },
  {
    name: "Finance & Accounting",
    jobTitles: [
      "CFO / Finance Director",
      "Finance Manager",
      "Senior Accountant",
      "Financial Analyst",
      "Accounts & Audit Officer",
    ],
  },
  {
    name: "Sales & Marketing",
    jobTitles: [
      "Sales Manager",
      "Marketing Executive",
      "Business Development Manager",
      "Brand & Communications Officer",
      "Client Relationship Specialist",
    ],
  },
  {
    name: "Executive & Management",
    jobTitles: [
      "Managing Director / CEO",
      "General Manager / COO",
      "Department Head",
      "Executive Director",
    ],
  },
  {
    name: "Sustainability & Green Team",
    jobTitles: [
      "Sustainability Champion",
      "Green Team Lead",
      "ESG Coordinator",
      "Environmental Officer",
    ],
  },
  {
    name: "General",
    jobTitles: ["Team Member", "Executive", "Associate", "Specialist"],
  },
];

function InviteEmployeeDialog({
  open,
  onOpenChange,
  pending,
  onInvite,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pending: boolean;
  onInvite: (data: typeof EMPTY_INVITE_FORM) => Promise<void>;
}) {
  const [form, setForm] = useState(EMPTY_INVITE_FORM);

  useEffect(() => {
    if (open) setForm(EMPTY_INVITE_FORM);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await onInvite(form);
          }}
        >
          <DialogHeader>
            <DialogTitle>Invite Employee to Join Company</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">First Name</label>
                <Input
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  placeholder="e.g. Marie"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Last Name</label>
                <Input
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  placeholder="e.g. Curie"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Work Email *</label>
              <Input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="colleague@company.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Department</label>
              <Select
                value={form.department}
                onValueChange={(val) => setForm({ ...form, department: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {PRESET_DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept.name} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Permitted Role *</label>
              <Select
                value={form.role}
                onValueChange={(val: any) => setForm({ ...form, role: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee (Learner)</SelectItem>
                  <SelectItem value="manager">Department Manager (Reports & Review)</SelectItem>
                  <SelectItem value="admin">Company Administrator (Full Access)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending || !form.email}>
              {pending ? "Generating Invitation..." : "Send / Generate Invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditEmployeeDialog({
  open,
  onOpenChange,
  initial,
  pending,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: typeof EMPTY_EDIT_FORM;
  pending: boolean;
  onSubmit: (data: typeof EMPTY_EDIT_FORM) => Promise<void>;
}) {
  const [form, setForm] = useState(initial);

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await onSubmit(form);
          }}
        >
          <DialogHeader>
            <DialogTitle>Edit Employee Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Full Name *</label>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Email *</label>
              <Input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Department</label>
              <Select
                value={form.department || "General"}
                onValueChange={(val) => setForm({ ...form, department: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {PRESET_DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept.name} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Job Title</label>
              <Input
                value={form.jobTitle || ""}
                onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                placeholder="e.g. Line Operator"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Role</label>
              <Select
                value={form.role}
                onValueChange={(val: any) => setForm({ ...form, role: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AssignTrainingDialog({
  open,
  onOpenChange,
  employees,
  courses,
  departments,
  selectedIds,
  pending,
  onAssign,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: ManagedEmployee[];
  courses: Course[];
  departments: string[];
  selectedIds: number[];
  pending: boolean;
  onAssign: (payload: { courseIds: number[]; employeeIds?: number[]; department?: string }) => Promise<void>;
}) {
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
  const [targetMode, setTargetMode] = useState<"selected" | "department" | "all">("selected");
  const [targetDepartment, setTargetDepartment] = useState("");

  const toggleCourse = (id: number) => {
    setSelectedCourseIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  };

  const handleAssign = async () => {
    if (selectedCourseIds.length === 0) return;
    const payload: { courseIds: number[]; employeeIds?: number[]; department?: string } = {
      courseIds: selectedCourseIds,
    };
    if (targetMode === "selected") {
      payload.employeeIds = selectedIds;
    } else if (targetMode === "department") {
      payload.department = targetDepartment;
    }
    await onAssign(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign Training Courses</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Assign To</label>
            <Select value={targetMode} onValueChange={(val: any) => setTargetMode(val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="selected" disabled={selectedIds.length === 0}>
                  Selected Employees ({selectedIds.length})
                </SelectItem>
                <SelectItem value="department">Entire Department</SelectItem>
                <SelectItem value="all">All Active Employees ({employees.length})</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {targetMode === "department" && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Department</label>
              <Select value={targetDepartment} onValueChange={setTargetDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase">
              Select Courses ({selectedCourseIds.length} chosen)
            </label>
            <div className="max-h-56 overflow-y-auto rounded-lg border p-2 space-y-1.5">
              {courses.map((course) => (
                <label
                  key={course.id}
                  className="flex items-center gap-2.5 p-2 rounded-md hover:bg-muted/50 cursor-pointer text-sm"
                >
                  <Checkbox
                    checked={selectedCourseIds.includes(course.id)}
                    onCheckedChange={() => toggleCourse(course.id)}
                  />
                  <span className="font-medium text-foreground">{course.title}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={pending || selectedCourseIds.length === 0 || (targetMode === "selected" && selectedIds.length === 0)}
          >
            {pending ? "Assigning..." : "Confirm Assignments"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
