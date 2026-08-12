import React, { useState } from "react";
import {
  useCompanyTrainingImpact,
  useCompanyWorkplaceActions,
  useReviewWorkplaceAction,
  WorkplaceActionRecord,
} from "../../lib/lms-api";

export const TrainingImpactPage: React.FC = () => {
  const { data: impactData, isLoading: isImpactLoading, isError: isImpactError } = useCompanyTrainingImpact();
  
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  const { data: actionsData, isLoading: isActionsLoading, refetch: refetchActions } = useCompanyWorkplaceActions({
    status: selectedStatus !== "all" ? selectedStatus : undefined,
    category: selectedCategory !== "all" ? selectedCategory : undefined,
  });

  const reviewAction = useReviewWorkplaceAction();

  const [reviewingItem, setReviewingItem] = useState<WorkplaceActionRecord | null>(null);
  const [reviewDecision, setReviewDecision] = useState<"confirm" | "request_followup" | "close">("confirm");
  const [managerNote, setManagerNote] = useState("");
  const [reviewError, setReviewError] = useState<string | null>(null);

  const handleExportCsv = () => {
    window.open("/api/company/workplace-actions/export", "_blank");
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingItem) return;

    try {
      setReviewError(null);
      await reviewAction.mutateAsync({
        commitmentId: reviewingItem.id,
        decision: reviewDecision,
        managerResponseNote: managerNote.trim() || undefined,
      });
      setReviewingItem(null);
      setManagerNote("");
      refetchActions();
    } catch (err: any) {
      setReviewError(err.message || "Failed to submit manager review");
    }
  };

  if (isImpactLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        <div className="h-8 w-64 bg-muted rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 bg-muted rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (isImpactError || !impactData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl text-center space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Training Impact & Behaviour Evidence</h2>
        <p className="text-sm text-muted-foreground">Unable to load company impact data right now.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg"
        >
          Reload Page
        </button>
      </div>
    );
  }

  const { summary, narrative } = impactData;
  const records = actionsData?.records ?? [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8 text-foreground">
      {/* HEADER & EXPORT */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Training Impact & Behaviour Evidence</h1>
          <p className="text-sm text-muted-foreground">
            Aggregate workplace commitments, follow-through reports, and manager reviews.
          </p>
        </div>
        <button
          onClick={handleExportCsv}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium border border-input bg-background hover:bg-accent rounded-lg transition-colors"
        >
          Export CSV Evidence
        </button>
      </div>

      {/* SUMMARY KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          title="Commitment Rate"
          value={`${(summary.commitmentRate * 100).toFixed(1)}%`}
          subtitle={`${summary.commitmentsCreated} / ${summary.eligibleCompletions} Completions`}
        />
        <MetricCard
          title="Follow-Through"
          value={`${(summary.actionFollowThroughRate * 100).toFixed(1)}%`}
          subtitle={`${summary.actionsReported} Reported Actions`}
        />
        <MetricCard
          title="Awaiting Review"
          value={String(summary.outstandingManagerReviews)}
          subtitle="Pending Manager Action"
          highlight={summary.outstandingManagerReviews > 0}
        />
        <MetricCard
          title="Manager Confirmed"
          value={String(summary.managerConfirmedActions)}
          subtitle="Manager Reviewed"
        />
        <MetricCard
          title="Follow-Up Needed"
          value={String(summary.followUpRequested)}
          subtitle="Requested Clarification"
        />
        <MetricCard
          title="Total Actions"
          value={String(summary.actionsReported)}
          subtitle="Self-Reported Total"
        />
      </div>

      {/* NARRATIVE SECTION */}
      {narrative && (
        <div className="p-6 bg-card border border-border rounded-xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Management Insights & Next Steps</h3>
            {narrative.isAiGenerated && (
              <span className="text-xs px-2.5 py-0.5 bg-primary/10 text-primary font-medium rounded-full">
                AI Interpretation
              </span>
            )}
          </div>
          <p className="text-sm leading-relaxed text-foreground">{narrative.summaryInterpretation}</p>
          <div className="pt-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Recommended Management Actions
            </span>
            <ul className="mt-1.5 space-y-1 text-xs text-muted-foreground">
              {narrative.suggestedManagementActions.map((act, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ESG CATEGORY BREAKDOWN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <EsgCategoryCard
          title="Environmental Workplace Actions"
          count={summary.esgBreakdown.environmental}
          categories={["Waste & Recycling", "Energy", "Water", "Procurement", "Biodiversity"]}
        />
        <EsgCategoryCard
          title="Social Workplace Actions"
          count={summary.esgBreakdown.social}
          categories={["Workplace Practice", "Community & Social"]}
        />
        <EsgCategoryCard
          title="Governance Workplace Actions"
          count={summary.esgBreakdown.governance}
          categories={["Governance & Ethics", "Other"]}
        />
      </div>

      {/* DEPARTMENT SUMMARY WITH PRIVACY THRESHOLD */}
      <div className="p-6 bg-card border border-border rounded-xl shadow-sm space-y-4">
        <h3 className="text-base font-semibold">Departmental Activity (Privacy Guarded)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(summary.departmentSummary).map(([dept, data]) => (
            <div key={dept} className="p-3 bg-muted/40 rounded-lg border border-border text-xs space-y-1">
              <span className="font-semibold text-foreground">{dept}</span>
              {data.suppressed ? (
                <p className="text-muted-foreground italic">
                  Data suppressed (below privacy threshold of 5 employees)
                </p>
              ) : (
                <p className="text-muted-foreground">
                  {data.commitmentCount} commitments ({data.employeeCount} employees)
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* WORKPLACE ACTIONS REVIEW QUEUE & LIST */}
      <div className="p-6 bg-card border border-border rounded-xl shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold">Workplace Action Records & Review Queue</h3>
            <p className="text-xs text-muted-foreground">
              Review self-reported employee progress and manage follow-ups.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-background border border-input rounded-lg text-xs"
            >
              <option value="all">All Statuses</option>
              <option value="action-reported">Awaiting Review</option>
              <option value="manager-confirmed">Confirmed</option>
              <option value="follow-up-requested">Follow-Up Requested</option>
              <option value="committed">Commitment Saved</option>
            </select>
          </div>
        </div>

        {isActionsLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading action records...</div>
        ) : records.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground bg-muted/20 rounded-lg border border-border">
            No workplace action records match the selected criteria.
          </div>
        ) : (
          <div className="divide-y divide-border border-t border-border">
            {records.map((item) => (
              <div key={item.id} className="py-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="space-x-2">
                    <span className="font-semibold text-foreground">{item.employeeName}</span>
                    <span className="text-muted-foreground">({item.department})</span>
                    <span className="text-muted-foreground">• {item.courseCode}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-accent text-accent-foreground rounded font-medium">
                    {item.status.replace("_", " ")}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-primary uppercase">{item.actionCategory}</span>
                  <p className="text-sm font-medium">{item.commitmentText}</p>
                </div>

                {item.employeeProgressNote && (
                  <div className="p-3 bg-muted/40 rounded-lg border border-border text-xs space-y-1">
                    <span className="font-semibold text-muted-foreground">Employee Reported Progress:</span>
                    <p className="text-foreground">{item.employeeProgressNote}</p>
                  </div>
                )}

                {item.managerResponseNote && (
                  <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 text-xs space-y-1">
                    <span className="font-semibold text-primary">Manager Note:</span>
                    <p className="text-foreground">{item.managerResponseNote}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                  <span>Reported: {item.actionReportedAt ? new Date(item.actionReportedAt).toLocaleDateString() : "Pending report"}</span>
                  {(item.status === "action-reported" || item.status === "completed_self_reported") && (
                    <button
                      onClick={() => {
                        setReviewingItem(item);
                        setReviewDecision("confirm");
                        setManagerNote("");
                        setReviewError(null);
                      }}
                      className="px-3 py-1 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90"
                    >
                      Review Action
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MANAGER REVIEW MODAL */}
      {reviewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-background border border-border rounded-xl shadow-xl p-6 space-y-4">
            <h3 className="text-lg font-bold">Review Workplace Action Report</h3>

            <div className="p-3 bg-muted/40 rounded-lg text-xs space-y-1">
              <span className="font-semibold text-muted-foreground">Employee Commitment:</span>
              <p className="font-medium text-foreground">{reviewingItem.commitmentText}</p>
              {reviewingItem.employeeProgressNote && (
                <>
                  <span className="font-semibold text-muted-foreground block pt-2">Reported Progress:</span>
                  <p className="text-foreground">{reviewingItem.employeeProgressNote}</p>
                </>
              )}
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Review Decision</label>
                <select
                  value={reviewDecision}
                  onChange={(e) => setReviewDecision(e.target.value as any)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm"
                >
                  <option value="confirm">Confirm Action (Manager Reviewed)</option>
                  <option value="request_followup">Request Follow-Up / Clarification</option>
                  <option value="close">Close Without Confirmation</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium">Manager Note (Optional)</label>
                <textarea
                  rows={3}
                  value={managerNote}
                  onChange={(e) => setManagerNote(e.target.value)}
                  placeholder="Add feedback or clarification instructions for the employee..."
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-xs placeholder:text-muted-foreground"
                />
              </div>

              <div className="p-3 bg-accent/50 rounded-lg border border-border text-xs text-muted-foreground">
                <span className="font-semibold block text-foreground mb-0.5">Manager Confirmation Disclaimer</span>
                This confirms that the report was reviewed by an authorised manager. It does not represent an independent environmental audit.
              </div>

              {reviewError && <p className="text-xs text-destructive">{reviewError}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewingItem(null)}
                  className="px-4 py-2 text-xs font-medium border border-input rounded-lg hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewAction.isPending}
                  className="px-4 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {reviewAction.isPending ? "Saving..." : "Submit Manager Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const MetricCard: React.FC<{
  title: string;
  value: string;
  subtitle: string;
  highlight?: boolean;
}> = ({ title, value, subtitle, highlight }) => (
  <div
    className={`p-4 rounded-xl border shadow-sm flex flex-col justify-between space-y-1 ${
      highlight ? "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-100" : "bg-card border-border text-card-foreground"
    }`}
  >
    <span className="text-xs font-medium text-muted-foreground">{title}</span>
    <span className="text-2xl font-bold tracking-tight">{value}</span>
    <span className="text-xs text-muted-foreground">{subtitle}</span>
  </div>
);

const EsgCategoryCard: React.FC<{
  title: string;
  count: number;
  categories: string[];
}> = ({ title, count, categories }) => (
  <div className="p-5 bg-card border border-border rounded-xl shadow-sm space-y-2">
    <div className="flex items-center justify-between">
      <h4 className="text-sm font-semibold">{title}</h4>
      <span className="text-sm font-bold px-2.5 py-0.5 bg-primary/10 text-primary rounded-full">{count}</span>
    </div>
    <p className="text-xs text-muted-foreground">Includes: {categories.join(", ")}</p>
  </div>
);
