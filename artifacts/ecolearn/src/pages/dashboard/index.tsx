import { Layout } from "@/components/layout/Layout";
import { useListEnrollments, useListAchievementBadges, useGetMyPoints, useListCertificates } from "@workspace/api-client-react";
import type { Enrollment } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  BookOpen,
  Award,
  TrendingUp,
  Clock,
  PlayCircle,
  Sprout,
  Recycle,
  Leaf,
  Globe,
  Trophy,
  Lock,
  Star,
  CalendarDays,
  AlertTriangle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const BADGE_ICONS: Record<string, LucideIcon> = {
  sprout: Sprout,
  recycle: Recycle,
  leaf: Leaf,
  globe: Globe,
  trophy: Trophy,
  award: Award,
};

type LmsEnrollment = Enrollment & {
  dueDate?: string | null;
  assignmentStatus?: "not_started" | "in_progress" | "completed" | "overdue";
};

export default function Dashboard() {
  const { data: enrollments, isLoading: isLoadingEnrollments } = useListEnrollments();
  const { data: certificates, isLoading: isLoadingCertificates } = useListCertificates();
  const { data: badges, isLoading: isLoadingBadges } = useListAchievementBadges();
  const { data: points, isLoading: isLoadingPoints } = useGetMyPoints();

  const lmsEnrollments = (enrollments ?? []) as LmsEnrollment[];
  const activeEnrollments = lmsEnrollments.filter(e => e.status !== 'completed');
  const completedEnrollments = lmsEnrollments.filter(e => e.status === 'completed');
  const earnedBadgeCount = badges?.filter(b => b.earned).length ?? 0;
  const averageProgress = lmsEnrollments.length
    ? Math.round(lmsEnrollments.reduce((total, item) => total + item.progressPct, 0) / lmsEnrollments.length)
    : 0;
  const completionRate = lmsEnrollments.length
    ? Math.round((completedEnrollments.length / lmsEnrollments.length) * 100)
    : 0;
  const nextRecommended = [...activeEnrollments].sort((a, b) => {
    const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    return aDue - bDue || a.progressPct - b.progressPct;
  })[0];

  const statusMeta: Record<string, { label: string; className: string }> = {
    not_started: { label: "Not Started", className: "bg-slate-400/10 text-slate-700 border-slate-400/30" },
    in_progress: { label: "In Progress", className: "bg-blue-500/10 text-blue-700 border-blue-500/30" },
    completed: { label: "Completed", className: "bg-green-500/10 text-green-700 border-green-500/30" },
    overdue: { label: "Overdue", className: "bg-red-500/10 text-red-700 border-red-500/30" },
  };

  return (
    <Layout>
      <div className="bg-primary/5 border-b py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold font-serif mb-2">My Learning</h1>
          <p className="text-muted-foreground">Track your progress and continue learning.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* KPI Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Courses</p>
                {isLoadingEnrollments ? <Skeleton className="h-7 w-16 mt-1" /> : (
                  <h3 className="text-2xl font-bold">{activeEnrollments.length}</h3>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Certificates Earned</p>
                {isLoadingCertificates ? <Skeleton className="h-7 w-16 mt-1" /> : (
                  <h3 className="text-2xl font-bold">{certificates?.length || 0}</h3>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Progress</p>
                {isLoadingEnrollments ? <Skeleton className="h-7 w-16 mt-1" /> : (
                  <h3 className="text-2xl font-bold">{averageProgress}%</h3>
                )}
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                {isLoadingEnrollments ? <Skeleton className="h-7 w-16 mt-1" /> : (
                  <h3 className="text-2xl font-bold">{completionRate}%</h3>
                )}
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <Star className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Points</p>
                {isLoadingPoints ? <Skeleton className="h-7 w-16 mt-1" /> : (
                  <h3 className="text-2xl font-bold">{points?.totalPoints ?? 0}</h3>
                )}
              </div>
            </div>
          </div>
        </div>

        {nextRecommended && (
          <div className="mb-12 rounded-xl border bg-primary/5 p-5 flex flex-col md:flex-row md:items-center gap-4">
            <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              {nextRecommended.assignmentStatus === "overdue" ? (
                <AlertTriangle className="h-5 w-5" />
              ) : (
                <BookOpen className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary mb-1">Next recommended course</p>
              <h2 className="font-serif font-bold text-xl truncate">{nextRecommended.courseName}</h2>
              <p className="text-sm text-muted-foreground">
                {nextRecommended.dueDate
                  ? `Due ${new Date(nextRecommended.dueDate).toLocaleDateString()}`
                  : "No due date set"} • {nextRecommended.progressPct}% complete
              </p>
            </div>
            <Button asChild>
              <Link href={`/learn/${nextRecommended.id}`}>Continue</Link>
            </Button>
          </div>
        )}

        {/* Continue Learning */}
        <h2 className="text-2xl font-bold font-serif mb-6">Continue Learning</h2>
        <div className="grid lg:grid-cols-2 gap-6 mb-12">
          {isLoadingEnrollments ? (
            Array(2).fill(0).map((_, i) => (
              <div key={i} className="flex gap-4 border rounded-xl p-4">
                <Skeleton className="h-24 w-32 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-2 w-full mt-4" />
                </div>
              </div>
            ))
          ) : activeEnrollments.length === 0 ? (
            <div className="col-span-full py-12 text-center border rounded-xl bg-muted/20">
              <p className="text-muted-foreground">No training is currently assigned to you.</p>
            </div>
          ) : (
            activeEnrollments.map((enrollment) => (
              <Link key={enrollment.id} href={`/learn/${enrollment.id}`}>
                <div className="group bg-card border rounded-xl p-4 flex gap-4 items-center hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
                  <div className="w-32 h-24 rounded-lg overflow-hidden shrink-0 relative bg-muted">
                    {enrollment.courseThumbnail && (
                      <img src={enrollment.courseThumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    )}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlayCircle className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate mb-1 group-hover:text-primary transition-colors">
                      {enrollment.courseName}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge variant="outline" className={statusMeta[enrollment.assignmentStatus ?? "not_started"]?.className}>
                        {statusMeta[enrollment.assignmentStatus ?? "not_started"]?.label}
                      </Badge>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {enrollment.dueDate ? `Due ${new Date(enrollment.dueDate).toLocaleDateString()}` : "No due date"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={enrollment.progressPct} className="flex-1 h-2" />
                      <span className="text-xs font-medium w-9">{Math.round(enrollment.progressPct)}%</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Achievement Badges */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold font-serif">Achievements</h2>
          {!isLoadingBadges && badges && badges.length > 0 && (
            <span className="text-sm font-medium text-muted-foreground">
              {earnedBadgeCount} of {badges.length} badges earned
            </span>
          )}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
          {isLoadingBadges ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="border rounded-xl p-6 flex flex-col items-center text-center">
                <Skeleton className="h-16 w-16 rounded-full mb-4" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))
          ) : (
            badges?.map((badge) => {
              const Icon = BADGE_ICONS[badge.icon] ?? Award;
              const pct = badge.progressTarget > 0
                ? Math.round((badge.progressCurrent / badge.progressTarget) * 100)
                : 0;
              return (
                <div
                  key={badge.id}
                  className={`border rounded-xl p-6 flex flex-col items-center text-center transition-colors ${
                    badge.earned ? "bg-card border-primary/30" : "bg-muted/20"
                  }`}
                >
                  <div
                    className={`h-16 w-16 rounded-full flex items-center justify-center mb-4 relative ${
                      badge.earned
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground/50"
                    }`}
                  >
                    <Icon className="h-8 w-8" />
                    {!badge.earned && (
                      <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-muted border flex items-center justify-center">
                        <Lock className="h-3 w-3 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <h3 className={`font-semibold mb-1 ${badge.earned ? "" : "text-muted-foreground"}`}>
                    {badge.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-3">
                    {badge.description}
                  </p>
                  <div className="mt-auto w-full">
                    {badge.earned ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                        <Award className="h-3.5 w-3.5" /> Earned
                      </span>
                    ) : (
                      <div className="w-full">
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary/60"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground mt-1.5 block">
                          {badge.progressCurrent} / {badge.progressTarget}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Completed Courses */}
        {completedEnrollments.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold font-serif">Completed Courses</h2>
              <Link href="/certificates" className="text-sm font-medium text-primary hover:underline">
                View Certificates
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedEnrollments.map((enrollment) => (
                <div key={enrollment.id} className="bg-card border rounded-xl overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
                  <div className="aspect-video relative bg-muted">
                    {enrollment.courseThumbnail && (
                      <img src={enrollment.courseThumbnail} alt="" className="w-full h-full object-cover grayscale-[50%]" />
                    )}
                    <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-1 line-clamp-1">{enrollment.courseName}</h3>
                    <p className="text-xs text-muted-foreground">
                      Completed {enrollment.completedAt ? new Date(enrollment.completedAt).toLocaleDateString() : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

function CheckCircle2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
