import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Link, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { TrainingActionConfirmationModal } from "@/components/TrainingActionConfirmationModal";
import {
  useCompanyTrainingInsights,
  useOverdueLearners,
  useNotStartedLearners,
  useStrugglingLearners,
  useSendTrainingReminders,
  useFollowUpAuditHistory,
  type OverdueLearnerRecord,
  type NotStartedLearnerRecord,
  type StrugglingLearnerRecord,
  type FollowUpAuditRecord,
} from "@/lib/lms-api";
import {
  Clock,
  BookOpen,
  Brain,
  AlertTriangle,
  CheckCircle2,
  Users,
  Send,
  TrendingUp,
  ArrowLeft,
  Filter,
  History,
  RefreshCw,
  MailCheck,
  ChevronRight,
  Layers,
} from "lucide-react";

// ─── Tab Type ─────────────────────────────────────────────────────────────

type Tab = "overdue" | "not-started" | "struggling" | "history";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "overdue", label: "Overdue", icon: <Clock className="h-4 w-4" /> },
  { id: "not-started", label: "Not Started", icon: <BookOpen className="h-4 w-4" /> },
  { id: "struggling", label: "Needs Support", icon: <Brain className="h-4 w-4" /> },
  { id: "history", label: "Action History", icon: <History className="h-4 w-4" /> },
];

// ─── Subcomponents ────────────────────────────────────────────────────────

