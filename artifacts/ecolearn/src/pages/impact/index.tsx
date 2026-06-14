import { Layout } from "@/components/layout/Layout";
import { useGetImpactMetrics, useGetDepartmentBreakdown } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Users, Award, Trash2, Recycle } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

export default function ImpactDashboard() {
  const { data: metrics, isLoading: isLoadingMetrics } = useGetImpactMetrics();
  const { data: deptData, isLoading: isLoadingDept } = useGetDepartmentBreakdown();

  const COLORS = ['hsl(155, 45%, 25%)', 'hsl(210, 80%, 40%)', 'hsl(40, 33%, 70%)', 'hsl(155, 20%, 50%)', 'hsl(0, 84%, 60%)'];

  return (
    <Layout>
      <div className="bg-primary/5 border-b py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-serif mb-2">Environmental Impact</h1>
              <p className="text-muted-foreground">Track your organization's sustainability ROI and educational outcomes.</p>
            </div>
            {metrics && (
              <div className="bg-white px-4 py-2 rounded-lg border shadow-sm flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Leaf className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">ESG Score</div>
                  <div className="text-xl font-bold text-primary">{metrics.environmentalScore}/100</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* KPI Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "CO2 Avoided",
              value: `${metrics?.co2AvoidedKg || 0} kg`,
              icon: Leaf,
              color: "text-green-600",
              bg: "bg-green-100"
            },
            {
              title: "Waste Diverted",
              value: `${metrics?.kgWasteDiverted || 0} kg`,
              icon: Trash2,
              color: "text-amber-600",
              bg: "bg-amber-100"
            },
            {
              title: "Employees Trained",
              value: metrics?.employeesTrained || 0,
              icon: Users,
              color: "text-blue-600",
              bg: "bg-blue-100"
            },
            {
              title: "Recycling Rate",
              value: `${metrics?.recyclingParticipationPct || 0}%`,
              icon: Recycle,
              color: "text-purple-600",
              bg: "bg-purple-100"
            }
          ].map((kpi, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${kpi.bg} ${kpi.color}`}>
                    <kpi.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                    {isLoadingMetrics ? (
                      <Skeleton className="h-8 w-24 mt-1" />
                    ) : (
                      <h3 className="text-2xl font-bold">{kpi.value}</h3>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Training Completions Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingMetrics ? (
                <Skeleton className="h-[300px] w-full" />
              ) : metrics?.monthlyTrend ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metrics.monthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCompletions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{fontSize: 12, fill: 'hsl(var(--muted-foreground))'}} />
                      <YAxis tickLine={false} axisLine={false} tick={{fontSize: 12, fill: 'hsl(var(--muted-foreground))'}} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="completions" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorCompletions)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">No data available</div>
              )}
            </CardContent>
          </Card>

          {/* Department Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Completion Rate by Department</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingDept ? (
                <Skeleton className="h-[300px] w-full" />
              ) : deptData && deptData.length > 0 ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deptData} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <XAxis type="number" domain={[0, 100]} tickLine={false} axisLine={false} tick={{fontSize: 12, fill: 'hsl(var(--muted-foreground))'}} />
                      <YAxis dataKey="department" type="category" width={100} tickLine={false} axisLine={false} tick={{fontSize: 12}} />
                      <RechartsTooltip 
                        cursor={{fill: 'hsl(var(--muted)/0.5)'}}
                        contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                      />
                      <Bar dataKey="completionRate" name="Completion Rate (%)" radius={[0, 4, 4, 0]}>
                        {deptData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">No department data available</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}