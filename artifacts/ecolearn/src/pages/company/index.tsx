import { Layout } from "@/components/layout/Layout";
import {
  useGetMyCompany,
  useGetDashboardStats,
  useGetCompletionTrend,
  useGetDepartmentParticipation,
  useGetSustainabilityScore,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  Building2,
  Users,
  GraduationCap,
  Award,
  Settings,
  ArrowRight,
  TrendingUp,
  Target,
  ClipboardList,
  ClipboardCheck,
  CheckCircle2,
  Clock,
  Gauge,
  AlertTriangle,
  Leaf,
  FileText,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

const axisTick = { fontSize: 12, fill: "hsl(var(--muted-foreground))" };
const tooltipStyle = {
  borderRadius: "8px",
  border: "1px solid hsl(var(--border))",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  fontSize: "12px",
};

interface KpiCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  icon: React.ReactNode;
  tone: string;
  loading: boolean;
  hint?: string;
}

function KpiCard({ label, value, suffix, icon, tone, loading, hint }: KpiCardProps) {
  return (
    <div className="bg-card border rounded-xl p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${tone}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="h-7 w-16 mt-1" />
          ) : (
            <div className="flex items-baseline gap-1">
              <h3 className="text-2xl font-bold">{value}</h3>
              {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
            </div>
          )}
          {hint && !loading && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
        </div>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactElement;
}) {
  return (
    <div className="bg-card border rounded-xl p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="font-bold font-serif">{title}</h3>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function CompanyDashboard() {
  const { data: company, isLoading: isLoadingCompany } = useGetMyCompany();
  const { data: stats, isLoading: isLoadingStats } = useGetDashboardStats();
  const { data: trend, isLoading: isLoadingTrend } = useGetCompletionTrend();
  const { data: departments, isLoading: isLoadingDepts } = useGetDepartmentParticipation();
  const { data: score, isLoading: isLoadingScore } = useGetSustainabilityScore();

  const trendData = trend ?? [];
  const deptData = departments ?? [];

  const levelTone: Record<string, string> = {
    Starter: "bg-slate-100 text-slate-700",
    Bronze: "bg-amber-100 text-amber-800",
    Silver: "bg-slate-200 text-slate-700",
    Gold: "bg-yellow-100 text-yellow-700",
    Platinum: "bg-cyan-100 text-cyan-700",
  };

  return (
    <Layout>
      <div className="bg-primary/5 border-b py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-serif mb-2">Company Overview</h1>
              {isLoadingCompany ? (
                <Skeleton className="h-6 w-48" />
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground font-medium">
                  <Building2 className="h-4 w-4" />
                  {company?.name} • {company?.industry}
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {!isLoadingScore && score && (
                <Link href="/company/sustainability">
                  <div className="flex items-center gap-3 bg-card border rounded-xl pl-3 pr-4 py-2 shadow-sm hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                      {score.score}
                    </div>
                    <div className="leading-tight">
                      <p className="text-xs text-muted-foreground">Sustainability Score</p>
                      <span className={`inline-block text-sm font-bold px-2 py-0.5 rounded-full ${levelTone[score.level] ?? levelTone.Starter}`}>
                        {score.level}
                      </span>
                    </div>
                  </div>
                </Link>
              )}
              <Button asChild>
                <a href="/api/esg/report"><FileText className="mr-2 h-4 w-4" /> ESG Training Report</a>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/company/employees"><Users className="mr-2 h-4 w-4" /> Manage Employees</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Executive KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-10">
          <KpiCard
            label="Total Employees"
            value={stats?.totalEmployees ?? 0}
            suffix={company?.maxEmployees ? `/ ${company.maxEmployees}` : undefined}
            icon={<Users className="h-5 w-5" />}
            tone="bg-primary/10 text-primary"
            loading={isLoadingStats}
          />
          <KpiCard
            label="Active Learners"
            value={stats?.activeEmployees ?? 0}
            icon={<GraduationCap className="h-5 w-5" />}
            tone="bg-secondary/10 text-secondary"
            loading={isLoadingStats}
          />
          <KpiCard
            label="Certificates Earned"
            value={stats?.certificatesIssued ?? 0}
            icon={<Award className="h-5 w-5" />}
            tone="bg-green-500/10 text-green-600"
            loading={isLoadingStats}
          />
          <KpiCard
            label="Needs Retraining"
            value={stats?.employeesNeedingRetraining ?? 0}
            icon={<AlertTriangle className="h-5 w-5" />}
            tone="bg-amber-500/10 text-amber-600"
            loading={isLoadingStats}
          />
          <KpiCard
            label="Completion Rate"
            value={stats?.completionRate ?? 0}
            suffix="%"
            icon={<Target className="h-5 w-5" />}
            tone="bg-blue-500/10 text-blue-600"
            loading={isLoadingStats}
          />
          <KpiCard
            label="Average Score"
            value={stats?.avgScore ?? 0}
            suffix="%"
            icon={<Gauge className="h-5 w-5" />}
            tone="bg-violet-500/10 text-violet-600"
            loading={isLoadingStats}
          />
          <KpiCard
            label="Courses Assigned"
            value={stats?.coursesAssigned ?? 0}
            icon={<ClipboardList className="h-5 w-5" />}
            tone="bg-sky-500/10 text-sky-600"
            loading={isLoadingStats}
          />
          <KpiCard
            label="Courses Completed"
            value={stats?.coursesCompleted ?? 0}
            icon={<CheckCircle2 className="h-5 w-5" />}
            tone="bg-emerald-500/10 text-emerald-600"
            loading={isLoadingStats}
          />
          <KpiCard
            label="Learning Hours"
            value={stats?.learningHoursCompleted ?? 0}
            suffix="hrs"
            icon={<Clock className="h-5 w-5" />}
            tone="bg-orange-500/10 text-orange-600"
            loading={isLoadingStats}
          />
          <KpiCard
            label="Training Adoption"
            value={stats?.trainingAdoptionRate ?? 0}
            suffix="%"
            icon={<TrendingUp className="h-5 w-5" />}
            tone="bg-teal-500/10 text-teal-600"
            loading={isLoadingStats}
          />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-10">
          <ChartCard title="Monthly Completion Rate" subtitle="Share of assigned training completed, last 12 months">
            {isLoadingTrend ? (
              <div className="flex h-full items-center justify-center"><Skeleton className="h-48 w-full" /></div>
            ) : (
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="completionFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={axisTick} />
                <YAxis unit="%" domain={[0, 100]} tickLine={false} axisLine={false} tick={axisTick} />
                <RechartsTooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, "Completion"]} />
                <Area type="monotone" dataKey="completionRate" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#completionFill)" />
              </AreaChart>
            )}
          </ChartCard>

          <ChartCard title="Employee Engagement Trend" subtitle="Active learners per month">
            {isLoadingTrend ? (
              <div className="flex h-full items-center justify-center"><Skeleton className="h-48 w-full" /></div>
            ) : (
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={axisTick} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={axisTick} />
                <RechartsTooltip contentStyle={tooltipStyle} formatter={(v) => [v, "Active learners"]} />
                <Line type="monotone" dataKey="activeLearners" stroke="hsl(var(--secondary))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            )}
          </ChartCard>

          <ChartCard title="Training Adoption Rate" subtitle="Employees with assigned training, last 12 months">
            {isLoadingTrend ? (
              <div className="flex h-full items-center justify-center"><Skeleton className="h-48 w-full" /></div>
            ) : (
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="adoptionFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={axisTick} />
                <YAxis unit="%" domain={[0, 100]} tickLine={false} axisLine={false} tick={axisTick} />
                <RechartsTooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, "Adoption"]} />
                <Area type="monotone" dataKey="adoptionRate" stroke="#0d9488" strokeWidth={2} fill="url(#adoptionFill)" />
              </AreaChart>
            )}
          </ChartCard>

          <ChartCard title="Department Participation" subtitle="Completion rate by department">
            {isLoadingDepts ? (
              <div className="flex h-full items-center justify-center"><Skeleton className="h-48 w-full" /></div>
            ) : (
              <BarChart data={deptData} layout="vertical" margin={{ top: 0, right: 16, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" unit="%" domain={[0, 100]} tickLine={false} axisLine={false} tick={axisTick} />
                <YAxis type="category" dataKey="department" width={110} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <RechartsTooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, "Completion"]} />
                <Bar dataKey="completionRate" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            )}
          </ChartCard>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-serif">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
              <Link href="/company/employees">
                <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors h-full cursor-pointer flex flex-col items-start text-left">
                  <div className="h-8 w-8 bg-primary/10 rounded flex items-center justify-center text-primary mb-3">
                    <Users className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold mb-1">Add Employees</h3>
                  <p className="text-sm text-muted-foreground flex-1">Invite team members to join your organization.</p>
                  <ArrowRight className="h-4 w-4 text-primary mt-2" />
                </div>
              </Link>
              <Link href="/courses">
                <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors h-full cursor-pointer flex flex-col items-start text-left">
                  <div className="h-8 w-8 bg-secondary/10 rounded flex items-center justify-center text-secondary mb-3">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold mb-1">Assign Training</h3>
                  <p className="text-sm text-muted-foreground flex-1">Browse catalog to assign new courses.</p>
                  <ArrowRight className="h-4 w-4 text-secondary mt-2" />
                </div>
              </Link>
              <Link href="/company/certificates">
                <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors h-full cursor-pointer flex flex-col items-start text-left">
                  <div className="h-8 w-8 bg-amber-500/10 rounded flex items-center justify-center text-amber-600 mb-3">
                    <Award className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold mb-1">Certificates</h3>
                  <p className="text-sm text-muted-foreground flex-1">Download or bulk export employee certificates.</p>
                  <ArrowRight className="h-4 w-4 text-amber-600 mt-2" />
                </div>
              </Link>
              <Link href="/company/sustainability">
                <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors h-full cursor-pointer flex flex-col items-start text-left">
                  <div className="h-8 w-8 bg-green-500/10 rounded flex items-center justify-center text-green-600 mb-3">
                    <Leaf className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold mb-1">Sustainability Impact</h3>
                  <p className="text-sm text-muted-foreground flex-1">View your ESG metrics and score.</p>
                  <ArrowRight className="h-4 w-4 text-green-600 mt-2" />
                </div>
              </Link>
              <Link href="/company/leaderboards">
                <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors h-full cursor-pointer flex flex-col items-start text-left">
                  <div className="h-8 w-8 bg-blue-500/10 rounded flex items-center justify-center text-blue-600 mb-3">
                    <Trophy className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold mb-1">Leaderboards</h3>
                  <p className="text-sm text-muted-foreground flex-1">Celebrate your top learners and champions.</p>
                  <ArrowRight className="h-4 w-4 text-blue-600 mt-2" />
                </div>
              </Link>
              <Link href="/company/compliance">
                <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors h-full cursor-pointer flex flex-col items-start text-left">
                  <div className="h-8 w-8 bg-purple-500/10 rounded flex items-center justify-center text-purple-600 mb-3">
                    <ClipboardCheck className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold mb-1">Compliance</h3>
                  <p className="text-sm text-muted-foreground flex-1">Track mandatory training and expiry dates.</p>
                  <ArrowRight className="h-4 w-4 text-purple-600 mt-2" />
                </div>
              </Link>
            </div>
          </div>

          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold font-serif mb-6">Current Plan</h2>
            {isLoadingCompany ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full mt-4" />
              </div>
            ) : (
              <div>
                <div className="inline-block bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-sm mb-4">
                  {company?.planName || 'Free Plan'}
                </div>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Seats Used</span>
                    <span className="font-medium">{company?.employeeCount} / {company?.maxEmployees || '∞'}</span>
                  </div>
                  <div className="w-full bg-secondary/20 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full" 
                      style={{ width: `${Math.min(100, (company?.employeeCount || 0) / (company?.maxEmployees || 1) * 100)}%` }}
                    />
                  </div>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/pricing">Manage Subscription</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
