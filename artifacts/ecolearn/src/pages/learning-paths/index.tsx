import { Layout } from "@/components/layout/Layout";
import { useListLearningPaths } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Route as RouteIcon,
  Users,
  ConciergeBell,
  Building2,
  Factory,
  CheckCircle2,
  Clock,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Link } from "wouter";

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
}

const LEVEL_LABEL: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export default function LearningPaths() {
  const { data: paths, isLoading, error, refetch } = useListLearningPaths() as any;

  return (
    <Layout>
      <div className="bg-primary/5 border-b py-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm font-medium text-primary mb-3">
            <RouteIcon className="h-4 w-4" />
            Structured learning journeys
          </div>
          <h1 className="text-3xl font-bold font-serif mb-2">Learning Paths</h1>
          <p className="text-muted-foreground max-w-2xl">
            Role-based journeys that guide your team through the right courses in
            the right order, from environmental foundations to ESG reporting.
            Follow a path and track how far each learner has progressed.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {error ? (
          <div className="py-16 text-center border-2 border-dashed border-destructive/30 rounded-2xl bg-destructive/5 max-w-xl mx-auto">
            <RouteIcon className="h-16 w-16 text-destructive mx-auto mb-4 opacity-70" />
            <h3 className="text-xl font-bold mb-2">We could not load the learning paths</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Please try again. If the problem continues, contact your EcoLearnHub administrator.
            </p>
            <Button onClick={() => refetch()} variant="destructive">
              Retry
            </Button>
          </div>
        ) : isLoading ? (
          <div className="grid lg:grid-cols-2 gap-8">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="border rounded-2xl p-6">
                  <Skeleton className="h-12 w-12 rounded-xl mb-4" />
                  <Skeleton className="h-6 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-4/5 mb-6" />
                  <Skeleton className="h-3 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
          </div>
        ) : !paths || paths.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed rounded-2xl bg-muted/10">
            <RouteIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">No learning paths are currently available</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Published learning paths will appear here when they are ready.
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {paths.map((path: any) => {
              const Icon = RouteIcon;
              
              return (
                <div
                  key={path.id}
                  className="bg-card border rounded-2xl overflow-hidden flex flex-col hover:shadow-md transition-shadow relative"
                >
                  <div className="p-6 border-b flex-1">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h2 className="font-bold font-serif text-xl">
                            {path.title}
                          </h2>
                          {path.isSystemManaged && (
                            <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                              <ShieldCheck className="w-3 h-3" /> System Managed
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {path.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4 mb-4">
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

                    <div className="mt-5">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-medium">
                          {path.completedCourses} of {path.totalCourses} courses
                          completed
                        </span>
                        <span className="text-muted-foreground">
                          {path.progressPct}% complete
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${path.progressPct}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3.5 w-3.5" />
                          {path.totalCourses} courses
                        </span>
                        {path.estimatedDurationMinutes && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDuration(path.estimatedDurationMinutes)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-muted/30">
                    <div className="flex flex-col gap-4">
                      {path.nextCourse && (
                        <div className="text-sm">
                          <span className="text-muted-foreground block mb-1">Up next:</span>
                          <span className="font-medium line-clamp-1">{path.nextCourse.title}</span>
                        </div>
                      )}
                      
                      <Button className="w-full" asChild variant={path.isComplete ? "outline" : "default"}>
                        <Link href={`/learning-paths/${path.slug}`}>
                          {path.isComplete ? (
                            <>
                              <CheckCircle2 className="mr-2 h-4 w-4" /> Review completed path
                            </>
                          ) : path.progressPct > 0 ? (
                            <>
                              Continue learning path <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          ) : (
                            <>
                              View learning path <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
