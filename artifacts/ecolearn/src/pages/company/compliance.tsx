import { Layout } from "@/components/layout/Layout";
import {
  useGetManagerTrainingOverview,
  useGetManagerTrainingEmployees,
  useGetEmployeeTrainingDetail,
  type ManagerTrainingFilters,
} from "@/lib/manager-api";
import {
  useListEmployees,
  useListCourses,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useMemo, useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  CircleSlash,
  Download,
  ClipboardCheck,
  Trophy,
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  HelpCircle,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const ALL = "all";

const STATUS_META: Record<string, { label: string; className: string }> = {
  completed: {
    label: "Completed",
    className: "bg-green-500/10 text-green-700 border-green-500/30",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-blue-500/10 text-blue-700 border-blue-500/30",
  },
  not_started: {
    label: "Not Started",
    className: "bg-slate-400/10 text-slate-600 border-slate-400/30",
  },
};

function fmtDate(value: string | null | undefined): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function CompanyCompliance() {
  const { toast } = useToast();

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(ALL);
  const [certificationStatus, setCertificationStatus] = useState(ALL);
  const [role, setRole] = useState(ALL);
  const [courseId, setCourseId] = useState(ALL);
  const [department, setDepartment] = useState(ALL);
  const [overdue, setOverdue] = useState(ALL);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<any>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Detail Modal State
  const [detailEmployeeId, setDetailEmployeeId] = useState<number | null>(null);

  // Queries
  const { data: overview, isLoading: isLoadingOverview, error: overviewError, refetch: refetchOverview } = useGetManagerTrainingOverview();
  
  const filters: ManagerTrainingFilters = {
    search: search || undefined,
    status: status === ALL ? undefined : (status as any),
    certificationStatus: certificationStatus === ALL ? undefined : (certificationStatus as any),
    role: role === ALL ? undefined : role,
    courseId: courseId === ALL ? undefined : Number(courseId),
    department: department === ALL ? undefined : department,
    overdue: overdue === ALL ? undefined : overdue === "true",
    page,
    pageSize: 10,
    sortBy,
    sortDirection,
  };

  const { data: employeesData, isLoading: isLoadingEmployees, error: employeesError, refetch: refetchEmployees } = useGetManagerTrainingEmployees(filters);
  const { data: allEmployees } = useListEmployees();
  const { data: allCourses } = useListCourses();

  // Departments list for dropdown filter
  const departments = useMemo(() => {
    const set = new Set<string>();
    (allEmployees ?? []).forEach((e) => {
      if (e.department) set.add(e.department);
    });
    return Array.from(set).sort();
  }, [allEmployees]);

  const handleExport = () => {
    const searchParams = new URLSearchParams();
    if (search) searchParams.set("search", search);
    if (status !== ALL) searchParams.set("status", status);
    if (certificationStatus !== ALL) searchParams.set("certificationStatus", certificationStatus);
    if (role !== ALL) searchParams.set("role", role);
    if (courseId !== ALL) searchParams.set("courseId", courseId);
    if (department !== ALL) searchParams.set("department", department);
    if (overdue !== ALL) searchParams.set("overdue", overdue);

    window.open(`/api/manager/training/export.csv?${searchParams.toString()}`, "_blank");
    
    toast({
      title: "Exporting training records",
      description: "Your CSV download has been initiated.",
    });
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  const handleRetry = () => {
    refetchOverview();
    refetchEmployees();
  };

  const hasErrors = Boolean(overviewError || employeesError);

  return (
    <Layout>
      <div className="bg-primary/5 border-b py-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm font-medium text-primary mb-3">
            <ClipboardCheck className="h-4 w-4" />
            Manager Console
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-serif mb-2">Training Compliance</h1>
              <p className="text-muted-foreground max-w-2xl">
                Review employee progress across the EcoLearnHub core curriculum and export clear training records for internal reporting.
              </p>
            </div>
            <div className="shrink-0">
              <Button onClick={handleExport} className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" /> Export training records
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 space-y-8">
        {hasErrors ? (
          <div className="py-16 text-center border rounded-2xl bg-red-50/50 dark:bg-red-950/10">
            <ShieldAlert className="h-14 w-14 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">Failed to load training compliance data</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              There was an issue communicating with the training reporting service. Please check your connection and try again.
            </p>
            <Button onClick={handleRetry}>Retry loading dashboard</Button>
          </div>
        ) : (
          <>
            {/* Overview Stats Cards */}
            {isLoadingOverview ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-28 w-full rounded-xl" />
                  ))}
              </div>
            ) : (
              overview && (
                <div className="space-y-6">
                  {/* Overall Compliance Bar */}
                  <div className="bg-card border rounded-2xl p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Overall core curriculum compliance rate</p>
                        <p className="text-4xl font-bold font-serif text-primary mt-1">
                          {overview.overallCoreCompletionRate}%
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {overview.totalEmployees} active learners tracked
                      </p>
                    </div>
                    <Progress value={overview.overallCoreCompletionRate} className="h-2" />
                  </div>

                  {/* Summary Cards */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="bg-card border rounded-xl p-5 shadow-sm">
                      <div className="h-10 w-10 bg-blue-500/10 rounded flex items-center justify-center text-blue-600 mb-3">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <p className="text-2xl font-bold">{overview.inProgressCoreCount}</p>
                      <p className="text-sm text-muted-foreground">In progress</p>
                    </div>
                    <div className="bg-card border rounded-xl p-5 shadow-sm">
                      <div className="h-10 w-10 bg-green-500/10 rounded flex items-center justify-center text-green-600 mb-3">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <p className="text-2xl font-bold">{overview.completedCoreCount}</p>
                      <p className="text-sm text-muted-foreground">Core curriculum completed</p>
                    </div>
                    <div className="bg-card border rounded-xl p-5 shadow-sm">
                      <div className="h-10 w-10 bg-purple-500/10 rounded flex items-center justify-center text-purple-600 mb-3">
                        <Award className="h-5 w-5" />
                      </div>
                      <p className="text-2xl font-bold">{overview.certifiedCount}</p>
                      <p className="text-sm text-muted-foreground">Certified (Course 12)</p>
                    </div>
                    <div className="bg-card border rounded-xl p-5 shadow-sm">
                      <div className="h-10 w-10 bg-amber-500/10 rounded flex items-center justify-center text-amber-600 mb-3">
                        <Trophy className="h-5 w-5" />
                      </div>
                      <p className="text-2xl font-bold">{overview.achievements.employeesWithBadgesCount}</p>
                      <p className="text-sm text-muted-foreground">Employees with achievements</p>
                    </div>
                    <div className="bg-card border rounded-xl p-5 shadow-sm">
                      <div className="h-10 w-10 bg-orange-500/10 rounded flex items-center justify-center text-orange-600 mb-3">
                        <ShieldAlert className="h-5 w-5" />
                      </div>
                      <p className="text-2xl font-bold">{overview.overdueCount}</p>
                      <p className="text-sm text-muted-foreground">Overdue learners</p>
                    </div>
                  </div>

                  {/* Course Performance Breakdown Section */}
                  <div>
                    <h2 className="text-xl font-bold font-serif mb-4">Course compliance performance</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {overview.performance.map((c: any) => (
                        <div key={c.courseId} className="bg-card border rounded-xl p-5 shadow-sm">
                          <div className="flex items-start justify-between mb-2">
                            <p className="font-semibold line-clamp-1">{c.title}</p>
                            <Badge variant="secondary" className="shrink-0">{c.courseCode}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mb-3 space-y-1">
                            <p>{c.completed} completed • {c.inProgress} in progress</p>
                            <p>Average quiz score: {c.averageQuizScore ? `${c.averageQuizScore}%` : "-"}</p>
                            {c.courseId === 12 && (
                              <p className="text-purple-600 font-medium">EcoLearnHub Certifications: {c.certificationCount}</p>
                            )}
                          </div>
                          <Progress value={c.completionRate} className="h-2 mb-1" />
                          <p className="text-right text-xs font-semibold text-primary">{c.completionRate}% completion rate</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            )}

            {/* Filters Section */}
            <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Filter className="h-4 w-4" />
                Filters
              </div>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="search" className="text-xs">Search</Label>
                  <Input
                    id="search"
                    placeholder="Name or email..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="status" className="text-xs">Training status</Label>
                  <Select value={status} onValueChange={(val) => { setStatus(val); setPage(1); }}>
                    <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL}>All statuses</SelectItem>
                      <SelectItem value="completed">Completed core</SelectItem>
                      <SelectItem value="in_progress">In progress</SelectItem>
                      <SelectItem value="not_started">Not started</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cert" className="text-xs">Certification</Label>
                  <Select value={certificationStatus} onValueChange={(val) => { setCertificationStatus(val); setPage(1); }}>
                    <SelectTrigger id="cert"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL}>All certifications</SelectItem>
                      <SelectItem value="certified">Certified</SelectItem>
                      <SelectItem value="not_certified">Not certified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="dept" className="text-xs">Department</Label>
                  <Select value={department} onValueChange={(val) => { setDepartment(val); setPage(1); }}>
                    <SelectTrigger id="dept"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL}>All departments</SelectItem>
                      {departments.map((deptName) => (
                        <SelectItem key={deptName} value={deptName}>{deptName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="course" className="text-xs">Course completed</Label>
                  <Select value={courseId} onValueChange={(val) => { setCourseId(val); setPage(1); }}>
                    <SelectTrigger id="course"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL}>All courses</SelectItem>
                      {(allCourses ?? []).map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="overdue" className="text-xs">Overdue status</Label>
                  <Select value={overdue} onValueChange={(val) => { setOverdue(val); setPage(1); }}>
                    <SelectTrigger id="overdue"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL}>All timelines</SelectItem>
                      <SelectItem value="true">Overdue</SelectItem>
                      <SelectItem value="false">On time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Employee Training Records Table */}
            <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort("name")}>
                      Employee {sortBy === "name" && (sortDirection === "asc" ? "▲" : "▼")}
                    </TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort("email")}>
                      Email {sortBy === "email" && (sortDirection === "asc" ? "▲" : "▼")}
                    </TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="cursor-pointer select-none text-center" onClick={() => handleSort("progress")}>
                      Core Completed {sortBy === "progress" && (sortDirection === "asc" ? "▲" : "▼")}
                    </TableHead>
                    <TableHead className="cursor-pointer select-none text-center" onClick={() => handleSort("status")}>
                      Training Status {sortBy === "status" && (sortDirection === "asc" ? "▲" : "▼")}
                    </TableHead>
                    <TableHead className="text-center">Certification</TableHead>
                    <TableHead className="cursor-pointer select-none text-right" onClick={() => handleSort("lastActive")}>
                      Last Active {sortBy === "lastActive" && (sortDirection === "asc" ? "▲" : "▼")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingEmployees ? (
                    Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={8}><Skeleton className="h-6 w-full" /></TableCell>
                        </TableRow>
                      ))
                  ) : employeesData?.data?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                        No employees match the selected filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    employeesData?.data?.map((row: any) => {
                      const meta = STATUS_META[row.status] ?? STATUS_META.not_started;
                      return (
                        <TableRow
                          key={row.employeeId}
                          className="cursor-pointer hover:bg-muted/30"
                          onClick={() => setDetailEmployeeId(row.employeeId)}
                        >
                          <TableCell className="font-semibold">{row.name}</TableCell>
                          <TableCell className="text-muted-foreground">{row.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">{row.role}</Badge>
                          </TableCell>
                          <TableCell>{row.department ?? "-"}</TableCell>
                          <TableCell className="text-center">
                            <div className="space-y-1">
                              <p className="text-sm font-semibold">{row.coreCompletedCount} of 11</p>
                              <p className="text-xs text-muted-foreground">({row.individualCoreProgress}%)</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={`${meta.className}`}>
                              {meta.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {row.isCertified ? (
                              <Badge variant="default" className="bg-purple-600 hover:bg-purple-700 text-white border-transparent">
                                Certified
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">Not Certified</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground text-sm">
                            {fmtDate(row.lastActiveAt)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              {employeesData?.pagination && (
                <div className="border-t px-6 py-4 flex items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, employeesData.pagination.total)} of {employeesData.pagination.total} employees
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" /> Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= employeesData.pagination.totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Employee Detail Modal */}
      {detailEmployeeId !== null && (
        <EmployeeDetailDialog
          employeeId={detailEmployeeId}
          open={detailEmployeeId !== null}
          onOpenChange={(isOpen) => {
            if (!isOpen) setDetailEmployeeId(null);
          }}
        />
      )}
    </Layout>
  );
}

function EmployeeDetailDialog({
  employeeId,
  open,
  onOpenChange,
}: {
  employeeId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: detail, isLoading } = useGetEmployeeTrainingDetail(employeeId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif">Employee Training Record</DialogTitle>
          <DialogDescription>
            Detailed compliance activity log for {detail?.name ?? "Employee"}.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-8">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        ) : (
          detail && (
            <div className="space-y-6">
              {/* Employee Metadata */}
              <div className="grid sm:grid-cols-2 gap-4 bg-muted/30 p-4 border rounded-xl">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Email Address</p>
                  <p className="font-semibold">{detail.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Role / Title</p>
                  <p className="font-semibold capitalize">{detail.role} {detail.jobTitle ? `(${detail.jobTitle})` : ""}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Department</p>
                  <p className="font-semibold">{detail.department ?? "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Last Recorded Activity</p>
                  <p className="font-semibold">{fmtDate(detail.lastActiveAt)}</p>
                </div>
              </div>

              {/* Progress Summary */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="border rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground font-medium">Core Progress (1-11)</span>
                    <span className="text-sm font-semibold">{detail.completedCoreCount} of 11</span>
                  </div>
                  <Progress value={detail.individualCoreProgress} className="h-2" />
                  <p className="text-right text-xs text-muted-foreground">{detail.individualCoreProgress}% completed</p>
                </div>
                <div className="border rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground font-medium">Full Curriculum Progress</span>
                    <span className="text-sm font-semibold">{detail.fullCurriculumCompletedCount} of 12</span>
                  </div>
                  <Progress value={detail.fullCurriculumProgress} className="h-2" />
                  <p className="text-right text-xs text-muted-foreground">{detail.fullCurriculumProgress}% completed</p>
                </div>
              </div>

              {/* Course-by-Course Status */}
              <div>
                <h3 className="font-semibold mb-3 font-serif">Curriculum Courses</h3>
                <div className="bg-card border rounded-xl overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-center">Progress</TableHead>
                        <TableHead className="text-center">Quiz Score</TableHead>
                        <TableHead className="text-right">Completed Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detail.courseStatuses.map((course: any) => {
                        const meta = STATUS_META[course.status] ?? STATUS_META.not_started;
                        return (
                          <TableRow key={course.courseId}>
                            <TableCell className="font-semibold text-xs">{course.courseCode}</TableCell>
                            <TableCell>{course.title}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className={meta.className}>{meta.label}</Badge>
                            </TableCell>
                            <TableCell className="text-center text-sm font-semibold">
                              {course.progressPct}%
                            </TableCell>
                            <TableCell className="text-center font-medium">
                              {course.bestScore !== null ? `${course.bestScore}%` : "-"}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground text-sm">
                              {fmtDate(course.completedAt)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Achievements & Badges Grid */}
              {detail.badges.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 font-serif">Unlocked Badges ({detail.badges.length})</h3>
                  <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
                    {detail.badges.map((badge: any) => (
                      <div key={badge.id} className="bg-primary/5 border rounded-lg p-3 flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-amber-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate capitalize">{badge.awardSource.replace(/_/g, " ")}</p>
                          <p className="text-[10px] text-muted-foreground">{fmtDate(badge.earnedAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </DialogContent>
    </Dialog>
  );
}
