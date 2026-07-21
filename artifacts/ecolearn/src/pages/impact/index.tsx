import { Layout } from "@/components/layout/Layout";
import { useGetImpactMetrics } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Users, Award, GraduationCap, Building2, TreePine, Wind, Heart, Ruler } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";

export default function ImpactDashboard() {
  const { data: metrics, isLoading } = useGetImpactMetrics();

  const fmt = (n?: number) => (n ?? 0).toLocaleString();
  const partner = metrics?.partnerName ?? "our reforestation partner";
  const hasActivity =
    !!metrics &&
    (metrics.treesPlanted > 0 ||
      metrics.coursesCompleted > 0 ||
      metrics.certificatesIssued > 0);

  return (
    <Layout>
      {/* Hero */}
      <div className="bg-primary/5 border-b py-12">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
            <Leaf className="h-6 w-6" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-serif mb-3">Our Collective Impact</h1>
          <p className="text-muted-foreground text-lg">
            Every course completed and every company that joins EcoLearn adds to a single,
            growing record of environmental and social impact across Mauritius. These numbers
            start at zero and reflect real action. Nothing here is simulated.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 space-y-12">
        {/* Environmental impact — tree planting */}
        <section>
          <div className="flex items-center gap-2 mb-1">
            <TreePine className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold font-serif">Environmental Impact</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            {metrics
              ? `${metrics.donationRatePct}% of every company subscription funds native tree planting with ${partner}.`
              : "A share of every subscription funds native tree planting in Mauritius."}
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Trees Planted", value: fmt(metrics?.treesPlanted), icon: TreePine, color: "text-green-700", bg: "bg-green-100" },
              { title: "Donated to Reforestation", value: `Rs ${fmt(metrics?.totalDonated)}`, icon: Heart, color: "text-rose-600", bg: "bg-rose-100" },
              { title: "CO₂ Sequestered / yr", value: `${fmt(metrics?.co2SequesteredKg)} kg`, icon: Wind, color: "text-sky-600", bg: "bg-sky-100" },
              { title: "Forest Restored", value: `${fmt(metrics?.areaReforestedM2)} m²`, icon: Ruler, color: "text-amber-600", bg: "bg-amber-100" },
            ].map((kpi, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${kpi.bg} ${kpi.color}`}>
                      <kpi.icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                      {isLoading ? (
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

        {/* Social impact — learning */}
        <section>
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold font-serif">Social Impact</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            Knowledge built across the Mauritian workforce, accumulated from real course completions.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Employees Trained", value: fmt(metrics?.employeesTrained), icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
              { title: "Courses Completed", value: fmt(metrics?.coursesCompleted), icon: GraduationCap, color: "text-indigo-600", bg: "bg-indigo-100" },
              { title: "Certificates Earned", value: fmt(metrics?.certificatesIssued), icon: Award, color: "text-purple-600", bg: "bg-purple-100" },
              { title: "Companies Participating", value: fmt(metrics?.companiesParticipating), icon: Building2, color: "text-teal-600", bg: "bg-teal-100" },
            ].map((kpi, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${kpi.bg} ${kpi.color}`}>
                      <kpi.icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                      {isLoading ? (
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

        {/* Trend + contributors */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Completions Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : metrics?.monthlyTrend && metrics.monthlyTrend.some((m) => m.completions > 0) ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metrics.monthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCompletions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                      <RechartsTooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }} />
                      <Area type="monotone" dataKey="completions" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorCompletions)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex flex-col items-center justify-center text-center text-muted-foreground gap-2">
                  <GraduationCap className="h-8 w-8 opacity-40" />
                  <p className="text-sm max-w-xs">No course completions recorded yet. This chart fills in as your teams finish their training.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reforestation Contributors</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : metrics?.topContributors && metrics.topContributors.length > 0 ? (
                <ul className="divide-y">
                  {metrics.topContributors.map((c, i) => (
                    <li key={i} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
                          {c.company.charAt(0)}
                        </div>
                        <span className="font-medium truncate">{c.company}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1.5 font-semibold text-green-700">
                          <TreePine className="h-4 w-4" /> {c.trees.toLocaleString()} trees
                        </div>
                        <div className="text-xs text-muted-foreground">Rs {c.donated.toLocaleString()} donated</div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="h-[300px] flex flex-col items-center justify-center text-center text-muted-foreground gap-2">
                  <TreePine className="h-8 w-8 opacity-40" />
                  <p className="text-sm max-w-xs">No reforestation contributions yet. Each new company subscription plants its first trees here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {!hasActivity && !isLoading && (
          <p className="text-center text-sm text-muted-foreground">
            EcoLearn is just getting started. These figures grow with every learner and every company that joins.
          </p>
        )}
      </div>
    </Layout>
  );
}
