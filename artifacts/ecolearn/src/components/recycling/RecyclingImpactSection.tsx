import { Link } from "wouter";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowRight, CalendarDays, Leaf, Recycle, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanyRecyclingSummary } from "@/lib/recycling-api";

const MATERIALS = [
  { key: "paperCardboardKg", label: "Paper/cardboard" },
  { key: "plasticKg", label: "Plastic" },
  { key: "glassKg", label: "Glass" },
  { key: "aluminiumMetalKg", label: "Aluminium/metal" },
  { key: "otherKg", label: "Other" },
] as const;

const tooltipStyle = {
  borderRadius: "8px",
  border: "1px solid hsl(var(--border))",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  fontSize: "12px",
};

function fmtKg(value: number): string {
  return `${value.toLocaleString("en-GB", { maximumFractionDigits: 3 })} kg`;
}

function fmtDate(value: string | null | undefined): string {
  if (!value) return "No collection yet";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function RecyclingImpactSection() {
  const { data, isLoading, isError, error } = useCompanyRecyclingSummary();
  const isActive = data?.profile.recyclingServiceStatus === "ACTIVE_CLIENT";
  const chartData = (data?.monthlyTrend ?? []).slice(-12);

  if (isLoading) {
    return (
      <div className="bg-card border rounded-xl p-6 shadow-sm mb-10">
        <div className="flex items-center gap-3 mb-5">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {Array(3)
            .fill(0)
            .map((_, index) => (
              <Skeleton key={index} className="h-24 w-full" />
            ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-card border rounded-xl p-6 shadow-sm mb-10">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Recycle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif">
              Recycling Impact unavailable
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {error instanceof Error
                ? error.message
                : "We could not load collection data right now."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isActive) {
    return (
      <div className="bg-card border rounded-xl p-6 shadow-sm mb-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif">
                Turn sustainability learning into measurable action
              </h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
                Add Recyclean collections to track verified monthly recycling
                weights alongside your training activity, with collection
                history kept inside your company account.
              </p>
              <div className="flex flex-wrap gap-2 mt-3 text-xs font-medium text-muted-foreground">
                <span className="rounded-full border px-3 py-1">
                  Monthly kg tracking
                </span>
                <span className="rounded-full border px-3 py-1">
                  Material breakdowns
                </span>
                <span className="rounded-full border px-3 py-1">
                  ESG-ready exports
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild>
              <Link href="/company/recycling">
                Enquire about Recyclean collection
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/insights/mauritius-resources">Learn more</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-xl p-6 shadow-sm mb-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
            <Recycle className="h-4 w-4" />
            Recyclean collection service
          </div>
          <h2 className="text-2xl font-bold font-serif">Recycling Impact</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Verified collection weights by month and material.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/company/recycling">
            View full history <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <CalendarDays className="h-4 w-4" />
            Current month
          </div>
          <div className="text-2xl font-bold">
            {fmtKg(data.currentMonth.totalKg)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {data.currentMonth.collectionsCount} collections • Latest{" "}
            {fmtDate(data.currentMonth.latestCollectionDate)}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Scale className="h-4 w-4" />
            Cumulative total
          </div>
          <div className="text-2xl font-bold">
            {fmtKg(data.cumulative.totalKg)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {data.cumulative.collectionsCount} collections recorded
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground mb-3">
            Material breakdown
          </div>
          <div className="space-y-2">
            {MATERIALS.map((material) => (
              <div
                key={material.key}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="text-muted-foreground">{material.label}</span>
                <span className="font-medium">
                  {fmtKg(data.cumulative.materialTotals[material.key])}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.35fr_1fr] gap-6">
        <div className="h-64 rounded-lg border p-4">
          {chartData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                />
                <RechartsTooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [`${value} kg`, "Collected"]}
                />
                <Bar
                  dataKey="totalKg"
                  fill="hsl(var(--primary))"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground text-center">
              Monthly trend will appear after collection records are added.
            </div>
          )}
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold mb-3">Recent collections</h3>
          {data.recentCollections.length ? (
            <div className="divide-y">
              {data.recentCollections.slice(0, 4).map((record) => (
                <div key={record.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium truncate">{record.siteName}</p>
                    <span className="text-sm font-semibold">
                      {fmtKg(record.totalKg)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {fmtDate(record.collectionDate)} • {record.reportingMonth}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No collection records yet.
            </div>
          )}
        </div>
      </div>

      {data.equivalents.length ? (
        <div className="mt-5 rounded-lg bg-primary/5 border p-4 text-sm">
          <p className="font-semibold mb-2">Estimated equivalents</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.equivalents.map((equivalent) => (
              <div key={equivalent.metricName} className="rounded-lg bg-background border p-3">
                <p className="font-medium">{equivalent.metricLabel}</p>
                <p className="text-lg font-bold">
                  Estimated {equivalent.value.toLocaleString("en-GB")}{" "}
                  {equivalent.unit}
                </p>
                <p className="text-xs text-muted-foreground">
                  Source: {equivalent.sourceName}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-4 text-xs text-muted-foreground">
          {data.equivalentsNote}
        </p>
      )}
    </div>
  );
}
