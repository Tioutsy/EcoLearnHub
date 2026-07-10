import { Layout } from "@/components/layout/Layout";
import { useGetAdminAnalytics } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { useUser } from "@clerk/react";
import {
  Building2,
  Users,
  TrendingUp,
  Sparkles,
  GraduationCap,
  Award,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  Recycle,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
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
            <Skeleton className="h-7 w-20 mt-1" />
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

function formatRevenue(amount: number, currency: string): string {
  return `${currency} ${amount.toLocaleString("en-US")}`;
}

export default function AdminPanel() {
  const { user, isLoaded } = useUser();
  const isSuperAdmin = user?.publicMetadata?.role === "super_admin";
  const { data, isLoading } = useGetAdminAnalytics({
    query: {
      enabled: isLoaded && isSuperAdmin,
      queryKey: ["admin-analytics"],
      retry: false,
    },
  });

  if (isLoaded && !isSuperAdmin) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 max-w-md text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-rose-100 flex items-center justify-center mb-4">
            <ShieldAlert className="h-6 w-6 text-rose-600" />
          </div>
          <h1 className="text-2xl font-bold font-serif mb-2">Restricted area</h1>
          <p className="text-muted-foreground mb-6">
            The platform analytics dashboard is available to super admins only.
          </p>
          <Link
            href="/company"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Go to company dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Layout>
    );
  }

  const leadFunnel = [
    { name: "Trial", value: data?.leadsByInterest.trial ?? 0 },
    { name: "Demo", value: data?.leadsByInterest.demo ?? 0 },
    { name: "Proposal", value: data?.leadsByInterest.proposal ?? 0 },
  ];

  const popularCourses = data?.popularCourses ?? [];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-sm font-medium text-primary mb-1">Super Admin</p>
            <h1 className="text-3xl font-bold font-serif">Platform Analytics</h1>
            <p className="text-muted-foreground mt-1">
              A live overview of platform growth, revenue, and learner engagement across Mauritius.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/recycling"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Recyclean collections <Recycle className="h-4 w-4" />
            </Link>
            <Link
              href="/company"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Company dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Business KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard
            label="Companies registered"
            value={data?.companiesRegistered ?? 0}
            icon={<Building2 className="h-5 w-5 text-blue-600" />}
            tone="bg-blue-100"
            loading={isLoading}
          />
          <KpiCard
            label="Active companies"
            value={data?.activeCompanies ?? 0}
            icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
            tone="bg-emerald-100"
            loading={isLoading}
            hint="With engaged employees"
          />
          <KpiCard
            label="Annual revenue"
            value={formatRevenue(data?.annualRevenue ?? 0, data?.currency ?? "Rs")}
            icon={<TrendingUp className="h-5 w-5 text-violet-600" />}
            tone="bg-violet-100"
            loading={isLoading}
            hint="Booked on active plans"
          />
          <KpiCard
            label="Trial conversions"
            value={data?.trialConversionRate ?? 0}
            suffix="%"
            icon={<Sparkles className="h-5 w-5 text-amber-600" />}
            tone="bg-amber-100"
            loading={isLoading}
            hint={`${data?.convertedTrials ?? 0} of ${data?.trialSignups ?? 0} trials`}
          />
        </div>

        {/* Engagement KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KpiCard
            label="Employee engagement"
            value={data?.engagementRate ?? 0}
            suffix="%"
            icon={<Users className="h-5 w-5 text-teal-600" />}
            tone="bg-teal-100"
            loading={isLoading}
            hint={`${data?.activeEmployees ?? 0} of ${data?.totalEmployees ?? 0} learners active`}
          />
          <KpiCard
            label="Completion rate"
            value={data?.overallCompletionRate ?? 0}
            suffix="%"
            icon={<GraduationCap className="h-5 w-5 text-indigo-600" />}
            tone="bg-indigo-100"
            loading={isLoading}
            hint={`${data?.completedEnrollments ?? 0} of ${data?.totalEnrollments ?? 0} enrollments`}
          />
          <KpiCard
            label="Total enrollments"
            value={data?.totalEnrollments ?? 0}
            icon={<BookOpen className="h-5 w-5 text-sky-600" />}
            tone="bg-sky-100"
            loading={isLoading}
          />
          <KpiCard
            label="Certificates issued"
            value={data?.certificatesIssued ?? 0}
            icon={<Award className="h-5 w-5 text-rose-600" />}
            tone="bg-rose-100"
            loading={isLoading}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartCard
            title="Lead funnel"
            subtitle="Captured leads by interest"
          >
            <BarChart data={leadFunnel}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} />
              <RechartsTooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" name="Leads" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartCard>

          <ChartCard
            title="Most popular courses"
            subtitle="Ranked by total enrollments"
          >
            <BarChart data={popularCourses} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
              <XAxis type="number" allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="title"
                width={140}
                tick={{ ...axisTick, width: 130 }}
                axisLine={false}
                tickLine={false}
              />
              <RechartsTooltip contentStyle={tooltipStyle} />
              <Bar dataKey="enrollments" name="Enrollments" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ChartCard>
        </div>

        {/* Popular courses table */}
        <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="font-bold font-serif">Course performance</h3>
            <p className="text-sm text-muted-foreground">Enrollment volume and completion by course</p>
          </div>
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : popularCourses.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              No enrollment data yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b">
                    <th className="px-6 py-3 font-medium">Course</th>
                    <th className="px-6 py-3 font-medium text-right">Enrollments</th>
                    <th className="px-6 py-3 font-medium text-right">Completion rate</th>
                  </tr>
                </thead>
                <tbody>
                  {popularCourses.map((course) => (
                    <tr key={course.courseId ?? course.title} className="border-b last:border-0">
                      <td className="px-6 py-4 font-medium">{course.title}</td>
                      <td className="px-6 py-4 text-right">{course.enrollments}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center gap-2 justify-end">
                          <span className="hidden sm:block w-24 h-2 rounded-full bg-muted overflow-hidden">
                            <span
                              className="block h-full bg-primary rounded-full"
                              style={{ width: `${course.completionRate}%` }}
                            />
                          </span>
                          {course.completionRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
