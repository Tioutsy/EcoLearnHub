import { useParams, Link } from "wouter";
import { useGetLearningPathDetails } from "./hooks";
import { Layout } from "@/components/layout/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Route as RouteIcon,
  CheckCircle2,
  Clock,
  BookOpen,
  PlayCircle,
  Lock,
  ArrowLeft,
  Award,
  ShieldCheck
} from "lucide-react";

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
}

export default function LearningPathDetail() {
  const params = useParams<{ slug: string }>();
  const { data: path, isLoading, error, refetch } = useGetLearningPathDetails(params.slug!) as any;

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-24 w-full mb-8" />
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center max-w-md">
          <RouteIcon className="h-16 w-16 text-destructive mx-auto mb-4 opacity-70" />
          <h2 className="text-2xl font-bold mb-4">We could not load this learning path</h2>
          <p className="text-muted-foreground mb-8">
            Please try again.
          </p>
          <Button onClick={() => refetch()} variant="destructive">
            Retry
          </Button>
        </div>
      </Layout>
    );
  }

  if (!path) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center max-w-md">
          <RouteIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-4 font-serif">Learning Path Not Found</h2>
          <p className="text-muted-foreground mb-8">
            The learning path you are looking for does not exist or has been removed.
          </p>
          <Button asChild>
            <Link href="/learning-paths">Return to Learning Paths</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const { nextCourse } = path;
  const nextCourseId = typeof nextCourse === 'object' && nextCourse ? (nextCourse as any).id : (nextCourse as any) as number | null | undefined;

  return (
    <Layout>
      {/* Header */}
      <div className="bg-primary/5 border-b py-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link href="/learning-paths" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to paths
          </Link>
          
          <div className="flex items-center gap-2 text-sm font-medium text-primary mb-3">
            <RouteIcon className="h-4 w-4" />
            Learning Path
          </div>
          
          <h1 className="text-3xl font-bold font-serif mb-4 flex items-center gap-3">
            {path.title}
          </h1>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {path.isSystemManaged && (
              <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                <ShieldCheck className="w-3 h-3" /> System Managed
              </span>
            )}
            <span className="text-xs font-medium px-2 py-1 rounded bg-secondary/15 text-secondary-foreground border">
              Target: {path.audience}
            </span>
            <span className="text-xs font-medium px-2 py-1 rounded bg-secondary/15 text-secondary-foreground border">
              Level: {path.level}
            </span>
            <span className="text-xs font-medium px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20">
              {path.providerLabel}
            </span>
          </div>

          <p className="text-muted-foreground max-w-2xl mb-8">
            {path.description}
          </p>

          <div className="bg-card border rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center justify-between shadow-sm">
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium">
                  {path.completedCourses} of {path.totalCourses} courses completed
                </span>
                <span className="text-muted-foreground font-medium">
                  {path.progressPct}% complete
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${path.progressPct}%` }}
                />
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  {path.totalCourses} courses
                </span>
                {path.estimatedDurationMinutes && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {formatDuration(path.estimatedDurationMinutes)}
                  </span>
                )}
                {path.isComplete && (
                  <span className="flex items-center gap-1.5 text-green-600 font-medium">
                    <Award className="h-4 w-4" />
                    Completed
                  </span>
                )}
              </div>
            </div>
            
            <div className="shrink-0 w-full md:w-auto">
              {!path.courses || path.courses.length === 0 ? (
                <Button size="lg" className="w-full" disabled>
                  No courses available
                </Button>
              ) : path.isComplete ? (
                <Button size="lg" className="w-full" asChild variant="outline">
                  <Link href={`/courses/${path.courses[0].course.id}`}>
                    Review learning path
                  </Link>
                </Button>
              ) : nextCourseId ? (
                <Button size="lg" className="w-full" asChild>
                  <Link href={`/courses/${nextCourseId}`}>
                    <PlayCircle className="mr-2 h-5 w-5" />
                    {path.completedCourses > 0 ? "Continue learning path" : "Start learning path"}
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Course List */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h2 className="text-2xl font-bold font-serif mb-6">Course Journey</h2>
        <div className="space-y-4">
          {!path.courses || path.courses.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed rounded-2xl bg-muted/10">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold mb-2">This learning path does not yet contain any courses</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Please check again later or contact your EcoLearnHub administrator.
              </p>
            </div>
          ) : (
            path.courses.map((pc: any, idx: number) => {
              const isCompleted = pc.status === 'completed';
            const isLocked = pc.isLocked;
            const inProgress = pc.status === 'in_progress';
            const isNext = !isCompleted && !isLocked && pc.course.id === nextCourseId;

            return (
              <div 
                key={pc.course.id} 
                className={`relative bg-card border rounded-2xl p-6 transition-all ${
                  isLocked ? 'opacity-75 bg-muted/30' : 
                  isNext ? 'ring-2 ring-primary border-transparent shadow-md' : 'hover:shadow-sm'
                }`}
              >
                {/* Connecting line */}
                {idx !== path.courses.length - 1 && (
                  <div className="absolute left-[39px] top-[72px] bottom-[-32px] w-[2px] bg-border z-0 hidden sm:block" />
                )}

                <div className="flex items-start gap-4 sm:gap-6 relative z-10">
                  {/* Status Icon */}
                  <div className="shrink-0 mt-1">
                    {isCompleted ? (
                      <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                    ) : isLocked ? (
                      <div className="h-8 w-8 rounded-full bg-muted border text-muted-foreground flex items-center justify-center">
                        <Lock className="h-4 w-4" />
                      </div>
                    ) : inProgress ? (
                      <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 border border-blue-200 flex items-center justify-center">
                        <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-card border-2 border-muted-foreground/30 flex items-center justify-center">
                        <span className="text-xs font-medium text-muted-foreground">{pc.position}</span>
                      </div>
                    )}
                  </div>

                  {/* Course Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-muted-foreground">Step {pc.position}</span>
                          {pc.isRequired && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary">Required</span>
                          )}
                        </div>
                        
                        {isLocked ? (
                          <h3 className="text-lg font-bold font-serif mb-1 text-muted-foreground">{pc.course.title}</h3>
                        ) : (
                          <Link href={`/courses/${pc.course.id}`} className="hover:text-primary transition-colors">
                            <h3 className="text-lg font-bold font-serif mb-1">{pc.course.title}</h3>
                          </Link>
                        )}
                        
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {pc.course.description}
                        </p>
                        
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="capitalize">{pc.course.level}</span>
                          <span>&bull;</span>
                          <span>{formatDuration(pc.course.durationMinutes || 60)}</span>
                        </div>
                      </div>
                      
                      <div className="shrink-0 mt-2 sm:mt-0">
                        {isLocked ? (
                          <Button variant="outline" disabled className="w-full sm:w-auto">
                            <Lock className="mr-2 h-4 w-4" /> {pc.action}
                          </Button>
                        ) : (
                          <Button 
                            variant={isCompleted ? "outline" : (isNext ? "default" : "secondary")}
                            asChild
                            className="w-full sm:w-auto"
                          >
                            <Link href={`/courses/${pc.course.id}`}>
                              {isCompleted ? 'Review' : (inProgress ? 'Continue' : 'Start')}
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
          )}
        </div>
      </div>
    </Layout>
  );
}
