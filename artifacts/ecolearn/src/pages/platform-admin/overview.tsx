import { PlatformAdminLayout } from "@/components/layout/PlatformAdminLayout";
import {
  usePlatformAdminListInsightArticles,
  usePlatformAdminListSectors,
  usePlatformAdminListLearningPaths,
  useListCourses,
  usePlatformAdminListSdgContributions
} from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, FolderOpen, LayoutDashboard, Leaf, Route, Target, AlertCircle, ShieldAlert } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  href: string;
  loading: boolean;
}

function StatCard({ title, value, description, icon, href, loading }: StatCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24 mb-1" />
        ) : (
          <div className="text-3xl font-bold">{value}</div>
        )}
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        <div className="mt-4">
          <Link href={href} className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1">
            Manage section &rarr;
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PlatformAdminOverview() {
  const articlesQuery = usePlatformAdminListInsightArticles();
  const sectorsQuery = usePlatformAdminListSectors();
  const pathsQuery = usePlatformAdminListLearningPaths();
  const coursesQuery = useListCourses();
  const contributionsQuery = usePlatformAdminListSdgContributions();

  const isLoading =
    articlesQuery.isLoading ||
    sectorsQuery.isLoading ||
    pathsQuery.isLoading ||
    coursesQuery.isLoading ||
    contributionsQuery.isLoading;

  const articles = articlesQuery.data || [];
  const sectors = sectorsQuery.data || [];
  const paths = pathsQuery.data || [];
  const courses = coursesQuery.data || [];
  const contributions = contributionsQuery.data || [];

  // Client-side computations
  const draftInsights = articles.filter((a: any) => a.status === "draft").length;
  const publishedInsights = articles.filter((a: any) => a.status === "published").length;
  const reviewInsights = articles.filter((a: any) => a.status === "review").length;
  const activeSectors = sectors.filter((s: any) => s.status === "active").length;
  const activePaths = paths.filter((p: any) => p.status === "active").length;
  const activeSdg = contributions.filter((c: any) => c.status === "active").length;

  const coursesRequiringReview = courses.filter((c: any) => {
    if (!c.reviewDate) return false;
    return new Date(c.reviewDate) < new Date();
  }).length;

  return (
    <PlatformAdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold font-serif">Portal Overview</h2>
          <p className="text-muted-foreground mt-1">
            A control dashboard for Mauritius EcoLearnHub content, sectors, and SDG mappings.
          </p>
        </div>

        {/* Informational Warning about Client-side Aggregation */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 text-amber-800 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <span className="font-semibold">Note for Administrators:</span> KPI calculations and usage counts are currently calculated client-side from small administrative list queries. This is optimized for current datasets but serves as a documented system limitation under high scaling.
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Insights Articles"
            value={articles.length}
            description={`${publishedInsights} published · ${draftInsights} drafts`}
            icon={<Leaf className="h-4 w-4" />}
            href="/platform-admin/insights"
            loading={isLoading}
          />
          <StatCard
            title="Sectors"
            value={sectors.length}
            description={`${activeSectors} active sectors`}
            icon={<FolderOpen className="h-4 w-4" />}
            href="/platform-admin/sectors"
            loading={isLoading}
          />
          <StatCard
            title="Learning Paths"
            value={paths.length}
            description={`${activePaths} active paths`}
            icon={<Route className="h-4 w-4" />}
            href="/platform-admin/learning-paths"
            loading={isLoading}
          />
          <StatCard
            title="SDG Contributions"
            value={contributions.length}
            description={`${activeSdg} active SDG mappings`}
            icon={<Target className="h-4 w-4" />}
            href="/platform-admin/sdg-mapping"
            loading={isLoading}
          />
          <StatCard
            title="Courses Under Review"
            value={coursesRequiringReview}
            description={`${coursesRequiringReview} courses requiring review date check`}
            icon={<BookOpen className="h-4 w-4" />}
            href="/platform-admin/courses"
            loading={isLoading}
          />
          <StatCard
            title="Content Awaiting Review"
            value={reviewInsights}
            description={`${reviewInsights} insights submitted for review`}
            icon={<ShieldAlert className="h-4 w-4" />}
            href="/platform-admin/insights"
            loading={isLoading}
          />
        </div>
      </div>
    </PlatformAdminLayout>
  );
}
