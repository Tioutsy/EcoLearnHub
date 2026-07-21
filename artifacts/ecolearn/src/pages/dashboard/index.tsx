import { Layout } from "@/components/layout/Layout";
import { useListEnrollments, useListAchievementBadges, useGetMyPoints, useListCertificates, customFetch } from "@workspace/api-client-react";
import type { Enrollment } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
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
  Zap,
  Target,
  BarChart3,
  Check,
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
  zap: Zap,
  target: Target,
  "book-open": BookOpen,
  "bar-chart-3": BarChart3,
};

type LmsEnrollment = Enrollment & {
  dueDate?: string | null;
  assignmentStatus?: "not_started" | "in_progress" | "completed" | "overdue";
};

export default function Dashboard() {
  const { data: enrollments, isLoading: isLoadingEnrollments } = useListEnrollments();
  const { data: certificates, isLoading: isLoadingCertificates } = useListCertificates();
  const { data: points, isLoading: isLoadingPoints } = useGetMyPoints();
  const { data: achievementsData, isLoading: isLoadingAchievements } = useQuery({
    queryKey: ["/api/me/achievements"],
    queryFn: () => customFetch<any>("/api/me/achievements"),
  });

  const lmsEnrollments = (enrollments ?? []) as LmsEnrollment[];
  const activeEnrollments = lmsEnrollments.filter(e => e.status !== 'completed');
  const completedEnrollments = lmsEnrollments.filter(e => e.status === 'completed');
  const earnedBadgeCount = achievementsData?.earnedAchievementCount ?? 0;
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

        {/* Achievements Grouped Sections */}
        <div className="mb-12">
          {isLoadingAchievements ? (
            <div className="space-y-6">
              <Skeleton className="h-10 w-48" />
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="border rounded-xl p-6 flex flex-col items-center text-center">
                    <Skeleton className="h-16 w-16 rounded-full mb-4" />
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                ))}
              </div>
            </div>
          ) : achievementsData ? (
            <div className="space-y-12">
              {/* Highlight Certificate Banner */}
              {(() => {
                const certBadge = achievementsData.achievements.find((a: any) => a.category === "certification");
                if (!certBadge) return null;
                const Icon = BADGE_ICONS[certBadge.icon] ?? Trophy;
                return (
                  <div className={`border rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 transition-all ${
                    certBadge.earned 
                      ? "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/40 shadow-sm" 
                      : "bg-muted/10 border-dashed"
                  }`}>
                    <div className={`h-24 w-24 rounded-full flex items-center justify-center shrink-0 ${
                      certBadge.earned ? "bg-primary/20 text-primary shadow-inner" : "bg-muted text-muted-foreground/30"
                    }`}>
                      <Icon className="h-12 w-12" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                        <span className="text-xs uppercase tracking-wider font-semibold text-primary">Core Certification</span>
                        {certBadge.earned && (
                          <Badge variant="default" className="bg-primary text-white">Earned</Badge>
                        )}
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold font-serif mb-2">{certBadge.name}</h3>
                      <p className="text-muted-foreground text-sm max-w-2xl mb-4">
                        {certBadge.earned 
                          ? "Congratulations! You have completed all core coursework and passed the Final Certification, earning the EcoLearnHub Core Sustainability Certificate."
                          : "Prerequisite: Complete 11 Core Courses & 1 voluntary workplace challenge, then pass the Final Certification Exam."
                        }
                      </p>
                      
                      {!certBadge.earned && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-semibold text-muted-foreground mb-1">
                            <span>Prerequisites Progress</span>
                            <span>{achievementsData.completedCoreCourseCount} of 11 courses, {achievementsData.approvedChallengeCount >= 1 ? "1" : "0"} of 1 action</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Progress value={Math.round((achievementsData.completedCoreCourseCount / 11) * 100)} className="h-2 flex-1" />
                            <span className="text-xs font-semibold">{Math.round((achievementsData.completedCoreCourseCount / 11) * 100)}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                    {certBadge.earned && (
                      <Button asChild size="lg" className="shrink-0 shadow-md">
                        <Link href="/certificates">View Certificate</Link>
                      </Button>
                    )}
                  </div>
                );
              })()}

              {/* Group 1: Course Badges */}
              <div>
                <h3 className="text-xl font-bold font-serif mb-6 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Course Badges
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({achievementsData.courseBadgeCount} earned)
                  </span>
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {achievementsData.achievements
                    .filter((a: any) => a.category === "course")
                    .map((badge: any) => {
                      const Icon = BADGE_ICONS[badge.icon] ?? Award;
                      return (
                        <div
                          key={badge.id}
                          className={`border rounded-xl p-5 flex flex-col items-center text-center transition-all ${
                            badge.earned ? "bg-card border-primary/20 shadow-sm" : "bg-muted/10 opacity-70"
                          }`}
                        >
                          <div className={`h-14 w-14 rounded-full flex items-center justify-center mb-3 relative ${
                            badge.earned ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground/30"
                          }`}>
                            <Icon className="h-7 w-7" />
                            {!badge.earned && <Lock className="absolute -bottom-1 -right-1 h-4 w-4 text-muted-foreground" />}
                          </div>
                          <h4 className={`font-semibold mb-1 text-sm ${badge.earned ? "" : "text-muted-foreground"}`}>
                            {badge.name}
                          </h4>
                          <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
                            {badge.description}
                          </p>
                          <div className="mt-auto w-full">
                            {badge.earned ? (
                              <div className="text-xs font-semibold text-primary flex items-center justify-center gap-1">
                                <Check className="h-3.5 w-3.5" /> Completed
                              </div>
                            ) : (
                              <span className="text-xs font-medium text-muted-foreground/60 block">Locked</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Group 2: Learning Milestones */}
              <div>
                <h3 className="text-xl font-bold font-serif mb-6 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Learning Milestones
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({achievementsData.milestoneAchievementCount} earned)
                  </span>
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {achievementsData.achievements
                    .filter((a: any) => a.category === "milestone")
                    .map((badge: any) => {
                      const Icon = BADGE_ICONS[badge.icon] ?? Trophy;
                      const pct = Math.round((badge.progressCurrent / badge.progressTarget) * 100);
                      return (
                        <div
                          key={badge.id}
                          className={`border rounded-xl p-5 flex flex-col items-center text-center transition-all ${
                            badge.earned ? "bg-card border-primary/20 shadow-sm" : "bg-muted/10 opacity-70"
                          }`}
                        >
                          <div className={`h-14 w-14 rounded-full flex items-center justify-center mb-3 relative ${
                            badge.earned ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground/30"
                          }`}>
                            <Icon className="h-7 w-7" />
                            {!badge.earned && <Lock className="absolute -bottom-1 -right-1 h-4 w-4 text-muted-foreground" />}
                          </div>
                          <h4 className={`font-semibold mb-1 text-sm ${badge.earned ? "" : "text-muted-foreground"}`}>
                            {badge.name}
                          </h4>
                          <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
                            {badge.description}
                          </p>
                          <div className="mt-auto w-full space-y-2">
                            {badge.earned ? (
                              <div className="text-xs font-semibold text-primary flex items-center justify-center gap-1">
                                <Check className="h-3.5 w-3.5" /> Earned
                              </div>
                            ) : (
                              <>
                                <Progress value={pct} className="h-1.5" />
                                <span className="text-[10px] text-muted-foreground font-medium block">
                                  {badge.progressLabel}
                                </span>
                                <span className="text-[10px] text-muted-foreground/75 italic block line-clamp-2">
                                  {badge.unlockInstruction}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Group 3: Challenge Achievements */}
              <div>
                <h3 className="text-xl font-bold font-serif mb-6 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Workplace Challenges
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({achievementsData.challengeAchievementCount} earned)
                  </span>
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {achievementsData.achievements
                    .filter((a: any) => a.category === "challenge")
                    .map((badge: any) => {
                      const Icon = BADGE_ICONS[badge.icon] ?? Award;
                      const pct = Math.round((badge.progressCurrent / badge.progressTarget) * 100);
                      return (
                        <div
                          key={badge.id}
                          className={`border rounded-xl p-5 flex flex-col items-center text-center transition-all ${
                            badge.earned ? "bg-card border-primary/20 shadow-sm" : "bg-muted/10 opacity-70"
                          }`}
                        >
                          <div className={`h-14 w-14 rounded-full flex items-center justify-center mb-3 relative ${
                            badge.earned ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground/30"
                          }`}>
                            <Icon className="h-7 w-7" />
                            {!badge.earned && <Lock className="absolute -bottom-1 -right-1 h-4 w-4 text-muted-foreground" />}
                          </div>
                          <h4 className={`font-semibold mb-1 text-sm ${badge.earned ? "" : "text-muted-foreground"}`}>
                            {badge.name}
                          </h4>
                          <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
                            {badge.description}
                          </p>
                          <div className="mt-auto w-full space-y-2">
                            {badge.earned ? (
                              <div className="text-xs font-semibold text-primary flex items-center justify-center gap-1">
                                <Check className="h-3.5 w-3.5" /> Earned
                              </div>
                            ) : (
                              <>
                                <Progress value={pct} className="h-1.5" />
                                <span className="text-[10px] text-muted-foreground font-medium block">
                                  {badge.progressLabel}
                                </span>
                                <span className="text-[10px] text-muted-foreground/75 italic block line-clamp-2">
                                  {badge.unlockInstruction}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">No achievements found.</div>
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
