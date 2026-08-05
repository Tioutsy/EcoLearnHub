import { useState, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Building,
  FileText,
  AlertCircle,
  Loader2,
  Download,
  Search,
  Filter,
  BookOpen,
  Eye,
  ArrowLeft,
} from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/context/LanguageContext";

const ALL = "all";

const STATUS_META: Record<string, { label: string; className: string }> = {
  submitted: { label: "Awaiting Review", className: "bg-blue-500/10 text-blue-700 border-blue-500/30" },
  approved: { label: "Approved", className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30" },
  rejected: { label: "Returned", className: "bg-amber-500/10 text-amber-700 border-amber-500/30" },
  in_progress: { label: "In Progress", className: "bg-slate-400/10 text-slate-700 border-slate-400/30" },
};

interface ChallengeSubmission {
  submissionId: number;
  challengeId: number;
  challengeTitle: string;
  challengeCode: string | null;
  courseId: number | null;
  courseTitle: string | null;
  userId: string;
  employeeName: string;
  employeeDepartment: string | null;
  jobTitle: string | null;
  evidenceText: string | null;
  submittedAt: string | null;
  status: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  pointsAwarded: number;
}

function fmtDate(value: string | null | undefined): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtDateTime(value: string | null | undefined): string {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function csvValue(value: unknown): string {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export default function ChallengesReview() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const STATUS_META: Record<string, { label: string; className: string }> = {
    submitted: { label: t("admin.awaiting_review"), className: "bg-blue-500/10 text-blue-700 border-blue-500/30" },
    approved: { label: t("admin.approved"), className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30" },
    rejected: { label: t("admin.returned"), className: "bg-amber-500/10 text-amber-700 border-amber-500/30" },
    in_progress: { label: t("dashboard.status_in_progress"), className: "bg-slate-400/10 text-slate-700 border-slate-400/30" },
  };

  // Filters
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [departmentFilter, setDepartmentFilter] = useState(ALL);
  const [search, setSearch] = useState("");

  // UI state
  const [detailSub, setDetailSub] = useState<ChallengeSubmission | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryKey = ["/api/challenges/submissions", statusFilter];
  const { data: submissions, isLoading, isError, refetch } = useQuery<ChallengeSubmission[]>({
    queryKey,
    queryFn: () => {
      const qs = statusFilter !== ALL ? `?status=${statusFilter}` : "";
      return customFetch<ChallengeSubmission[]>(`/api/challenges/submissions${qs}`);
    },
  });

  // Derive department list for filter
  const departments = useMemo(() => {
    const set = new Set<string>();
    (submissions ?? []).forEach((s) => { if (s.employeeDepartment) set.add(s.employeeDepartment); });
    return Array.from(set).sort();
  }, [submissions]);

  // Client-side secondary filter (department + text search)
  const filtered = useMemo(() => {
    let rows = submissions ?? [];
    if (departmentFilter !== ALL) {
      rows = rows.filter((r) => r.employeeDepartment === departmentFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        (r) =>
          r.employeeName.toLowerCase().includes(q) ||
          r.challengeTitle.toLowerCase().includes(q) ||
          (r.courseTitle ?? "").toLowerCase().includes(q) ||
          (r.challengeCode ?? "").toLowerCase().includes(q)
      );
    }
    return rows;
  }, [submissions, departmentFilter, search]);

  // Summary counts (from unfiltered data)
  const counts = useMemo(() => ({
    pending: (submissions ?? []).filter((s) => s.status === "submitted").length,
    approved: (submissions ?? []).filter((s) => s.status === "approved").length,
    rejected: (submissions ?? []).filter((s) => s.status === "rejected").length,
  }), [submissions]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const invalidate = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ["/api/challenges/score"] });
  };

  const handleApprove = async (submissionId: number) => {
    setIsSubmitting(true);
    try {
      await customFetch(`/api/challenges/submissions/${submissionId}/review`, {
        method: "POST",
        body: JSON.stringify({ action: "approve" }),
      });
      toast({ title: "Submission Approved!", description: "Employee awarded 10 Challenge Points." });
      setDetailSub(null);
      invalidate();
    } catch (err: any) {
      toast({ title: "Approval failed", description: err.message || "Failed to approve.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailSub) return;
    if (!rejectNote.trim()) {
      toast({ title: "Note required", description: "Please add feedback for the employee.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await customFetch(`/api/challenges/submissions/${detailSub.submissionId}/review`, {
        method: "POST",
        body: JSON.stringify({ action: "reject", reviewNote: rejectNote.trim() }),
      });
      toast({ title: "Submission Returned", description: "Feedback sent to the employee." });
      setShowRejectModal(false);
      setDetailSub(null);
      setRejectNote("");
      invalidate();
    } catch (err: any) {
      toast({ title: "Failed to return", description: err.message || "Could not process.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportCsv = () => {
    const data = filtered;
    const header = [
      "Employee", "Department", "Job Title",
      "Challenge Code", "Challenge", "Course",
      "Submitted", "Status", "Reviewer", "Review Date",
      "Manager Note", "Points Awarded",
    ];
    const body = data.map((r) => [
      r.employeeName,
      r.employeeDepartment ?? "",
      r.jobTitle ?? "",
      r.challengeCode ?? "",
      r.challengeTitle,
      r.courseTitle ?? "",
      fmtDateTime(r.submittedAt),
      STATUS_META[r.status]?.label ?? r.status,
      r.reviewedBy ?? "",
      fmtDate(r.reviewedAt),
      r.reviewNote ?? "",
      r.pointsAwarded,
    ]);
    const csv = [header, ...body].map((line) => line.map(csvValue).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `challenge-reviews-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Layout>
      {/* Header */}
      <div className="bg-primary/5 border-b py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <Link href="/company" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to overview
          </Link>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
                <Trophy className="h-4 w-4" />
                Manager Review Area
              </div>
              <h1 className="text-3xl font-bold font-serif mb-2">Employee Challenge Reviews</h1>
              <p className="text-muted-foreground max-w-2xl">
                Review workplace action submissions from employees. Approve valid evidence to award points,
                or return submissions with feedback.
              </p>
            </div>
            <Button onClick={exportCsv} disabled={!filtered.length} variant="outline">
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">

        {/* Summary Cards — Workstream E */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-card border rounded-xl p-4 shadow-sm">
            <div className="text-2xl font-bold text-blue-700">
              {isLoading ? <Skeleton className="h-8 w-12" /> : counts.pending}
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
              <Clock className="h-3.5 w-3.5" /> Awaiting Review
            </div>
          </div>
          <div className="bg-card border rounded-xl p-4 shadow-sm">
            <div className="text-2xl font-bold text-emerald-700">
              {isLoading ? <Skeleton className="h-8 w-12" /> : counts.approved}
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Approved
            </div>
          </div>
          <div className="bg-card border rounded-xl p-4 shadow-sm col-span-2 sm:col-span-1">
            <div className="text-2xl font-bold text-amber-700">
              {isLoading ? <Skeleton className="h-8 w-12" /> : counts.rejected}
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
              <XCircle className="h-3.5 w-3.5" /> Returned
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold mb-4">
            <Filter className="h-4 w-4 text-primary" /> Filters
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status-filter"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All submissions</SelectItem>
                <SelectItem value="submitted">Awaiting Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Returned</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={departmentFilter}
              onValueChange={setDepartmentFilter}
              disabled={departments.length === 0}
            >
              <SelectTrigger id="dept-filter"><SelectValue placeholder="Department" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All departments</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="challenge-search"
                placeholder="Search employee, challenge, course…"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Submissions table */}
        <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Challenge</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reviewer</TableHead>
                  <TableHead className="sr-only">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-36" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-44" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2 text-destructive">
                        <AlertCircle className="h-6 w-6" />
                        <p className="text-sm font-medium">Failed to load submissions.</p>
                        <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-40 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Clock className="h-10 w-10 opacity-30" />
                        <p className="font-medium">
                          {(submissions ?? []).length === 0
                            ? "No challenge submissions have been received yet."
                            : "No submissions match the current filters."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((sub) => {
                    const meta = STATUS_META[sub.status] ?? STATUS_META.submitted;
                    return (
                      <TableRow
                        key={sub.submissionId}
                        className="cursor-pointer hover:bg-muted/40 transition-colors"
                        onClick={() => setDetailSub(sub)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <div>
                              <div className="font-medium text-sm">{sub.employeeName}</div>
                              {sub.employeeDepartment && (
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Building className="h-3 w-3" />{sub.employeeDepartment}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[180px]">
                          <div className="text-sm font-medium">{sub.challengeTitle}</div>
                          {sub.challengeCode && (
                            <div className="text-xs font-mono text-muted-foreground">{sub.challengeCode}</div>
                          )}
                        </TableCell>
                        <TableCell className="min-w-[160px]">
                          {sub.courseTitle ? (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <BookOpen className="h-3.5 w-3.5 shrink-0" />
                              <span className="line-clamp-2">{sub.courseTitle}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {fmtDate(sub.submittedAt)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={meta.className}>
                            {meta.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {sub.reviewedBy ? (
                            <div>
                              <div>{fmtDate(sub.reviewedAt)}</div>
                            </div>
                          ) : "—"}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="gap-1.5">
                            <Eye className="h-3.5 w-3.5" />
                            {sub.status === "submitted" ? "Review" : "View"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Detail / Review Dialog */}
      <Dialog open={detailSub !== null} onOpenChange={(open) => { if (!open) setDetailSub(null); }}>
        <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
          {detailSub && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-1">
                  <FileText className="h-3.5 w-3.5" />
                  Challenge Submission Detail
                </div>
                <DialogTitle className="text-xl font-serif font-bold">
                  {detailSub.challengeTitle}
                </DialogTitle>
                <DialogDescription asChild>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs">
                    <span className="flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      {detailSub.challengeCode ?? "Challenge"}
                    </span>
                    <span className="flex items-center gap-1.5 font-semibold text-foreground">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      {detailSub.employeeName}
                    </span>
                    {detailSub.employeeDepartment && (
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Building className="h-3.5 w-3.5" />
                        {detailSub.employeeDepartment}
                      </span>
                    )}
                    {detailSub.courseTitle && (
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <BookOpen className="h-3.5 w-3.5" />
                        {detailSub.courseTitle}
                      </span>
                    )}
                  </div>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 my-2">
                {/* Submission date + status */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground block">Submitted</span>
                    <span className="font-medium">{fmtDateTime(detailSub.submittedAt)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Status</span>
                    <Badge variant="outline" className={STATUS_META[detailSub.status]?.className ?? ""}>
                      {STATUS_META[detailSub.status]?.label ?? detailSub.status}
                    </Badge>
                  </div>
                  {detailSub.reviewedAt && (
                    <div>
                      <span className="text-xs text-muted-foreground block">Reviewed</span>
                      <span className="font-medium">{fmtDate(detailSub.reviewedAt)}</span>
                    </div>
                  )}
                  {detailSub.pointsAwarded > 0 && (
                    <div>
                      <span className="text-xs text-muted-foreground block">Points Awarded</span>
                      <span className="font-bold text-emerald-700">+{detailSub.pointsAwarded}</span>
                    </div>
                  )}
                </div>

                {/* Evidence text */}
                <div className="bg-muted/40 border border-border/80 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    <FileText className="h-3.5 w-3.5" />
                    Action Evidence &amp; Reflection
                  </div>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                    {detailSub.evidenceText ?? <span className="italic text-muted-foreground">No evidence submitted.</span>}
                  </p>
                </div>

                {/* Existing reviewer note */}
                {detailSub.reviewNote && (
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                    <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1">Manager Note (visible to employee)</div>
                    <p className="text-sm text-amber-900 leading-relaxed">{detailSub.reviewNote}</p>
                  </div>
                )}
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setDetailSub(null)}
                  className="sm:mr-auto"
                >
                  Close
                </Button>
                {detailSub.status === "submitted" && (
                  <>
                    <Button
                      variant="outline"
                      disabled={isSubmitting}
                      onClick={() => { setRejectNote(""); setShowRejectModal(true); }}
                      className="border-amber-500/30 bg-amber-500/5 text-amber-800 hover:bg-amber-500/10"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Return with Feedback
                    </Button>
                    <Button
                      disabled={isSubmitting}
                      onClick={() => handleApprove(detailSub.submissionId)}
                    >
                      {isSubmitting
                        ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Approving…</>
                        : <><CheckCircle2 className="mr-2 h-4 w-4" /> Approve</>}
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject / Return feedback modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="max-w-md">
          {detailSub && (
            <form onSubmit={handleRejectSubmit}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-amber-800 font-serif">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                  Return Submission for Revision
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-1">
                  Explain what information is missing. The note will be visible to the employee.
                </DialogDescription>
              </DialogHeader>

              <div className="my-5 space-y-4">
                <div className="text-xs">
                  <span className="font-semibold text-foreground">Employee:</span> {detailSub.employeeName}<br />
                  <span className="font-semibold text-foreground">Challenge:</span> {detailSub.challengeTitle}
                </div>
                <div className="space-y-2">
                  <label htmlFor="rejectNote" className="text-xs font-bold text-foreground block">
                    Reviewer Note (visible to employee):
                  </label>
                  <Textarea
                    id="rejectNote"
                    required
                    placeholder="e.g. Please provide more detail about the specific actions you took…"
                    className="min-h-[100px] text-xs"
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowRejectModal(false)}>Cancel</Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {isSubmitting
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Returning…</>
                    : "Send Feedback & Return"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
