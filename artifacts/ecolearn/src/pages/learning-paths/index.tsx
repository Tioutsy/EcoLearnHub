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
  Circle,
  Clock,
  BookOpen,
  PlayCircle,
} from "lucide-react";
import { Link } from "wouter";
import type { LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  users: Users,
  "concierge-bell": ConciergeBell,
  "building-2": Building2,
  factory: Factory,
  route: RouteIcon,
};

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
  const { data: paths, isLoading } = useListLearningPaths();

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
        {isLoading ? (
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
        ) : paths?.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed rounded-2xl bg-muted/10">
            <RouteIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">No learning paths yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Learning paths will appear here once they have been published.
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {paths?.map((path) => {
              const Icon = ICONS[path.icon] ?? RouteIcon;
              const isComplete =
                path.totalModules > 0 &&
                path.completedModules === path.totalModules;
              const nextModule = path.modules.find((m) => !m.completed);

              return (
                <div
                  key={path.id}
                  className="bg-card border rounded-2xl overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                >
                  <div className="p-6 border-b">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h2 className="font-bold font-serif text-xl">
                            {path.title}
                          </h2>
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary/15 text-secondary-foreground border">
                            {path.audience}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {path.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-medium">
                          {path.completedModules} of {path.totalModules} modules
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
                          {path.totalModules} modules
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDuration(path.totalMinutes)} total
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 flex-1">
                    <ol className="space-y-3">
                      {path.modules.map((mod, index) => (
                        <li
                          key={mod.courseId}
                          className="flex items-start gap-3"
                        >
                          {mod.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground/40 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/courses/${mod.courseId}`}
                              className={`text-sm font-medium hover:text-primary transition-colors ${
                                mod.completed
                                  ? "text-muted-foreground"
                                  : "text-foreground"
                              }`}
                            >
                              {index + 1}. {mod.courseTitle}
                            </Link>
                            <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                              <span>{LEVEL_LABEL[mod.level] ?? mod.level}</span>
                              <span>{formatDuration(mod.durationMinutes)}</span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="p-6 pt-0">
                    {path.totalModules === 0 ? (
                      <Button variant="outline" className="w-full" disabled>
                        No modules assigned yet
                      </Button>
                    ) : isComplete ? (
                      <Button variant="outline" className="w-full" disabled>
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Path completed
                      </Button>
                    ) : (
                      <Button className="w-full" asChild>
                        <Link
                          href={`/courses/${
                            nextModule?.courseId ?? path.modules[0]?.courseId
                          }`}
                        >
                          <PlayCircle className="mr-2 h-4 w-4" />
                          {path.completedModules > 0
                            ? "Continue path"
                            : "Start path"}
                        </Link>
                      </Button>
                    )}
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
