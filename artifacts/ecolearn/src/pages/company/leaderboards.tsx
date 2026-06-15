import { Layout } from "@/components/layout/Layout";
import {
  useListLeaderboards,
  useGetMyCompany,
  useUpdateMyCompany,
  getListLeaderboardsQueryKey,
  getGetMyCompanyQueryKey,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import {
  Trophy,
  Clock,
  Award,
  GraduationCap,
  Gauge,
  Medal,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const BOARD_ICONS: Record<string, LucideIcon> = {
  "top-learners": Clock,
  "sustainability-champions": Award,
  "most-courses": GraduationCap,
  "highest-score": Gauge,
};

const RANK_STYLES: Record<number, string> = {
  1: "bg-amber-400/20 text-amber-700 border-amber-400/40",
  2: "bg-slate-300/30 text-slate-700 border-slate-400/40",
  3: "bg-orange-400/20 text-orange-700 border-orange-400/40",
};

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function CompanyLeaderboards() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useListLeaderboards();
  const { data: company } = useGetMyCompany();
  const updateCompany = useUpdateMyCompany({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMyCompanyQueryKey() });
        queryClient.invalidateQueries({
          queryKey: getListLeaderboardsQueryKey(),
        });
      },
    },
  });

  const enabled = company?.leaderboardEnabled ?? true;

  const handleToggle = (checked: boolean) => {
    updateCompany.mutate({ data: { leaderboardEnabled: checked } });
  };

  return (
    <Layout>
      <div className="bg-primary/5 border-b py-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm font-medium text-primary mb-3">
            <Trophy className="h-4 w-4" />
            Recognition and friendly competition
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-serif mb-2">
                Company Leaderboards
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                Celebrate the people driving your sustainability culture forward.
                Recognise top learners, champions, and high achievers across
                your organisation.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-card border rounded-lg px-4 py-3 shrink-0">
              <Switch
                id="leaderboard-toggle"
                checked={enabled}
                onCheckedChange={handleToggle}
                disabled={updateCompany.isPending}
              />
              <Label
                htmlFor="leaderboard-toggle"
                className="cursor-pointer text-sm font-medium"
              >
                {enabled ? "Leaderboards on" : "Leaderboards off"}
              </Label>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid lg:grid-cols-2 gap-8">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="border rounded-2xl p-6">
                  <Skeleton className="h-6 w-1/2 mb-4" />
                  {Array(5)
                    .fill(0)
                    .map((__, j) => (
                      <Skeleton key={j} className="h-12 w-full mb-2" />
                    ))}
                </div>
              ))}
          </div>
        ) : !data?.enabled ? (
          <div className="py-16 text-center border-2 border-dashed rounded-2xl bg-muted/10 max-w-xl mx-auto">
            <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">Leaderboards are turned off</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Leaderboards are currently hidden for your organisation. Turn them
              back on using the toggle above to recognise your top performers.
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {data.boards.map((board) => {
              const Icon = BOARD_ICONS[board.key] ?? Trophy;
              return (
                <div
                  key={board.key}
                  className="bg-card border rounded-2xl overflow-hidden flex flex-col"
                >
                  <div className="p-6 border-b">
                    <div className="flex items-start gap-3">
                      <div className="h-11 w-11 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="font-bold font-serif text-lg">
                          {board.title}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {board.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 flex-1">
                    {board.entries.length === 0 ? (
                      <div className="py-10 text-center text-sm text-muted-foreground">
                        <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
                        No results to rank yet.
                      </div>
                    ) : (
                      <ol className="space-y-1">
                        {board.entries.map((entry) => (
                          <li
                            key={entry.employeeId}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/40 transition-colors"
                          >
                            <div
                              className={`h-8 w-8 shrink-0 rounded-full border flex items-center justify-center text-sm font-bold ${
                                RANK_STYLES[entry.rank] ??
                                "bg-muted text-muted-foreground border-transparent"
                              }`}
                            >
                              {entry.rank <= 3 ? (
                                <Medal className="h-4 w-4" />
                              ) : (
                                entry.rank
                              )}
                            </div>
                            <div className="h-9 w-9 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                              {initials(entry.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {entry.name}
                              </p>
                              {entry.department && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {entry.department}
                                </p>
                              )}
                            </div>
                            <span className="text-sm font-semibold text-primary shrink-0">
                              {entry.valueLabel}
                            </span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
