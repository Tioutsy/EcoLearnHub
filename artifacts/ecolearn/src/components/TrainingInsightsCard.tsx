import { useState } from "react";
import { Link } from "wouter";
import {
  useCompanyTrainingInsights,
  type CompanyTrainingInsights,
  type TrainingInsightAttentionItem,
  type TrainingInsightPositiveSignal,
} from "@/lib/lms-api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Users,
  BookOpen,
  RefreshCw,
  ArrowRight,
  Zap,
  Shield,
  Clock,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";

function PriorityBadge({ priority }: { priority: "high" | "medium" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${
        priority === "high"
          ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
          : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
      }`}
    >
      {priority === "high" ? "High" : "Medium"}
    </span>
  );
}

function ActionTypeIcon({ actionType }: { actionType: TrainingInsightAttentionItem["actionType"] }) {
  switch (actionType) {
    case "remind_overdue":
      return <Clock className="h-4 w-4 text-red-500" />;
    case "view_course_performance":
      return <BookOpen className="h-4 w-4 text-blue-500" />;
    case "manage_assignments":
      return <Shield className="h-4 w-4 text-amber-500" />;
    case "learner_checkin":
      return <Users className="h-4 w-4 text-purple-500" />;
    default:
      return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
  }
}

interface AttentionItemProps {
  item: TrainingInsightAttentionItem;
}

function AttentionItemRow({ item }: AttentionItemProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border rounded-xl overflow-hidden bg-card transition-all">
      <button
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-muted/40 transition-colors"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        id={`attention-item-${item.id}`}
      >
        <div className="mt-0.5">
          <ActionTypeIcon actionType={item.actionType} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{item.title}</span>
            <PriorityBadge priority={item.priority} />
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.explanation}</p>
        </div>
        <div className="shrink-0 text-muted-foreground">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t bg-muted/20">
          <p className="text-sm text-muted-foreground mt-3 mb-3">{item.explanation}</p>
          <div className="flex items-start gap-2 p-3 rounded-lg bg-background border mb-3">
            <Zap className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p className="text-sm font-medium">{item.recommendedAction}</p>
          </div>
          <Link href={item.targetUrl}>
            <Button size="sm" variant="outline" className="gap-1.5">
              Take Action <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

function PositiveSignalRow({ signal }: { signal: TrainingInsightPositiveSignal }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl border bg-card">
      <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-semibold">{signal.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{signal.explanation}</p>
      </div>
    </div>
  );
}

function InsightsContent({ insights }: { insights: CompanyTrainingInsights }) {
  const org = insights.organisationSummary;

  return (
    <div className="space-y-5">
      {/* AI Provider Tag */}
      {!insights.isFallback && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>AI-enhanced insights via Gemini</span>
        </div>
      )}

      {/* Summary */}
      <p className="text-sm text-muted-foreground leading-relaxed">{insights.summary}</p>

      {/* Organisation Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Active Learners",
            value: org.totalActiveLearners,
            icon: <Users className="h-4 w-4 text-blue-500" />,
          },
          {
            label: "Completion Rate",
            value: `${org.overallCompletionPct}%`,
            icon: <TrendingUp className="h-4 w-4 text-emerald-500" />,
          },
          {
            label: "Overdue",
            value: org.overdueLearnersCount,
            icon: <Clock className="h-4 w-4 text-red-500" />,
          },
          {
            label: "Not Started",
            value: org.notStartedLearnersCount,
            icon: <BookOpen className="h-4 w-4 text-amber-500" />,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col gap-1 bg-muted/40 rounded-xl p-3 border"
          >
            <div className="flex items-center gap-1.5">
              {stat.icon}
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <span className="text-xl font-bold">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Needs Attention */}
      {insights.needsAttention.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Needs Attention ({insights.needsAttention.length})
          </h4>
          <div className="space-y-2">
            {insights.needsAttention.map((item) => (
              <AttentionItemRow key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Positive Signals */}
      {insights.positiveSignals.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Positive Signals
          </h4>
          <div className="space-y-2">
            {insights.positiveSignals.map((signal) => (
              <PositiveSignalRow key={signal.id} signal={signal} />
            ))}
          </div>
        </div>
      )}

      {/* Recommended Next Action */}
      <div className="rounded-xl border bg-primary/5 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-primary">Recommended Next Action</span>
        </div>
        <p className="text-sm font-medium">{insights.recommendedNextAction.title}</p>
        <p className="text-xs text-muted-foreground">{insights.recommendedNextAction.description}</p>
        <Link href={insights.recommendedNextAction.actionUrl}>
          <Button size="sm" className="gap-1.5 mt-1" id="training-insights-primary-action">
            {insights.recommendedNextAction.actionLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {/* Footer: generated timestamp + follow-up link */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
        <span>
          Updated {new Date(insights.generatedAt).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        <Link href="/company/training-follow-up">
          <Button variant="link" size="sm" className="h-auto p-0 text-xs gap-1">
            Full Follow-Up Hub <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

interface TrainingInsightsCardProps {
  /** Optional className override for the outer wrapper */
  className?: string;
}

/**
 * Sprint 11A: AI Training Insights Card.
 * Renders deterministic training metrics with optional Gemini-enhanced narrative.
 * Accessible to company_admin and manager roles only — silently hides for employees.
 */
export function TrainingInsightsCard({ className }: TrainingInsightsCardProps) {
  const [forceRefresh, setForceRefresh] = useState(false);
  const { data: insights, isLoading, error, refetch } = useCompanyTrainingInsights(forceRefresh);

  const handleRefresh = () => {
    setForceRefresh(true);
    refetch().finally(() => setForceRefresh(false));
  };

  // Silently hide if 403 (employee role — not entitled to this card)
  if (error && (error as any)?.message?.includes("403")) {
    return null;
  }

  return (
    <div
      className={`bg-card border rounded-2xl shadow-sm overflow-hidden ${className ?? ""}`}
      id="training-insights-card"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/20">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-sm">AI Training Insights</h3>
            <p className="text-xs text-muted-foreground">Company-wide learning health</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={handleRefresh}
          disabled={isLoading}
          title="Refresh insights"
          id="training-insights-refresh-btn"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Body */}
      <div className="p-5">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <div className="grid grid-cols-4 gap-3 mt-4">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
        ) : error ? (
          <div className="text-center py-6 text-sm text-muted-foreground space-y-2">
            <AlertTriangle className="h-8 w-8 text-amber-400 mx-auto" />
            <p>Training insights are temporarily unavailable.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        ) : insights ? (
          <InsightsContent insights={insights} />
        ) : null}
      </div>
    </div>
  );
}
