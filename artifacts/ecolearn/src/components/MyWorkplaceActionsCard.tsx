import React, { useState } from "react";
import { Link } from "wouter";
import {
  useLearnerWorkplaceActions,
  useReportWorkplaceAction,
  WorkplaceActionRecord,
} from "../lib/lms-api";

export const MyWorkplaceActionsCard: React.FC = () => {
  const { data: actions, isLoading, isError, error, refetch } = useLearnerWorkplaceActions();
  const reportAction = useReportWorkplaceAction();

  const [reportingId, setReportingId] = useState<number | null>(null);
  const [progressNote, setProgressNote] = useState("");
  const [reportError, setReportError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="p-6 bg-card border border-border rounded-xl shadow-sm text-card-foreground animate-pulse">
        <h3 className="text-lg font-semibold mb-1">My Workplace Actions</h3>
        <p className="text-sm text-muted-foreground">Loading your workplace actions…</p>
      </div>
    );
  }

  if (isError) {
    const isForbidden = (error as any)?.status === 403;
    return (
      <div className="p-6 bg-card border border-border rounded-xl shadow-sm text-card-foreground">
        <h3 className="text-lg font-semibold mb-1">My Workplace Actions</h3>
        <p className="text-sm text-muted-foreground mb-3">
          {isForbidden
            ? "Workplace actions are available for active company learners."
            : "We couldn’t load your workplace actions. Please try again."}
        </p>
        {!isForbidden && (
          <button
            onClick={() => refetch()}
            className="px-3 py-1.5 text-xs font-medium border border-input rounded-lg hover:bg-accent"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  const list = actions ?? [];

  if (list.length === 0) {
    return (
      <div className="p-6 bg-card border border-border rounded-xl shadow-sm text-card-foreground flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">My Workplace Actions</h3>
          <p className="text-sm text-muted-foreground">
            Complete a course and choose one practical action to apply at work. Your commitments and progress will appear here.
          </p>
        </div>
        <Link
          href="/courses"
          className="inline-flex items-center justify-center px-4 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shrink-0"
        >
          Explore Courses
        </Link>
      </div>
    );
  }

  const handleReportSubmit = async (commitmentId: number) => {
    try {
      setReportError(null);
      await reportAction.mutateAsync({
        commitmentId,
        progressNote: progressNote.trim() || undefined,
      });
      setReportingId(null);
      setProgressNote("");
      refetch();
    } catch (err: any) {
      setReportError(err.message || "Failed to submit progress note");
    }
  };

  return (
    <div className="p-6 bg-card border border-border rounded-xl shadow-sm text-card-foreground space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">My Workplace Actions</h3>
          <p className="text-xs text-muted-foreground">Track commitments and report practical workplace progress</p>
        </div>
        <span className="text-xs font-medium px-2.5 py-1 bg-accent rounded-full text-foreground">
          {list.length} {list.length === 1 ? "Commitment" : "Commitments"}
        </span>
      </div>

      <div className="divide-y divide-border">
        {list.map((item) => {
          const isReporting = reportingId === item.id;
          const statusBadge = getStatusBadge(item.status);

          return (
            <div key={item.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                  {item.actionCategory.replace("-", " ")}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusBadge.className}`}>
                  {statusBadge.label}
                </span>
              </div>

              <p className="text-sm font-medium leading-relaxed">{item.commitmentText}</p>

              {(item.employeeProgressNote || item.learnerReflection) && (
                <div className="p-3 bg-muted/50 rounded-lg border border-border text-xs space-y-1">
                  <span className="font-semibold text-muted-foreground">My Reported Progress:</span>
                  <p className="text-foreground">{item.employeeProgressNote || item.learnerReflection}</p>
                </div>
              )}

              {item.managerResponseNote && (
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 text-xs space-y-1">
                  <span className="font-semibold text-primary">Manager Note:</span>
                  <p className="text-foreground">{item.managerResponseNote}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
                <span>Created {new Date(item.createdAt).toLocaleDateString()}</span>
                {item.status === "committed" && !isReporting && (
                  <button
                    onClick={() => {
                      setReportingId(item.id);
                      setProgressNote("");
                      setReportError(null);
                    }}
                    className="px-3 py-1 font-medium bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors"
                  >
                    Report an action
                  </button>
                )}
              </div>

              {isReporting && (
                <div className="pt-2 space-y-2 bg-muted/30 p-3 rounded-lg border border-border">
                  <label className="text-xs font-medium text-foreground">
                    Action progress note (optional)
                  </label>
                  <textarea
                    rows={3}
                    value={progressNote}
                    onChange={(e) => setProgressNote(e.target.value)}
                    placeholder="Describe how you applied this commitment at work..."
                    className="w-full p-2 text-xs bg-background border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  {reportError && <p className="text-xs text-destructive">{reportError}</p>}
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setReportingId(null)}
                      className="px-3 py-1 text-xs font-medium border border-input rounded-lg hover:bg-accent"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={reportAction.isPending}
                      onClick={() => handleReportSubmit(item.id)}
                      className="px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                    >
                      {reportAction.isPending ? "Submitting..." : "Submit progress report"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

function getStatusBadge(status: string) {
  switch (status) {
    case "manager-confirmed":
    case "completed_manager_confirmed":
      return { label: "Manager Reviewed & Confirmed", className: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" };
    case "action-reported":
    case "completed_self_reported":
      return { label: "Awaiting Manager Review", className: "bg-amber-500/10 text-amber-600 border border-amber-500/20" };
    case "follow-up-requested":
      return { label: "Follow-Up Requested", className: "bg-blue-500/10 text-blue-600 border border-blue-500/20" };
    case "closed-without-confirmation":
      return { label: "Closed", className: "bg-muted text-muted-foreground border border-border" };
    case "committed":
    default:
      return { label: "Commitment Saved", className: "bg-primary/10 text-primary border border-primary/20" };
  }
}
