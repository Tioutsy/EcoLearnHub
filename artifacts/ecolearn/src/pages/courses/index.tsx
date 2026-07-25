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
  Layers
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";

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

export default function Courses() {
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all"); // 'all' | 'completed' | category slug
  const [recommendation, setRecommendation] = useState<RecommendationData | null>(null);
  const [isLoadingRec, setIsLoadingRec] = useState<boolean>(true);

  const { data: categories, isLoading: isLoadingCategories } = useListCategories();
  
  // Map filter selection to category ID query
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

  // Fetch recommendation
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
    return () => { isMounted = false; };
  }, []);

  // Filter categories order
  const categoryFilters = [
    { slug: "all", label: "All Courses", description: "Browse the complete EcoLearnHub catalogue" },
    { slug: "core-sustainability-certificate", label: "Start Here", description: "Build essential sustainability knowledge across 12 foundation modules" },
    { slug: "sustainability-in-action", label: "Sustainability in Action", description: "Turn sustainability knowledge into workplace processes, actions and evidence" },
    { slug: "sustainability-by-department", label: "By Department", description: "Apply sustainability directly to specialized department roles and workflows" },
    { slug: "leadership-and-sustainability-management", label: "Leadership", description: "Lead initiatives, engage teams and review company sustainability performance" },
    { slug: "completed", label: "Completed", description: "Courses you have successfully completed" },
  ];

  // Filtered courses depending on selected tab
  const displayedCourses = useMemo(() => {
    if (!courses) return [];
    if (selectedFilter === "completed") {
      return courses.filter(c => enrollmentMap.get(c.id)?.status === "completed");
    }
    return courses;
  }, [courses, selectedFilter, enrollmentMap]);

  // Compute Category Progress Summary
  const getCategoryProgressSummary = (catSlug: string) => {
    if (!courses || !categories) return null;
    const cat = categories.find(c => c.slug === catSlug);
    if (!cat) return null;

    // Filter courses assigned to this category
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
                    onClick={() => setSelectedFilter(filter.slug)}
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

                // Lock check (e.g. ELH-12 without core completed)
                const isElh12 = (course as any).courseCode === "ELH-12";
                const coreCompletedCount = Array.from(enrollmentMap.entries())
                  .filter(([_, e]) => e.status === "completed").length;
                const isLocked = isElh12 && coreCompletedCount < 11 && !isCompleted;

                // Determine primary status text
                let statusLabel = "Ready to start";
                let statusBadgeClass = "bg-muted text-muted-foreground border-muted-foreground/20";
                
                if (isCompleted) {
                  statusLabel = "Completed";
                  statusBadgeClass = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
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
                } else if (isLocked) {
                  statusLabel = "Locked";
                  statusBadgeClass = "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30";
                }

                // Determine primary action button text
                let actionText = "Start course";
                let actionHref = `/courses/${course.id}`;
                if (isCompleted) {
                  actionText = "Review course";
                  actionHref = enrollment ? `/learn/${enrollment.id}` : `/courses/${course.id}`;
                } else if (isInProgress && enrollment) {
                  actionText = "Continue course";
                  actionHref = `/learn/${enrollment.id}`;
                } else if (isLocked) {
                  actionText = "View prerequisite";
                  actionHref = `/courses/${course.id}`;
                }

                const primaryCategoryName = (course as any).categoryName || (course as any).primaryCategory?.categoryName || "General Sustainability";

                return (
                  <div key={course.id} className="group bg-card border rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col h-full">
                    {/* Thumbnail Header */}
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      {course.thumbnailUrl ? (
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
                            {isCompleted && <CheckCircle2 className="h-3 w-3 shrink-0" />}
                            {isLocked && <Lock className="h-3 w-3 shrink-0" />}
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
                      </div>

                      {/* Lock Explanation Notice */}
                      {isLocked && (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                          <div className="font-semibold flex items-center gap-1.5">
                            <Lock className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                            <span>Prerequisite Required</span>
                          </div>
                          <p>Complete the remaining Core Sustainability Certificate courses ({coreCompletedCount}/11 completed) to unlock this course.</p>
                        </div>
                      )}

                      {/* Primary Action Button */}
                      <div className="pt-3 border-t">
                        <Link href={actionHref}>
                          <Button
                            variant={isCompleted ? "outline" : isLocked ? "secondary" : "default"}
                            className={cn(
                              "w-full justify-between font-medium rounded-xl text-sm",
                              !isCompleted && !isLocked && "bg-primary text-primary-foreground hover:bg-primary/90"
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
    </Layout>
  );
}