function SummaryBadge({ label, value, tone }: { label: string; value: number | string; tone: string }) {
  return (
    <div className={`rounded-xl border px-4 py-3 flex flex-col gap-0.5 ${tone}`}>
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function OverdueTab({
  learners,
  isLoading,
  onRemind,
}: {
  learners: OverdueLearnerRecord[];
  isLoading: boolean;
  onRemind: (ids: number[], courseId?: number) => void;
}) {
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggleAll = () => {
    if (selected.size === learners.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(learners.map((l) => l.employeeId)));
    }
  };

  const toggle = (id: number) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  if (learners.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-muted-foreground space-y-2">
        <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
        <p className="font-medium">No overdue assignments</p>
        <p>All learners are up-to-date with their training deadlines.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={selected.size === learners.length && learners.length > 0}
            onChange={toggleAll}
            className="rounded"
            id="overdue-select-all"
          />
          Select all ({learners.length})
        </label>
        {selected.size > 0 && (
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => onRemind(Array.from(selected))}
            id="overdue-send-reminders-btn"
          >
            <Send className="h-3.5 w-3.5" />
            Send Reminders ({selected.size})
          </Button>
        )}
      </div>

      {/* Learner rows */}
      <div className="space-y-2">
        {learners.map((l) => (
          <div
            key={`${l.employeeId}-${l.courseId}`}
            className="flex items-start gap-3 p-4 border rounded-xl bg-card hover:bg-muted/40 transition-colors"
          >
            <input
              type="checkbox"
              checked={selected.has(l.employeeId)}
              onChange={() => toggle(l.employeeId)}
              className="rounded mt-0.5"
              id={`overdue-check-${l.employeeId}-${l.courseId}`}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm">{l.employeeName}</span>
                <span className="text-xs text-muted-foreground">• {l.department}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {l.courseCode}: {l.courseTitle}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {l.daysOverdue}d overdue
              </span>
              {l.dueDate && (
                <span className="text-xs text-muted-foreground">
                  Due {new Date(l.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotStartedTab({
  learners,
  isLoading,
  onRemind,
}: {
  learners: NotStartedLearnerRecord[];
  isLoading: boolean;
  onRemind: (ids: number[], courseId?: number) => void;
}) {
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggleAll = () => {
    if (selected.size === learners.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(learners.map((l) => l.employeeId)));
    }
  };

  const toggle = (id: number) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  if (learners.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-muted-foreground space-y-2">
        <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
        <p className="font-medium">No unstarted assignments</p>
        <p>All assigned learners have begun their training.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={selected.size === learners.length && learners.length > 0}
            onChange={toggleAll}
            className="rounded"
            id="not-started-select-all"
          />
          Select all ({learners.length})
        </label>
        {selected.size > 0 && (
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => onRemind(Array.from(selected))}
            id="not-started-send-reminders-btn"
          >
            <Send className="h-3.5 w-3.5" />
            Send Welcome Nudge ({selected.size})
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {learners.map((l) => (
          <div
            key={`${l.employeeId}-${l.courseId}`}
            className="flex items-start gap-3 p-4 border rounded-xl bg-card hover:bg-muted/40 transition-colors"
          >
            <input
              type="checkbox"
              checked={selected.has(l.employeeId)}
              onChange={() => toggle(l.employeeId)}
              className="rounded mt-0.5"
              id={`not-started-check-${l.employeeId}-${l.courseId}`}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm">{l.employeeName}</span>
                <span className="text-xs text-muted-foreground">• {l.department}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {l.courseCode}: {l.courseTitle}
              </p>
            </div>
            {l.dueDate && (
              <span className="text-xs text-muted-foreground shrink-0">
                Due {new Date(l.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StrugglingTab({
  learners,
  isLoading,
}: {
  learners: StrugglingLearnerRecord[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  if (learners.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-muted-foreground space-y-2">
        <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
        <p className="font-medium">No struggling learners detected</p>
        <p>No employees have 2 or more failed quiz attempts at this time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {learners.map((l) => (
        <div
          key={`${l.employeeId}-${l.courseId}`}
          className="p-4 border rounded-xl bg-card hover:bg-muted/40 transition-colors"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm">{l.employeeName}</span>
                <span className="text-xs text-muted-foreground">• {l.department}</span>
                {l.passed && (
                  <span className="text-xs text-emerald-600 font-medium">Passed</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {l.courseCode}: {l.courseTitle}
              </p>
              <p className="text-xs text-muted-foreground mt-1 italic">
                {l.supportRecommendation}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                {l.totalAttempts} attempts
              </span>
              <span className="text-xs text-muted-foreground">
                Best score: {l.maxQuizScore}%
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function HistoryTab({
  history,
  isLoading,
}: {
  history: FollowUpAuditRecord[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 rounded-xl" />
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-muted-foreground space-y-2">
        <History className="h-10 w-10 text-muted-foreground/40 mx-auto" />
        <p className="font-medium">No follow-up actions yet</p>
        <p>Management actions (reminders sent, refreshers assigned) will appear here.</p>
      </div>
    );
  }

  const actionLabel: Record<string, string> = {
    "training.reminder_dispatched": "Reminder sent",
    "training.refresher_assigned": "Refresher assigned",
    "course.assigned": "Course assigned",
  };

  return (
    <div className="space-y-2">
      {history.map((record) => (
        <div
          key={record.id}
          className="flex items-start gap-3 p-3 border rounded-xl bg-card text-sm"
        >
          <MailCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="font-semibold">
              {actionLabel[record.action] || record.action}
            </span>
            <span className="text-muted-foreground ml-1.5 text-xs">
              by {record.actorRole}
            </span>
            {record.metadata && (record.metadata as any).courseTitle && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Course: {(record.metadata as any).courseTitle}
              </p>
            )}
          </div>
          <span className="text-xs text-muted-foreground shrink-0">
            {new Date(record.timestamp).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────

/**
 * Sprint 11B: AI-Assisted Training Follow-Up & Management Action Hub.
 * Provides drill-down learner lists (overdue, not-started, struggling) with
 * controlled bulk reminder dispatch and management audit history.
 */
export default function TrainingFollowUpPage() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const initialTab = (params.get("tab") as Tab) || "overdue";

  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const { toast } = useToast();

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ open: false, title: "", message: "", onConfirm: () => {} });

  // Data hooks
  const { data: insights } = useCompanyTrainingInsights();
  const { data: overdueData, isLoading: overdueLoading, refetch: refetchOverdue } = useOverdueLearners();
  const { data: notStartedData, isLoading: notStartedLoading, refetch: refetchNotStarted } = useNotStartedLearners();
  const { data: strugglingData, isLoading: strugglingLoading } = useStrugglingLearners();
  const { data: historyData, isLoading: historyLoading, refetch: refetchHistory } = useFollowUpAuditHistory();

  // Mutation
  const sendReminders = useSendTrainingReminders();

  const overdueLearners = overdueData?.learners ?? [];
  const notStartedLearners = notStartedData?.learners ?? [];
  const strugglingLearners = strugglingData?.learners ?? [];
  const history = historyData?.history ?? [];

  const handleRemind = (
    employeeIds: number[],
    category: "overdue" | "not_started",
    courseId?: number
  ) => {
    const label = category === "overdue" ? "overdue" : "unstarted";
    setConfirmModal({
      open: true,
      title: "Send Training Reminders?",
      message: `This will dispatch email reminders to ${employeeIds.length} employee(s) with ${label} training assignments. Reminders are rate-limited to once per 24 hours per learner.`,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, open: false }));
        try {
          const result = await sendReminders.mutateAsync({
            employeeIds,
            courseId,
            category,
            source: "training-insight",
          });
          toast({
            title: "Reminders dispatched",
            description: `${result.deliveredCount} delivered, ${result.skippedCount} skipped, ${result.failedCount} failed.`,
          });
          if (category === "overdue") refetchOverdue();
          else refetchNotStarted();
          refetchHistory();
        } catch {
          toast({
            title: "Dispatch failed",
            description: "Could not send reminders. Please try again.",
            variant: "destructive",
          });
        }
      },
    });
  };

  return (
    <Layout>
      {/* Page Header */}
      <div className="bg-primary/5 border-b py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Link href="/company">
                <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 mb-2 text-muted-foreground">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-3xl font-bold font-serif mb-1">Training Follow-Up Hub</h1>
              <p className="text-muted-foreground text-sm">
                Review learner progress, send reminders, and manage training interventions.
              </p>
            </div>

            {/* Summary badges */}
            {insights && (
              <div className="flex flex-wrap gap-3">
                <SummaryBadge
                  label="Overdue"
                  value={insights.organisationSummary.overdueLearnersCount}
                  tone="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                />
                <SummaryBadge
                  label="Not Started"
                  value={insights.organisationSummary.notStartedLearnersCount}
                  tone="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
                />
                <SummaryBadge
                  label="Needs Support"
                  value={insights.learnerRiskSummary.repeatQuizFailuresCount}
                  tone="bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Tab Bar */}
        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border mb-6 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-card shadow-sm text-foreground border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              id={`tab-${tab.id}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-card border rounded-2xl shadow-sm p-6">
          {activeTab === "overdue" && (
            <OverdueTab
              learners={overdueLearners}
              isLoading={overdueLoading}
              onRemind={(ids) => handleRemind(ids, "overdue")}
            />
          )}

          {activeTab === "not-started" && (
            <NotStartedTab
              learners={notStartedLearners}
              isLoading={notStartedLoading}
              onRemind={(ids) => handleRemind(ids, "not_started")}
            />
          )}

          {activeTab === "struggling" && (
            <StrugglingTab
              learners={strugglingLearners}
              isLoading={strugglingLoading}
            />
          )}

          {activeTab === "history" && (
            <HistoryTab history={history} isLoading={historyLoading} />
          )}
        </div>

        {/* Footer info */}
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            Scoped to your company's active employees
          </span>
          <Link href="/company/compliance">
            <Button variant="link" size="sm" className="h-auto p-0 text-xs gap-1">
              View Compliance Report <ChevronRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Confirmation Modal */}
      <TrainingActionConfirmationModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel="Send Reminders"
        isPending={sendReminders.isPending}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, open: false }))}
      />
    </Layout>
  );
}
