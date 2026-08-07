import { Layout } from "@/components/layout/Layout";
import { useListCourses, useListCategories, useListEnrollments } from "@workspace/api-client-react";
import { customFetch } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Clock, 
  Tag, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  PlayCircle, 
  BookOpen, 
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  Award,
  Layers,
  Info,
  Building2
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { sortCoursesByCode } from "@/lib/courseSorting";
import { useLanguage } from "@/context/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

interface RecommendationData {
  courseId: number;
  courseCode: string | null;
  title: string;
  slug: string | null;
  thumbnailUrl: string | null;
  reasonHeading: string;
  reasonDescription: string;
  actionText: string;
  actionHref: string;
  isLocked: boolean;
  lockReason: string | null;
}

interface PrerequisiteItem {
  courseId: number;
  prerequisiteCourseId: number;
  prerequisiteCourseCode: string | null;
  prerequisiteTitle: string;
  prerequisiteSlug: string | null;
  requirementType: "required" | "recommended";
}

interface CompanySubscriptionData {
  planCode: "ESSENTIAL" | "PROFESSIONAL" | "COMPLETE";
  entitledCourseIds: number[];
}

export default function Courses() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all"); // 'all' | 'completed' | category slug
  const [recommendation, setRecommendation] = useState<RecommendationData | null>(null);
  const [isLoadingRec, setIsLoadingRec] = useState<boolean>(true);
  const [companySub, setCompanySub] = useState<CompanySubscriptionData | null>(null);
  const [selectedDetailsCourse, setSelectedDetailsCourse] = useState<any | null>(null);

  const { data: categories, isLoading: isLoadingCategories } = useListCategories();
  
  const activeCategoryId = useMemo(() => {
    if (selectedFilter === "all" || selectedFilter === "completed") return null;
    const cat = categories?.find(c => c.slug === selectedFilter);
    return cat ? cat.id : null;
  }, [selectedFilter, categories]);

  const { data: courses, isLoading: isLoadingCourses } = useListCourses({
    search: search || null,
    categoryId: activeCategoryId,
  });

  const { data: enrollments } = useListEnrollments();

  // Map enrollments by course ID
  const enrollmentMap = useMemo(() => {
    const map = new Map<number, NonNullable<typeof enrollments>[number]>();
    if (enrollments) {
      for (const e of enrollments) {
        map.set(e.courseId, e);
      }
    }
    return map;
  }, [enrollments]);

  // Fetch recommendation and company subscription context
  useEffect(() => {
    let isMounted = true;
    setIsLoadingRec(true);
    
    customFetch<{ recommendation: RecommendationData | null }>("/api/courses/recommendation")
      .then((res) => {
        if (isMounted) {
          setRecommendation(res?.recommendation || null);
          setIsLoadingRec(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setRecommendation(null);
          setIsLoadingRec(false);
        }
      });

    customFetch<CompanySubscriptionData>("/api/subscriptions/company")
      .then((res) => {
        if (isMounted && res) {
          setCompanySub(res);
        }
      })
      .catch(() => {
        if (isMounted) setCompanySub(null);
      });

    return () => { isMounted = false; };
  }, []);

  // Synchronize filter from URL query params on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    const status = params.get("status");
    if (status === "completed") {
      setSelectedFilter("completed");
    } else if (cat) {
      const valid = categoryFilters.find(f => f.slug === cat);
      if (valid) setSelectedFilter(cat);
    }
  }, []);

  const handleSelectFilter = (slug: string) => {
    setSelectedFilter(slug);
    const url = new URL(window.location.href);
    if (slug === "completed") {
      url.searchParams.set("status", "completed");
      url.searchParams.delete("category");
    } else if (slug === "all") {
      url.searchParams.delete("category");
      url.searchParams.delete("status");
    } else {
      url.searchParams.set("category", slug);
      url.searchParams.delete("status");
    }
    window.history.replaceState({}, "", url.pathname + url.search);
  };

  // Filter categories order
  const categoryFilters = [
    { slug: "all", label: "All Courses", description: "Browse the complete Elevio catalogue" },
    { slug: "core-sustainability-certificate", label: "Start Here", description: "Build essential sustainability knowledge across 12 foundation modules" },
    { slug: "sustainability-in-action", label: "Sustainability in Action", description: "Turn sustainability knowledge into workplace processes, actions and evidence" },
    { slug: "sustainability-by-department", label: "By Department", description: "Apply sustainability directly to specialized department roles and workflows" },
    { slug: "leadership-and-sustainability-management", label: "Leadership", description: "Lead initiatives, engage teams and review company sustainability performance" },
    { slug: "completed", label: "Completed", description: "Courses you have successfully completed" },
  ];

  const displayedCourses = useMemo(() => {
    if (!courses) return [];
    const filtered = selectedFilter === "completed"
      ? courses.filter(c => enrollmentMap.get(c.id)?.status === "completed")
      : courses;
    return sortCoursesByCode(filtered);
  }, [courses, selectedFilter, enrollmentMap]);

  const getCategoryProgressSummary = (catSlug: string) => {
    if (!courses || !categories) return null;
    const cat = categories.find(c => c.slug === catSlug);
    if (!cat) return null;

    const catCourses = courses.filter(c => {
      if ((c as any).categoryAssignments) {
        return (c as any).categoryAssignments.some((a: any) => a.categoryId === cat.id);
      }
      return c.categoryId === cat.id;
    });

    const total = catCourses.length || cat.courseCount || 0;
    const completed = catCourses.filter(c => enrollmentMap.get(c.id)?.status === "completed").length;

    return { completed, total };
  };

  return (
    <Layout>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900/10 via-teal-900/5 to-background py-10 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-full mb-3">
              <Layers className="h-3.5 w-3.5" /> Structured Applied Learning
            </span>
            <h1 className="text-3xl md:text-4xl font-bold font-serif mb-3 tracking-tight">Course Catalogue</h1>
            <p className="text-muted-foreground text-base md:text-lg">
              Practical workplace sustainability and ESG training structured into clear learning categories for the Mauritian workforce.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        
        {/* Recommended Next Course Panel */}
        {isLoadingRec ? (
          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-full max-w-xl mb-4" />
            <Skeleton className="h-10 w-32" />
          </div>
        ) : recommendation ? (
          <div className={cn(
            "relative overflow-hidden bg-card border rounded-2xl p-6 md:p-8 shadow-sm transition-all border-l-4",
            recommendation.isLocked ? "border-l-amber-500 bg-amber-500/5" : "border-l-emerald-600 bg-emerald-500/5"
          )}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-md",
                    recommendation.isLocked ? "bg-amber-500/10 text-amber-700 dark:text-amber-400" : "bg-emerald-600/10 text-emerald-700 dark:text-emerald-400"
                  )}>
                    <Sparkles className="h-3.5 w-3.5" /> Recommended Next Course
                  </span>
                  {recommendation.courseCode && (
                    <span className="text-xs text-muted-foreground font-mono font-medium">
                      {recommendation.courseCode}
                    </span>
                  )}
                </div>
                <h3 className="text-xl md:text-2xl font-bold font-serif">{recommendation.reasonHeading}</h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  {recommendation.reasonDescription}
                </p>
                {recommendation.isLocked && recommendation.lockReason && (
                  <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 font-medium pt-1">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    <span>{recommendation.lockReason}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full md:w-auto">
                <Link href={recommendation.actionHref}>
                  <Button 
                    size="lg" 
                    className={cn(
                      "gap-2 w-full font-medium shadow-sm",
                      recommendation.isLocked ? "bg-amber-600 hover:bg-amber-700 text-white" : "bg-emerald-700 hover:bg-emerald-800 text-white"
                    )}
                  >
                    <span>{recommendation.actionText}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : null}

        {/* Filter Controls & Search */}
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Horizontal Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {categoryFilters.map((filter) => {
                const isActive = selectedFilter === filter.slug;
                return (
                  <button
                    key={filter.slug}
                    onClick={() => handleSelectFilter(filter.slug)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 shrink-0 border",
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-card hover:bg-muted/80 text-muted-foreground border-border"
                    )}
                  >
                    <span>{filter.label}</span>
                    {filter.slug !== "all" && filter.slug !== "completed" && (
                      <span className={cn(
                        "text-xs px-1.5 py-0.5 rounded-full font-mono",
                        isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}>
                        {categories?.find(c => c.slug === filter.slug)?.courseCount || 0}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Search Box */}
            <div className="relative w-full md:w-72 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or topic..."
                className="pl-9 bg-card border-border rounded-xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Active Category Header & Progress Summary */}
          {selectedFilter !== "all" && selectedFilter !== "completed" && (() => {
            const activeCat = categories?.find(c => c.slug === selectedFilter);
            const summary = getCategoryProgressSummary(selectedFilter);
            if (!activeCat) return null;
            return (
              <div className="bg-muted/50 border rounded-2xl p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold font-serif">{activeCat.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{activeCat.description}</p>
                </div>
                {summary && (
                  <div className="flex items-center gap-3 bg-card border px-4 py-2.5 rounded-xl shrink-0">
                    <Award className="h-5 w-5 text-emerald-600 shrink-0" />
                    <div className="text-xs">
                      <span className="font-semibold text-foreground block">Category Progress</span>
                      <span className="text-muted-foreground">{summary.completed} of {summary.total} courses completed</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {selectedFilter === "completed" && (
            <div className="bg-muted/50 border rounded-2xl p-4 md:p-6">
              <h2 className="text-xl font-bold font-serif">Completed Courses</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Courses you have successfully passed. You can review lesson material at any time.
              </p>
            </div>
          )}
        </div>

        {/* Course Cards Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              {isLoadingCourses ? "Loading courses..." : `${displayedCourses.length} ${displayedCourses.length === 1 ? "Course" : "Courses"} available`}
            </h3>
          </div>

          {isLoadingCourses ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="flex flex-col gap-3 border rounded-2xl p-4 bg-card">
                  <Skeleton className="h-44 w-full rounded-xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              ))}
            </div>
          ) : displayedCourses.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground border-2 border-dashed rounded-3xl bg-card/50">
              <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
              <h4 className="text-lg font-semibold text-foreground mb-1">
                {selectedFilter === "completed" ? "No completed courses yet" : "No courses found"}
              </h4>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                {selectedFilter === "completed"
                  ? "Start with Sustainability Foundations to begin building your completed credentials."
                  : "No courses matched your current filter criteria."}
              </p>
              <Button variant="outline" onClick={() => { setSearch(""); setSelectedFilter("all"); }}>
                Reset catalogue filters
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedCourses.map((course) => {
                const enrollment = enrollmentMap.get(course.id);
                const isCompleted = enrollment?.status === "completed";
                const isInProgress = (enrollment?.status as string) === "active" || (enrollment?.status as string) === "in_progress";
                const isOverdue = enrollment?.dueDate && new Date(enrollment.dueDate) < new Date() && !isCompleted;
                const isAssigned = !!enrollment?.dueDate;

                // Commercial Subscription Plan Entitlement Evaluation
                const reqPlanCode = (course as any).requiredPlanCode || "ESSENTIAL";
                const reqPlanName = (course as any).requiredPlanName || "Essential";
                
                let isPlanLocked = false;
                if (companySub) {
                  isPlanLocked = !companySub.entitledCourseIds.includes(course.id) && !isCompleted;
                }

                // Dynamic Prerequisite Lock Check for ALL Courses
                const prereqsList: PrerequisiteItem[] = (course as any).prerequisites || [];
                const missingRequiredPrereqs = prereqsList.filter(p => 
                  p.requirementType === "required" && enrollmentMap.get(p.prerequisiteCourseId)?.status !== "completed"
                );
                const missingRecommendedPrereqs = prereqsList.filter(p => 
                  p.requirementType === "recommended" && enrollmentMap.get(p.prerequisiteCourseId)?.status !== "completed"
                );

                const isElh12 = (course as any).courseCode === "ELH-12";
                const coreCompletedCount = Array.from(enrollmentMap.entries())
                  .filter(([_, e]) => e.status === "completed").length;
                const elh12CoreLocked = isElh12 && coreCompletedCount < 11;

                const isPrereqLocked = !isCompleted && (missingRequiredPrereqs.length > 0 || elh12CoreLocked);

                // Determine primary status text
                let statusLabel = "Ready to start";
                let statusBadgeClass = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
                
                if (isCompleted) {
                  statusLabel = "Completed";
                  statusBadgeClass = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
                } else if (isPlanLocked) {
                  statusLabel = `Available with ${reqPlanName}`;
                  statusBadgeClass = "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30 font-semibold";
                } else if (isOverdue) {
                  statusLabel = "Assigned · Overdue";
                  statusBadgeClass = "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30";
                } else if (isAssigned && isInProgress) {
                  statusLabel = "Assigned · In progress";
                  statusBadgeClass = "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30";
                } else if (isAssigned) {
                  statusLabel = "Assigned";
                  statusBadgeClass = "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30";
                } else if (isInProgress) {
                  statusLabel = "In progress";
                  statusBadgeClass = "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30";
                } else if (isPrereqLocked) {
                  statusLabel = "Locked · Prerequisite Required";
                  statusBadgeClass = "bg-blue-600/10 text-blue-800 dark:text-blue-300 border-blue-500/40 font-semibold";
                }

                // Primary action button text & link
                let actionText = "Start course";
                let actionHref = `/courses/${course.id}`;

                if (isCompleted) {
                  actionText = "Review course";
                  actionHref = enrollment ? `/learn/${enrollment.id}` : `/courses/${course.id}`;
                } else if (isPlanLocked) {
                  actionText = "View plan";
                  actionHref = `/pricing`;
                } else if (isInProgress && enrollment) {
                  actionText = "Continue course";
                  actionHref = `/learn/${enrollment.id}`;
                } else if (isPrereqLocked) {
                  actionText = "View prerequisite";
                  const firstMissing = missingRequiredPrereqs[0];
                  actionHref = firstMissing ? `/courses/${firstMissing.prerequisiteCourseId}` : `/courses/${course.id}`;
                }

                const primaryCategoryName = (course as any).categoryName || (course as any).primaryCategory?.categoryName || "General Sustainability";

                return (
                  <div key={course.id} className={cn(
                    "group bg-card border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full",
                    isPlanLocked ? "border-purple-300 dark:border-purple-800/60 bg-purple-50/10 dark:bg-purple-950/10" : isPrereqLocked ? "border-blue-300 dark:border-blue-800/60 bg-blue-50/20 dark:bg-blue-950/10" : "hover:border-primary/40"
                  )}>
                    {/* Thumbnail Header */}
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      {course.thumbnailUrl ? (
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (course.courseCode === "ELH-30" || course.slug === "climate-risk-and-workplace-resilience") {
                              target.src = "https://raw.githubusercontent.com/Tioutsy/EcoLearnHub/main/artifacts/ecolearn/public/images/courses/climate-risk-and-workplace-resilience.jpg";
                            }
                          }}
                          className={cn(
                            "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105",
                            (isPrereqLocked || isPlanLocked) && "opacity-85 grayscale-[20%]"
                          )}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-950 to-teal-900 flex items-center justify-center p-4 text-center">
                          <span className="text-white font-serif font-bold text-lg">{course.title}</span>
                        </div>
                      )}
                      
                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                        <span className="bg-background/90 backdrop-blur-sm text-foreground text-xs font-semibold px-2.5 py-1 rounded-md shadow-sm border">
                          {primaryCategoryName}
                        </span>
                        
                        {(course as any).courseCode && (
                          <span className="bg-black/70 backdrop-blur-sm text-white font-mono text-xs px-2 py-0.5 rounded-md font-medium">
                            {(course as any).courseCode}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        {/* Status Badge & Duration */}
                        <div className="flex items-center justify-between text-xs gap-2">
                          <span className={cn("px-2.5 py-0.5 rounded-md font-semibold border text-xs flex items-center gap-1", statusBadgeClass)}>
                            {isCompleted && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />}
                            {isPlanLocked && <Building2 className="h-3.5 w-3.5 shrink-0 text-purple-600" />}
                            {isPrereqLocked && <Lock className="h-3.5 w-3.5 shrink-0 text-blue-700 dark:text-blue-400" />}
                            {statusLabel}
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground font-medium">
                            <Clock className="h-3.5 w-3.5" /> {course.durationMinutes} min
                          </span>
                        </div>

                        <h4 className="text-lg font-bold font-serif line-clamp-2 group-hover:text-primary transition-colors">
                          {course.title}
                        </h4>
                        
                        <p className="text-muted-foreground text-sm line-clamp-2">
                          {course.description}
                        </p>
                        
                        {/* Course Language & View Details Control (Sprint 9V / 11K) */}
                        <div className="pt-1 flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded border">
                            <Info className="h-3 w-3 text-emerald-600" />
                            {t("course.available_in_english")}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedDetailsCourse(course);
                            }}
                            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                            aria-label={`View details for ${course.title}`}
                          >
                            <span>View details</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Commercial Subscription Plan Lock Notice */}
                      {isPlanLocked && (
                        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3 text-xs text-purple-900 dark:text-purple-200 space-y-1">
                          <div className="font-semibold flex items-center justify-between gap-1.5 text-purple-800 dark:text-purple-300">
                            <span className="flex items-center gap-1.5">
                              <Building2 className="h-3.5 w-3.5 shrink-0 text-purple-600" />
                              <span>Included in {reqPlanName} Plan</span>
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedDetailsCourse(course);
                              }}
                              className="text-[11px] underline font-normal text-purple-700 dark:text-purple-300 hover:text-purple-900 cursor-pointer"
                            >
                              View details
                            </button>
                          </div>
                          <p>This course is included in your company's <span className="font-semibold">{reqPlanName}</span> plan. Contact your company administrator to upgrade access.</p>
                        </div>
                      )}

                      {/* Compact Prerequisite Notice & Popover Details */}
                      {!isPlanLocked && isPrereqLocked && (
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-xs text-blue-900 dark:text-blue-200 space-y-1">
                          <div className="font-semibold flex items-center justify-between gap-1.5 text-blue-800 dark:text-blue-300">
                            <span className="flex items-center gap-1.5">
                              <Lock className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
                              <span>{missingRequiredPrereqs.length > 1 ? `${missingRequiredPrereqs.length} prerequisites required` : "Prerequisite required"}</span>
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedDetailsCourse(course);
                              }}
                              className="text-[11px] underline font-normal text-blue-700 dark:text-blue-300 hover:text-blue-900 cursor-pointer"
                            >
                              View details
                            </button>
                          </div>
                          {isElh12 && coreCompletedCount < 11 ? (
                            <p className="text-muted-foreground">Complete 11 Core Courses ({coreCompletedCount}/11 finished) to unlock.</p>
                          ) : missingRequiredPrereqs.length === 1 ? (
                            <p className="line-clamp-1 font-medium">{missingRequiredPrereqs[0].prerequisiteCourseCode ? `${missingRequiredPrereqs[0].prerequisiteCourseCode}: ` : ''}{missingRequiredPrereqs[0].prerequisiteTitle}</p>
                          ) : (
                            <p className="text-muted-foreground">Requires {missingRequiredPrereqs.map(p => p.prerequisiteCourseCode).filter(Boolean).join(", ") || `${missingRequiredPrereqs.length} courses`}</p>
                          )}
                        </div>
                      )}

                      {!isPlanLocked && !isPrereqLocked && !isCompleted && missingRecommendedPrereqs.length > 0 && (
                        <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl p-3 text-xs text-sky-900 dark:text-sky-200 space-y-1">
                          <div className="font-semibold flex items-center justify-between gap-1.5 text-sky-800 dark:text-sky-300">
                            <span className="flex items-center gap-1.5">
                              <Info className="h-3.5 w-3.5 shrink-0 text-sky-600 dark:text-sky-400" />
                              <span>{missingRecommendedPrereqs.length > 1 ? `${missingRecommendedPrereqs.length} recommended prerequisites` : "Recommended first"}</span>
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedDetailsCourse(course);
                              }}
                              className="text-[11px] underline font-normal text-sky-700 dark:text-sky-300 hover:text-sky-900 cursor-pointer"
                            >
                              View details
                            </button>
                          </div>
                          {missingRecommendedPrereqs.length === 1 ? (
                            <p className="line-clamp-1 font-medium">{missingRecommendedPrereqs[0].prerequisiteCourseCode ? `${missingRecommendedPrereqs[0].prerequisiteCourseCode}: ` : ''}{missingRecommendedPrereqs[0].prerequisiteTitle}</p>
                          ) : (
                            <p className="text-muted-foreground">Recommended: {missingRecommendedPrereqs.map(p => p.prerequisiteCourseCode).filter(Boolean).join(", ") || `${missingRecommendedPrereqs.length} courses`}</p>
                          )}
                        </div>
                      )}

                      {/* Action Buttons Area (Sprint 11K) */}
                      <div className="pt-3 border-t flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedDetailsCourse(course);
                          }}
                          className="font-medium rounded-xl text-xs px-3 h-9 shrink-0 border-border text-foreground hover:bg-muted"
                          aria-label={`View details for ${course.title}`}
                        >
                          <span>View details</span>
                        </Button>
                        <Link href={actionHref} className="flex-1">
                          <Button
                            variant={isCompleted ? "outline" : isPlanLocked ? "secondary" : isPrereqLocked ? "secondary" : "default"}
                            className={cn(
                              "w-full justify-between font-medium rounded-xl text-sm h-9 transition-all",
                              isPlanLocked && "bg-purple-700 text-white hover:bg-purple-800 shadow-sm",
                              !isPlanLocked && isPrereqLocked && "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
                              !isCompleted && !isPlanLocked && !isPrereqLocked && "bg-primary text-primary-foreground hover:bg-primary/90"
                            )}
                          >
                            <span>{actionText}</span>
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Accessible Course Details & Prerequisites Dialog */}
      <Dialog open={!!selectedDetailsCourse} onOpenChange={(open) => { if (!open) setSelectedDetailsCourse(null); }}>
        {selectedDetailsCourse && (() => {
          const course = selectedDetailsCourse;
          const enrollment = enrollmentMap.get(course.id);
          const isCompleted = enrollment?.status === "completed";
          const isInProgress = (enrollment?.status as string) === "active" || (enrollment?.status as string) === "in_progress";
          
          let isPlanLocked = false;
          if (companySub) {
            isPlanLocked = !companySub.entitledCourseIds.includes(course.id) && !isCompleted;
          }

          const prereqsList: PrerequisiteItem[] = (course as any).prerequisites || [];
          const missingRequired = prereqsList.filter(p => 
            p.requirementType === "required" && enrollmentMap.get(p.prerequisiteCourseId)?.status !== "completed"
          );
          const isElh12 = (course as any).courseCode === "ELH-12";
          const coreCompletedCount = Array.from(enrollmentMap.entries()).filter(([_, e]) => e.status === "completed").length;
          const elh12CoreLocked = isElh12 && coreCompletedCount < 11;
          const isPrereqLocked = !isCompleted && (missingRequired.length > 0 || elh12CoreLocked);

          let actionText = "Start course";
          let actionHref = `/courses/${course.id}`;
          if (isCompleted) {
            actionText = "Review course";
            actionHref = enrollment ? `/learn/${enrollment.id}` : `/courses/${course.id}`;
          } else if (isPlanLocked) {
            actionText = "View upgrade options";
            actionHref = `/pricing`;
          } else if (isInProgress && enrollment) {
            actionText = "Continue course";
            actionHref = `/learn/${enrollment.id}`;
          } else if (isPrereqLocked) {
            actionText = "Complete prerequisite first";
            const firstMissing = missingRequired[0];
            actionHref = firstMissing ? `/courses/${firstMissing.prerequisiteCourseId}` : `/courses/${course.id}`;
          }

          return (
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl p-6">
              <DialogHeader className="space-y-2">
                <div className="flex items-center gap-2">
                  {(course as any).courseCode && (
                    <span className="bg-primary/10 text-primary font-mono text-xs px-2.5 py-0.5 rounded-md font-semibold">
                      {(course as any).courseCode}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {course.durationMinutes} minutes
                  </span>
                  <span className="text-xs text-muted-foreground font-medium border-l pl-2">
                    {course.level}
                  </span>
                </div>
                <DialogTitle className="text-2xl font-bold font-serif">{course.title}</DialogTitle>
                <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
                  {course.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 py-3 border-y my-2">
                {/* Course Objectives */}
                {course.learningObjectives && course.learningObjectives.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Learning Objectives</h5>
                    <ul className="space-y-1.5 text-xs text-foreground">
                      {(course.learningObjectives as string[]).map((obj, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 mt-0.5" />
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Prerequisites Section */}
                <div className="space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                    <span>Prerequisites</span>
                    <span className="text-[11px] font-normal normal-case text-muted-foreground">
                      {prereqsList.length === 0 && !isElh12 ? "None required" : `${prereqsList.length} defined`}
                    </span>
                  </h5>

                  {isElh12 && coreCompletedCount < 11 && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 text-xs space-y-1.5">
                      <div className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                        <Lock className="h-4 w-4 shrink-0 text-amber-600" />
                        <span>11 Foundation Core Courses Required</span>
                      </div>
                      <p className="text-muted-foreground">You have completed {coreCompletedCount}/11 core courses. Complete all 11 foundation modules before attempting the final certification exam.</p>
                    </div>
                  )}

                  {prereqsList.length === 0 && !isElh12 ? (
                    <div className="bg-muted/50 border rounded-xl p-3.5 text-xs text-muted-foreground flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>None — you can start this course directly without prerequisites.</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {prereqsList.map((p) => {
                        const isDone = enrollmentMap.get(p.prerequisiteCourseId)?.status === "completed";
                        return (
                          <div
                            key={p.prerequisiteCourseId}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-xl border text-xs transition-colors",
                              isDone ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-900 dark:text-emerald-200" : "bg-card border-border text-foreground"
                            )}
                          >
                            <div className="space-y-0.5 max-w-[75%]">
                              <div className="font-semibold flex items-center gap-1.5">
                                {p.prerequisiteCourseCode && (
                                  <span className="font-mono text-[11px] text-muted-foreground">{p.prerequisiteCourseCode}:</span>
                                )}
                                <span>{p.prerequisiteTitle}</span>
                              </div>
                              <span className="text-[11px] text-muted-foreground capitalize">
                                {p.requirementType === "required" ? "Required prerequisite" : "Recommended preliminary course"}
                              </span>
                            </div>
                            <span className={cn(
                              "px-2.5 py-1 rounded-md text-[11px] font-semibold border flex items-center gap-1 shrink-0",
                              isDone ? "bg-emerald-600 text-white border-emerald-700" : "bg-muted text-muted-foreground border-border"
                            )}>
                              {isDone ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3" />
                                  <span>Completed</span>
                                </>
                              ) : (
                                <>
                                  <Lock className="h-3 w-3" />
                                  <span>Required</span>
                                </>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setSelectedDetailsCourse(null)}>
                  Close
                </Button>
                <Link href={actionHref} onClick={() => setSelectedDetailsCourse(null)}>
                  <Button
                    variant={isCompleted ? "outline" : isPrereqLocked ? "secondary" : "default"}
                    className={cn(
                      "font-semibold rounded-xl transition-all",
                      !isCompleted && !isPrereqLocked && "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    <span>{actionText}</span>
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </DialogContent>
          );
        })()}
      </Dialog>
    </Layout>
  );
}