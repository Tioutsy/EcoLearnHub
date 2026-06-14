import { useGetEnrollment, useUpdateProgress } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlayCircle, FileText, CheckCircle2, ChevronRight, Award } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Learn() {
  const { enrollmentId } = useParams();
  const id = parseInt(enrollmentId || "0", 10);
  const { data: enrollment, isLoading } = useGetEnrollment(id, { query: { enabled: !!id, queryKey: ['enrollment', id] } });
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  const updateProgress = useUpdateProgress();
  const { toast } = useToast();

  useEffect(() => {
    // If we have course data with lessons, and no active lesson is selected, select the first uncompleted one
    if (enrollment && enrollment.course && enrollment.course.lessons) {
      if (activeLessonId === null) {
        // Mock checking progress. In reality, we'd need useGetProgress(enrollment.id)
        // Since useGetProgress is not in the enrollment type, we'll just pick the first lesson for now
        const firstLesson = enrollment.course.lessons[0];
        if (firstLesson) {
          setActiveLessonId(firstLesson.id);
        }
      }
    }
  }, [enrollment, activeLessonId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="h-16 border-b flex items-center px-4 shrink-0">
          <Skeleton className="h-6 w-32" />
        </header>
        <div className="flex-1 flex overflow-hidden">
          <div className="w-80 border-r p-4 hidden md:block">
            <Skeleton className="h-8 w-full mb-6" />
            <div className="space-y-4">
              {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          </div>
          <div className="flex-1 p-8">
            <Skeleton className="h-[400px] w-full rounded-xl mb-8" />
            <Skeleton className="h-8 w-1/3 mb-4" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!enrollment || !enrollment.course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Enrollment not found</h2>
          <Button asChild><Link href="/dashboard">Back to Dashboard</Link></Button>
        </div>
      </div>
    );
  }

  const course = enrollment.course;
  const lessons = course.lessons || [];
  const activeLesson = lessons.find(l => l.id === activeLessonId) || lessons[0];

  const handleMarkComplete = () => {
    if (!activeLesson) return;
    
    updateProgress.mutate(
      { enrollmentId: id, data: { lessonId: activeLesson.id, completed: true } },
      {
        onSuccess: () => {
          toast({ title: "Lesson completed!" });
          // Find next lesson
          const currentIndex = lessons.findIndex(l => l.id === activeLesson.id);
          if (currentIndex < lessons.length - 1) {
            setActiveLessonId(lessons[currentIndex + 1].id);
          } else {
            // Course finished? Check quiz if exists
            toast({ title: "Course content finished!", description: "Ready for the quiz?" });
          }
        }
      }
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background h-screen">
      {/* Header */}
      <header className="h-16 border-b flex items-center justify-between px-4 shrink-0 bg-card">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="font-serif font-semibold text-lg truncate max-w-sm">
            {enrollment.courseName}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium text-muted-foreground hidden sm:block">
            {Math.round(enrollment.progressPct || 0)}% Complete
          </div>
          <Button size="sm" asChild variant="outline">
            <Link href={`/quiz/${course.id}`}>Take Quiz</Link>
          </Button>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 border-r bg-muted/20 flex flex-col shrink-0 overflow-y-auto hidden md:flex">
          <div className="p-4 border-b">
            <h3 className="font-semibold mb-2">Course Content</h3>
            <div className="w-full bg-secondary/20 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-500" 
                style={{ width: `${enrollment.progressPct || 0}%` }}
              />
            </div>
          </div>
          <div className="flex-1 py-2">
            {lessons.map((lesson, index) => {
              const isActive = lesson.id === activeLessonId;
              // Mock completed status, would normally come from progress API
              const isCompleted = false; 

              return (
                <button
                  key={lesson.id}
                  onClick={() => setActiveLessonId(lesson.id)}
                  className={`w-full flex items-start gap-3 p-4 text-left transition-colors border-l-2 ${
                    isActive 
                      ? 'bg-primary/5 border-primary' 
                      : 'border-transparent hover:bg-muted/50'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : lesson.videoUrl ? (
                      <PlayCircle className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    ) : (
                      <FileText className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-sm leading-tight ${isActive ? 'text-foreground' : 'text-muted-foreground'} mb-1`}>
                      {index + 1}. {lesson.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {lesson.durationMinutes} min
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Player Area */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-background relative">
          {activeLesson ? (
            <div className="max-w-4xl mx-auto w-full p-4 md:p-8 space-y-8">
              {activeLesson.videoUrl ? (
                <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg border relative flex items-center justify-center">
                  {/* Fake video player since we don't have real videos */}
                  <PlayCircle className="h-16 w-16 text-white/50" />
                  <div className="absolute bottom-4 left-4 text-white/70 font-mono text-sm">
                    {activeLesson.videoUrl}
                  </div>
                </div>
              ) : (
                <div className="aspect-[4/3] bg-muted rounded-xl flex items-center justify-center border text-muted-foreground">
                  <FileText className="h-12 w-12 opacity-50 mb-2 block" />
                  <span>Document Viewer Placeholder</span>
                </div>
              )}

              <div>
                <h1 className="text-3xl font-bold font-serif mb-4">{activeLesson.title}</h1>
                <div className="prose prose-lg max-w-none text-muted-foreground">
                  {activeLesson.content || "No detailed description provided for this lesson."}
                </div>
              </div>

              {activeLesson.pdfUrl && (
                <div className="p-4 border rounded-xl bg-card flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <div className="font-semibold text-sm">Download Materials</div>
                      <div className="text-xs text-muted-foreground">PDF Document</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Download</Button>
                </div>
              )}

              <div className="flex items-center justify-end pt-8 border-t">
                <Button 
                  size="lg" 
                  onClick={handleMarkComplete}
                  disabled={updateProgress.isPending}
                >
                  {updateProgress.isPending ? "Updating..." : "Mark Complete & Continue"}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select a lesson to begin
            </div>
          )}
        </main>
      </div>
    </div>
  );
}