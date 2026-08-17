import React, { useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth, useUser } from "@clerk/react";
import { Link } from "wouter";
import { useAuthRole } from "@/lib/authHelpers";
import {
  useListEnrollments,
  useListCertificates,
  useListCourses,
  type Enrollment,
  type Course,
} from "@workspace/api-client-react";
import {
  useCompanyLmsOverview,
  useLearnerWorkplaceActions,
  useCompanyTrainingInsights,
  type WorkplaceActionRecord,
} from "@/lib/lms-api";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Award,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  Target,
  Sparkles,
  ShieldCheck,
  Building2,
  BarChart3,
} from "lucide-react";

type LmsEnrollment = Enrollment & {
  dueDate?: string | null;
  assignmentStatus?: "not_started" | "in_progress" | "completed" | "overdue";
  courseCode?: string;
  courseTitle?: string;
  courseThumbnail?: string;
};

export default function InternalHome() {
  const { isLoaded: isAuthLoaded } = useAuth();
  const { user } = useUser();
  const authRole = useAuthRole();

  // Authoritative server-resolved role checks
  const isAdmin = authRole.isCompanyAdmin;
  const isMgr = authRole.isManager;
  const isSuper = authRole.isPlatformAdmin;
  const isLearnerOnly = authRole.isLearner;

  // Learner Queries
  const {
    data: enrollments,
    isLoading: isLoadingEnrollments,
    isError: isEnrollmentsError,
    refetch: refetchEnrollments,
  } = useListEnrollments();

  const {
    data: certificates,
  } = useListCertificates();

  const {
    data: courses,
  } = useListCourses();

  const {
    data: workplaceActions,
  } = useLearnerWorkplaceActions();

  // Manager / Admin Queries
  const {
    data: companyOverview,
  } = useCompanyLmsOverview();

  const {
    data: trainingInsights,
  } = useCompanyTrainingInsights();

  // Map courses by ID for quick thumbnail lookup
  const coursesMap = useMemo(() => {
    const map = new Map<number, Course>();
    (courses || []).forEach((c) => map.set(c.id, c));
    return map;
  }, [courses]);

  // Greeting resolution
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const firstName = user?.firstName || user?.fullName?.split(" ")[0] || "";
  const companyName = companyOverview?.companyName || (user?.publicMetadata?.companyName as string) || "";

  // Learner Calculations
  const activeEnrollments = useMemo(() => {
    const list = (enrollments || []) as LmsEnrollment[];
    return list.filter((e) => (e.progressPct ?? 0) < 100);
  }, [enrollments]);

  const completedEnrollments = useMemo(() => {
    const list = (enrollments || []) as LmsEnrollment[];
    return list.filter((e) => (e.progressPct ?? 0) >= 100);
  }, [enrollments]);

  const inProgressList = useMemo(() => {
    return activeEnrollments.filter((e) => (e.progressPct ?? 0) > 0);
  }, [activeEnrollments]);

  const notStartedList = useMemo(() => {
    return activeEnrollments.filter((e) => (e.progressPct ?? 0) === 0);
  }, [activeEnrollments]);

  // Priority next action for learner:
  // 1. In-progress course
  // 2. Overdue assigned course
  // 3. Next assigned course
  // 4. Pending workplace action
  // 5. Catch up / Catalogue
  const learnerPrimaryAction = useMemo(() => {
    const overdue = activeEnrollments.find((e) => e.assignmentStatus === "overdue");
    if (overdue) {
      const courseTitle = overdue.courseName || overdue.courseTitle || `Course #${overdue.courseId}`;
      const courseObj = coursesMap.get(overdue.courseId);
      const thumbnail = overdue.courseThumbnail || courseObj?.thumbnailUrl || null;
      return {
        type: "overdue_course" as const,
        title: `Resume ${courseTitle}`,
        subtitle: `Assigned · Due ${overdue.dueDate ? new Date(overdue.dueDate).toLocaleDateString() : "Soon"}`,
        progress: overdue.progressPct || 0,
        buttonText: "Resume course",
        link: `/learn/${overdue.id}`,
        thumbnail,
      };
    }

    if (inProgressList.length > 0) {
      const topInProgress = inProgressList[0];
      const courseTitle = topInProgress.courseName || topInProgress.courseTitle || `Course #${topInProgress.courseId}`;
      const courseObj = coursesMap.get(topInProgress.courseId);
      const thumbnail = topInProgress.courseThumbnail || courseObj?.thumbnailUrl || null;
      return {
        type: "in_progress_course" as const,
        title: `Continue ${courseTitle}`,
        subtitle: `You're ${Math.round(topInProgress.progressPct || 0)}% complete`,
        progress: topInProgress.progressPct || 0,
        buttonText: "Continue learning",
        link: `/learn/${topInProgress.id}`,
        thumbnail,
      };
    }

    if (notStartedList.length > 0) {
      const nextAssigned = notStartedList[0];
      const courseTitle = nextAssigned.courseName || nextAssigned.courseTitle || `Course #${nextAssigned.courseId}`;
      const courseObj = coursesMap.get(nextAssigned.courseId);
      const thumbnail = nextAssigned.courseThumbnail || courseObj?.thumbnailUrl || null;
      return {
        type: "not_started_course" as const,
        title: `Start ${courseTitle}`,
        subtitle: nextAssigned.dueDate ? `Assigned to you · Due ${new Date(nextAssigned.dueDate).toLocaleDateString()}` : "Assigned to you",
        progress: 0,
        buttonText: "Start course",
        link: `/learn/${nextAssigned.id}`,
        thumbnail,
      };
    }

    const pendingAction = (workplaceActions || []).find((a: WorkplaceActionRecord) => a.status === "in_progress" || a.status === "committed");
    if (pendingAction) {
      return {
        type: "workplace_action" as const,
        title: `Put learning into practice: ${pendingAction.commitmentText}`,
        subtitle: "Workplace commitment in progress",
        progress: 50,
        buttonText: "View commitment",
        link: "/dashboard",
        thumbnail: null,
      };
    }

    return {
      type: "all_caught_up" as const,
      title: "You’re all caught up",
      subtitle: "Explore our interactive courses catalogue whenever you're ready.",
      progress: 100,
      buttonText: "Browse courses",
      link: "/courses",
      thumbnail: null,
    };
  }, [activeEnrollments, inProgressList, notStartedList, workplaceActions, coursesMap]);

  // Priority next action for manager/admin:
  const adminPrimaryAction = useMemo(() => {
    const overdueCount = companyOverview?.actionNeeded?.filter((a) => a.status === "overdue").length || 0;
    const notStartedCount = companyOverview?.actionNeeded?.filter((a) => a.status === "not_started").length || 0;

    if (overdueCount > 0) {
      return {
        title: `Review overdue training (${overdueCount} assignments)`,
        subtitle: `${overdueCount} employee ${overdueCount === 1 ? "assignment is" : "assignments are"} past due date.`,
        buttonText: "Review overdue training",
        link: "/company/training-follow-up",
        thumbnail: null,
      };
    }

    if (notStartedCount > 0) {
      return {
        title: `Learners not started (${notStartedCount} assigned)`,
        subtitle: `${notStartedCount} enrolled ${notStartedCount === 1 ? "learner hasn't" : "learners haven't"} started their courses.`,
        buttonText: "View learner status",
        link: "/company/training-follow-up",
        thumbnail: null,
      };
    }

    const attentionItem = trainingInsights?.needsAttention?.[0];
    if (attentionItem) {
      return {
        title: attentionItem.title,
        subtitle: attentionItem.explanation,
        buttonText: attentionItem.recommendedAction,
        link: attentionItem.targetUrl || "/company/reports",
        thumbnail: null,
      };
    }

    return {
      title: "Organisation training is in good standing",
      subtitle: "Assign new learning pathways or review departmental sustainability reports.",
      buttonText: "Manage assignments",
      link: "/company/employees",
      thumbnail: null,
    };
  }, [companyOverview, trainingInsights]);

  // Loading state
  if (!isAuthLoaded || (isLoadingEnrollments && isLearnerOnly)) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 space-y-8 max-w-6xl">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64 rounded-lg" />
            <Skeleton className="h-4 w-96 rounded-lg" />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="md:col-span-2 h-52 rounded-2xl" />
            <Skeleton className="h-52 rounded-2xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-48 rounded-lg" />
            <div className="grid sm:grid-cols-3 gap-4">
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (isEnrollmentsError && isLearnerOnly) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 max-w-xl text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold font-serif">We couldn’t load your Home page</h2>
          <p className="text-sm text-muted-foreground">
            There was a temporary problem loading your account records. Please try again.
          </p>
          <Button onClick={() => refetchEnrollments()} className="rounded-xl">
            Try again
          </Button>
        </div>
      </Layout>
    );
  }

  const activeBgImage = (isAdmin || isMgr) ? adminPrimaryAction.thumbnail : learnerPrimaryAction.thumbnail;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
        {/* SECTION 1 — WELCOME */}
        <div className="border-b pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-foreground tracking-tight">
                {firstName ? `${greeting}, ${firstName}` : "Welcome back"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {isAdmin || isMgr
                  ? companyName
                    ? `Here’s what needs your attention across ${companyName}.`
                    : "Here’s what needs your attention across your organisation."
                  : isSuper
                  ? "Platform administrator management and system monitoring overview."
                  : "Here’s where to continue your learning and workplace actions."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 px-3 py-1">
                {authRole.roleLabel}
              </Badge>
              {companyName && (
                <span className="text-xs text-muted-foreground hidden sm:inline-flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" /> {companyName}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2 & 3 — PRIMARY NEXT ACTION + PROGRESS SNAPSHOT */}
        <div className="grid lg:grid-cols-3 gap-6 items-stretch">
          {/* PRIMARY NEXT ACTION (2/3 width on desktop) */}
          <div className="lg:col-span-2 bg-card border rounded-2xl p-6 sm:p-7 shadow-sm flex flex-col justify-between relative overflow-hidden group min-h-[220px]">
            {/* Dynamic Course Background Image with refined gradient readability overlay */}
            {activeBgImage ? (
              <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none rounded-2xl">
                <img
                  src={activeBgImage}
                  alt=""
                  className="w-full h-full object-cover object-center scale-105 transition-transform duration-700 group-hover:scale-110"
                />
                {/* Refined gradient overlay: high contrast on left for typography, subtle image preview on right */}
                <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/90 to-background/50 dark:from-background/95 dark:via-background/90 dark:to-background/60" />
                <div className="absolute inset-0 bg-emerald-950/10 dark:bg-emerald-950/30 mix-blend-multiply" />
              </div>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-card via-card to-emerald-50/30 dark:to-emerald-950/20 pointer-events-none rounded-2xl" />
            )}

            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-3">
                  <Sparkles className="h-4 w-4" /> Next Recommended Action
                </div>

                {isSuper ? (
                  <div className="space-y-2">
                    <h2 className="text-xl sm:text-2xl font-bold font-serif text-foreground">
                      Platform Management & Overview
                    </h2>
                    <p className="text-sm text-muted-foreground max-w-xl">
                      Inspect tenant health, manage corporate subscriptions, courses, and platform operations.
                    </p>
                  </div>
                ) : isAdmin || isMgr ? (
                  <div className="space-y-2">
                    <h2 className="text-xl sm:text-2xl font-bold font-serif text-foreground">
                      {adminPrimaryAction.title}
                    </h2>
                    <p className="text-sm text-muted-foreground max-w-xl">
                      {adminPrimaryAction.subtitle}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h2 className="text-xl sm:text-2xl font-bold font-serif text-foreground">
                      {learnerPrimaryAction.title}
                    </h2>
                    <p className="text-sm text-muted-foreground max-w-xl">
                      {learnerPrimaryAction.subtitle}
                    </p>
                    {learnerPrimaryAction.progress > 0 && learnerPrimaryAction.progress < 100 && (
                      <div className="pt-2 max-w-md space-y-1.5">
                        <div className="flex justify-between text-xs font-medium text-muted-foreground">
                          <span>Course Progress</span>
                          <span>{Math.round(learnerPrimaryAction.progress)}%</span>
                        </div>
                        <Progress value={learnerPrimaryAction.progress} className="h-2" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-6 flex items-center gap-4">
                <Button asChild size="lg" className="rounded-xl font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm gap-2">
                  <Link href={isSuper ? "/platform-admin" : (isAdmin || isMgr) ? adminPrimaryAction.link : learnerPrimaryAction.link}>
                    <span>{isSuper ? "Open Platform Admin" : (isAdmin || isMgr) ? adminPrimaryAction.buttonText : learnerPrimaryAction.buttonText}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* SECTION 3 — PROGRESS SNAPSHOT (1/3 width on desktop) */}
          <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4 text-emerald-600" /> Progress Snapshot
              </div>

              {isAdmin || isMgr ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/40 rounded-xl border">
                    <p className="text-xs text-muted-foreground font-medium">Active Learners</p>
                    <p className="text-xl font-bold mt-1">{companyOverview?.stats?.activeLearners ?? 0}</p>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-xl border">
                    <p className="text-xs text-muted-foreground font-medium">Completion Rate</p>
                    <p className="text-xl font-bold mt-1 text-emerald-700 dark:text-emerald-400">
                      {Math.round(companyOverview?.stats?.averageCompletionRate ?? 0)}%
                    </p>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-xl border">
                    <p className="text-xs text-muted-foreground font-medium">Overdue</p>
                    <p className="text-xl font-bold mt-1 text-red-600">
                      {companyOverview?.actionNeeded?.filter((a) => a.status === "overdue").length ?? 0}
                    </p>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-xl border">
                    <p className="text-xs text-muted-foreground font-medium">Certificates</p>
                    <p className="text-xl font-bold mt-1">{companyOverview?.stats?.certificatesEarned ?? 0}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl border">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-medium text-foreground">Completed Courses</span>
                    </div>
                    <span className="text-sm font-bold">{completedEnrollments.length}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl border">
                    <div className="flex items-center gap-2.5">
                      <PlayCircle className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-medium text-foreground">In Progress</span>
                    </div>
                    <span className="text-sm font-bold">{inProgressList.length}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl border">
                    <div className="flex items-center gap-2.5">
                      <Award className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-medium text-foreground">Certificates Earned</span>
                    </div>
                    <span className="text-sm font-bold">{certificates?.length ?? completedEnrollments.length}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t mt-4 text-right">
              <Link
                href={isAdmin || isMgr ? "/company/reports" : "/dashboard"}
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
              >
                {isAdmin || isMgr ? "View Detailed Reports →" : "View My Skills →"}
              </Link>
            </div>
          </div>
        </div>

        {/* SECTION 4 — MY LEARNING / ATTENTION LIST */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold font-serif text-foreground">
              {isAdmin || isMgr ? "Training Requiring Attention" : "My Active Learning"}
            </h2>
            <Link
              href={isAdmin || isMgr ? "/company/training-follow-up" : "/dashboard"}
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              {isAdmin || isMgr ? "View all follow-up →" : "View all learning →"}
            </Link>
          </div>

          {isAdmin || isMgr ? (
            companyOverview?.actionNeeded && companyOverview.actionNeeded.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {companyOverview.actionNeeded.slice(0, 3).map((item) => (
                  <div key={item.assignmentId} className="bg-card border rounded-xl p-4 shadow-sm space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <Badge
                          variant="outline"
                          className={item.status === "overdue" ? "text-red-700 border-red-300 bg-red-50 text-[10px]" : "text-amber-700 border-amber-300 bg-amber-50 text-[10px]"}
                        >
                          {item.status === "overdue" ? "Overdue" : "Not Started"}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">{item.department || "General"}</span>
                      </div>
                      <h3 className="text-sm font-bold line-clamp-1">{item.employeeName}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">{item.courseTitle}</p>
                    </div>
                    <div className="pt-2 border-t flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress: {Math.round(item.progressPct)}%</span>
                      <Button asChild size="sm" variant="outline" className="h-7 text-xs rounded-lg">
                        <Link href={`/company/training-follow-up`}>Follow Up</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-card border rounded-xl text-center space-y-2 text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                <p className="text-sm font-medium text-foreground">No training issues need your attention right now.</p>
                <p className="text-xs">All assigned learners are progressing on schedule.</p>
              </div>
            )
          ) : (
            activeEnrollments.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeEnrollments.slice(0, 3).map((enrollment) => (
                  <div key={enrollment.id} className="bg-card border rounded-xl p-4 shadow-sm space-y-3 flex flex-col justify-between hover:border-emerald-600/40 transition-colors">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground">
                          {enrollment.courseCode || `ELH-${String(enrollment.courseId).padStart(2, "0")}`}
                        </Badge>
                        <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                          {Math.round(enrollment.progressPct || 0)}% Complete
                        </span>
                      </div>
                      <h3 className="text-sm font-bold line-clamp-2 text-foreground leading-snug">
                        {enrollment.courseName || enrollment.courseTitle || `Course #${enrollment.courseId}`}
                      </h3>
                      {enrollment.dueDate && (
                        <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Due {new Date(enrollment.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2.5 pt-2">
                      <Progress value={enrollment.progressPct || 0} className="h-1.5" />
                      <Button asChild size="sm" className="w-full h-8 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white">
                        <Link href={`/learn/${enrollment.id}`}>
                          {(enrollment.progressPct || 0) > 0 ? "Continue Course" : "Start Course"}
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-card border rounded-xl text-center space-y-3 text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                <div>
                  <p className="text-sm font-semibold text-foreground">You’re all caught up!</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Explore our catalogue to enroll in a new sustainability topic.</p>
                </div>
                <Button asChild size="sm" variant="outline" className="rounded-lg text-xs font-semibold">
                  <Link href="/courses">Browse Course Catalogue</Link>
                </Button>
              </div>
            )
          )}
        </div>

        {/* SECTION 5 — WORKPLACE ACTION */}
        {isLearnerOnly && workplaceActions && workplaceActions.length > 0 && (
          <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold font-serif text-foreground">Put Learning into Practice</h2>
                <p className="text-xs text-muted-foreground">Active workplace sustainability commitment</p>
              </div>
              <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-800 border-emerald-200">
                Action in Progress
              </Badge>
            </div>

            <div className="p-4 bg-muted/30 rounded-xl border space-y-2">
              <h3 className="text-sm font-bold text-foreground">{workplaceActions[0].commitmentText}</h3>
              <p className="text-xs text-muted-foreground">
                {workplaceActions[0].employeeProgressNote || "Apply your learned sustainability habits to daily workplace operations."}
              </p>
            </div>

            <div className="text-right">
              <Button asChild size="sm" variant="outline" className="rounded-lg text-xs font-semibold">
                <Link href="/dashboard">View Workplace Action &rarr;</Link>
              </Button>
            </div>
          </div>
        )}

        {/* SECTION 6 — QUICK ACCESS */}
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Quick Access
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              href="/dashboard"
              className="p-3.5 bg-card border rounded-xl shadow-sm hover:border-emerald-600/50 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all flex items-center gap-3 group"
            >
              <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                <Award className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground group-hover:text-emerald-700 transition-colors">My Skills</p>
                <p className="text-[10px] text-muted-foreground">Learning & progress</p>
              </div>
            </Link>

            <Link
              href="/courses"
              className="p-3.5 bg-card border rounded-xl shadow-sm hover:border-emerald-600/50 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all flex items-center gap-3 group"
            >
              <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground group-hover:text-emerald-700 transition-colors">Courses</p>
                <p className="text-[10px] text-muted-foreground">Full ESG catalogue</p>
              </div>
            </Link>

            <Link
              href="/challenges"
              className="p-3.5 bg-card border rounded-xl shadow-sm hover:border-emerald-600/50 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all flex items-center gap-3 group"
            >
              <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                <Target className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground group-hover:text-emerald-700 transition-colors">Challenges</p>
                <p className="text-[10px] text-muted-foreground">Monthly targets</p>
              </div>
            </Link>

            {(isAdmin || isMgr) && (
              <Link
                href="/company"
                className="p-3.5 bg-card border rounded-xl shadow-sm hover:border-emerald-600/50 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all flex items-center gap-3 group"
              >
                <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground group-hover:text-emerald-700 transition-colors">Company Hub</p>
                  <p className="text-[10px] text-muted-foreground">Team & reports</p>
                </div>
              </Link>
            )}

            {isSuper && (
              <Link
                href="/platform-admin"
                className="p-3.5 bg-card border rounded-xl shadow-sm hover:border-emerald-600/50 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all flex items-center gap-3 group"
              >
                <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground group-hover:text-emerald-700 transition-colors">Platform Admin</p>
                  <p className="text-[10px] text-muted-foreground">System control</p>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
