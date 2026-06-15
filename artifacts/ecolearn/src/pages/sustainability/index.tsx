import { Layout } from "@/components/layout/Layout";
import {
  useGetMyCompany,
  useGetEsgImpact,
  useGetSustainabilityScore,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import {
  Leaf,
  TreePine,
  Wind,
  Trash2,
  Recycle,
  Droplets,
  Gauge,
  Building2,
  Lightbulb,
  ArrowRight,
  Award,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const LEVEL_STYLES: Record<string, { ring: string; text: string; bg: string }> = {
  Starter: { ring: "stroke-slate-400", text: "text-slate-600", bg: "bg-slate-100" },
  Bronze: { ring: "stroke-amber-700", text: "text-amber-800", bg: "bg-amber-100" },
  Silver: { ring: "stroke-slate-400", text: "text-slate-600", bg: "bg-slate-100" },
  Gold: { ring: "stroke-yellow-500", text: "text-yellow-700", bg: "bg-yellow-100" },
  Platinum: { ring: "stroke-cyan-500", text: "text-cyan-700", bg: "bg-cyan-100" },
};

function ScoreRing({ score, level }: { score: number; level: string }) {
  const style = LEVEL_STYLES[level] ?? LEVEL_STYLES.Starter;
  const r = 70;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <div className="relative h-44 w-44 shrink-0">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={r} className="stroke-muted" strokeWidth="12" fill="none" />
        <circle
          cx="80"
          cy="80"
          r={r}
          className={style.ring}
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold">{score}</span>
        <span className="text-sm text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

export default function SustainabilityImpact() {
  const { data: company, isLoading: isLoadingCompany } = useGetMyCompany();
  const { data: impact, isLoading: isLoadingImpact } = useGetEsgImpact();
  const { data: score, isLoading: isLoadingScore } = useGetSustainabilityScore();

  const fmt = (n?: number) => (n ?? 0).toLocaleString();
  const levelStyle = LEVEL_STYLES[score?.level ?? "Starter"] ?? LEVEL_STYLES.Starter;

  const headlineMetrics = [
    { title: "Trees Equivalent Saved", value: fmt(impact?.treesEquivalent), icon: TreePine, color: "text-green-700", bg: "bg-green-100" },
    { title: "CO₂ Equivalent Avoided / yr", value: `${fmt(impact?.co2EquivalentKg)} kg`, icon: Wind, color: "text-sky-600", bg: "bg-sky-100" },
    { title: "Waste Diverted / yr", value: `${fmt(impact?.wasteDivertedKg)} kg`, icon: Trash2, color: "text-amber-600", bg: "bg-amber-100" },
    { title: "Recycling Participation", value: `${fmt(impact?.recyclingParticipation)}%`, icon: Recycle, color: "text-emerald-600", bg: "bg-emerald-100" },
  ];

  const awarenessScores = [
    { title: "Plastic Reduction", value: impact?.plasticReductionScore ?? 0, icon: Trash2, color: "text-orange-600" },
    { title: "Water Savings Awareness", value: impact?.waterSavingsScore ?? 0, icon: Droplets, color: "text-blue-600" },
    { title: "Carbon Awareness", value: impact?.carbonAwarenessScore ?? 0, icon: Wind, color: "text-slate-600" },
    { title: "Sustainability Engagement", value: impact?.sustainabilityEngagementScore ?? 0, icon: Gauge, color: "text-violet-600" },
  ];

  return (
    <Layout>
      {/* Hero */}
      <div className="bg-primary/5 border-b py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Leaf className="h-5 w-5" />
                </div>
                <h1 className="text-3xl font-bold font-serif">Sustainability Impact</h1>
              </div>
              {isLoadingCompany ? (
                <Skeleton className="h-5 w-56" />
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground font-medium">
                  <Building2 className="h-4 w-4" />
                  {company?.name} • estimated ESG impact from training
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <a href="/api/esg/report"><FileText className="mr-2 h-4 w-4" /> Download ESG Training Report</a>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/company"><ArrowRight className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-10">
        {/* Sustainability Score */}
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-stretch">
              <div className="flex flex-col items-center justify-center text-center">
                {isLoadingScore ? (
                  <Skeleton className="h-44 w-44 rounded-full" />
                ) : (
                  <ScoreRing score={score?.score ?? 0} level={score?.level ?? "Starter"} />
                )}
                {!isLoadingScore && (
                  <div className={`mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full font-bold ${levelStyle.bg} ${levelStyle.text}`}>
                    <Award className="h-4 w-4" /> {score?.level} Level
                  </div>
                )}
              </div>

              <div className="flex-1 w-full">
                <h2 className="text-xl font-bold font-serif mb-1">EcoLearn Sustainability Score</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {score?.nextLevel
                    ? `${score.pointsToNextLevel} points to reach ${score.nextLevel} level.`
                    : "Top tier reached. Outstanding sustainability engagement."}
                </p>
                <div className="space-y-3">
                  {isLoadingScore
                    ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full" />)
                    : score?.components.map((c) => (
                        <div key={c.label}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">{c.label}</span>
                            <span className="font-semibold">{c.value}%</span>
                          </div>
                          <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                            <div className="bg-primary h-full rounded-full" style={{ width: `${c.value}%` }} />
                          </div>
                        </div>
                      ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold font-serif">How to Improve Your Score</h2>
            </div>
            {isLoadingScore ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <ul className="space-y-2">
                {score?.recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <div className="h-5 w-5 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Estimated impact */}
        <section>
          <h2 className="text-2xl font-bold font-serif mb-1">Estimated Environmental Impact</h2>
          <p className="text-muted-foreground mb-6 text-sm">
            Estimated from your team's completed training using standardized sustainability assumptions.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {headlineMetrics.map((kpi, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${kpi.bg} ${kpi.color}`}>
                      <kpi.icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                      {isLoadingImpact ? (
                        <Skeleton className="h-8 w-24 mt-1" />
                      ) : (
                        <h3 className="text-2xl font-bold truncate">{kpi.value}</h3>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Awareness scores */}
        <section>
          <h2 className="text-2xl font-bold font-serif mb-6">Awareness Scores</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {awarenessScores.map((kpi, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                    <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                  </div>
                  {isLoadingImpact ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <>
                      <h3 className="text-2xl font-bold mb-2">{kpi.value}<span className="text-sm text-muted-foreground"> / 100</span></h3>
                      <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: `${kpi.value}%` }} />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}
