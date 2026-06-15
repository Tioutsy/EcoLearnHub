import { Layout } from "@/components/layout/Layout";
import {
  useListChallenges,
  useJoinChallenge,
  useLogChallengeProgress,
  getListChallengesQueryKey,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import {
  Target,
  Recycle,
  Zap,
  Droplets,
  Trash2,
  Trophy,
  Award,
  CheckCircle2,
  Plus,
  Calendar,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Challenge } from "@workspace/api-client-react";

const ICONS: Record<string, LucideIcon> = {
  recycle: Recycle,
  zap: Zap,
  droplets: Droplets,
  "trash-2": Trash2,
  target: Target,
};

const THEME: Record<
  string,
  { bg: string; text: string; bar: string; soft: string }
> = {
  cyan: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-600",
    bar: "bg-cyan-500",
    soft: "bg-cyan-500/5",
  },
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-600",
    bar: "bg-amber-500",
    soft: "bg-amber-500/5",
  },
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-600",
    bar: "bg-blue-500",
    soft: "bg-blue-500/5",
  },
  green: {
    bg: "bg-green-600/10",
    text: "text-green-700",
    bar: "bg-green-600",
    soft: "bg-green-600/5",
  },
};

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-green-600/10 text-green-700 border-green-600/30",
  },
  upcoming: {
    label: "Upcoming",
    className: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  },
  ended: {
    label: "Ended",
    className: "bg-muted text-muted-foreground border-transparent",
  },
};

function formatRange(startISO: string, endISO: string): string {
  const start = new Date(startISO);
  const end = new Date(endISO);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  return `${start.toLocaleDateString("en-GB", opts)} - ${end.toLocaleDateString("en-GB", { ...opts, year: "numeric" })}`;
}

function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const queryClient = useQueryClient();
  const theme = THEME[challenge.theme] ?? THEME.green;
  const Icon = ICONS[challenge.icon] ?? Target;
  const status = STATUS_LABEL[challenge.status] ?? STATUS_LABEL.ended;

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getListChallengesQueryKey() });

  const join = useJoinChallenge({ mutation: { onSuccess: invalidate } });
  const logProgress = useLogChallengeProgress({
    mutation: { onSuccess: invalidate },
  });

  const isPending = join.isPending || logProgress.isPending;

  return (
    <div className="bg-card border rounded-2xl overflow-hidden flex flex-col">
      <div className={`p-6 ${theme.soft} border-b`}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div
            className={`h-12 w-12 shrink-0 rounded-xl ${theme.bg} ${theme.text} flex items-center justify-center`}
          >
            <Icon className="h-6 w-6" />
          </div>
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full border ${status.className}`}
          >
            {status.label}
          </span>
        </div>
        <h2 className="font-bold font-serif text-xl mb-1">{challenge.title}</h2>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatRange(challenge.startDate, challenge.endDate)}
          </span>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground mb-4 flex-1">
          {challenge.description}
        </p>

        <div className="flex items-center gap-4 mb-4 text-sm">
          <span className="flex items-center gap-1.5 font-medium">
            <Trophy className={`h-4 w-4 ${theme.text}`} />
            {challenge.points} points
          </span>
          {challenge.badgeName && (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Award className="h-4 w-4" />
              {challenge.badgeName}
            </span>
          )}
        </div>

        {challenge.joined && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="font-medium">
                {challenge.progress} of {challenge.goalTarget} {challenge.unit}
              </span>
              <span className="text-muted-foreground">
                {challenge.progressPct}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full ${theme.bar} transition-all`}
                style={{ width: `${challenge.progressPct}%` }}
              />
            </div>
          </div>
        )}

        {challenge.completed ? (
          <Button variant="outline" className="w-full" disabled>
            <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
            Challenge completed
          </Button>
        ) : challenge.status === "ended" ? (
          <Button variant="outline" className="w-full" disabled>
            Challenge ended
          </Button>
        ) : !challenge.joined ? (
          <Button
            className="w-full"
            disabled={isPending}
            onClick={() => join.mutate({ id: challenge.id })}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {challenge.status === "upcoming" ? "Join when it starts" : "Join challenge"}
          </Button>
        ) : challenge.status === "active" ? (
          <Button
            className="w-full"
            disabled={isPending}
            onClick={() => logProgress.mutate({ id: challenge.id, data: { amount: 1 } })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Log an action
          </Button>
        ) : (
          <Button variant="outline" className="w-full" disabled>
            Starts soon
          </Button>
        )}
      </div>
    </div>
  );
}

export default function Challenges() {
  const { data, isLoading } = useListChallenges();

  return (
    <Layout>
      <div className="bg-primary/5 border-b py-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm font-medium text-primary mb-3">
            <Target className="h-4 w-4" />
            Monthly sustainability challenges
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-serif mb-2">Challenges</h1>
              <p className="text-muted-foreground max-w-2xl">
                Take part in focused sustainability drives across your
                organisation. Join a challenge, log your actions, and earn points
                and badges as your team builds greener habits.
              </p>
            </div>
            {!isLoading && data && (
              <div className="flex gap-4 shrink-0">
                <div className="bg-card border rounded-xl px-5 py-3 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {data.totalPoints}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Points earned
                  </div>
                </div>
                <div className="bg-card border rounded-xl px-5 py-3 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {data.completedCount}
                  </div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="border rounded-2xl p-6">
                  <Skeleton className="h-12 w-12 rounded-xl mb-4" />
                  <Skeleton className="h-6 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-4/5 mb-6" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
          </div>
        ) : data?.challenges.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed rounded-2xl bg-muted/10">
            <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">No challenges yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              New sustainability challenges will appear here once they are
              published.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data?.challenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
