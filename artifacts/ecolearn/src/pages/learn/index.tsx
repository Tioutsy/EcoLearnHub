import { useGetEnrollment, useUpdateProgress, useGetProgress, useGetCourse, useCreateEnrollment } from "@workspace/api-client-react";
import { useParams, Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, PlayCircle, FileText, CheckCircle2, ChevronRight, Award, GraduationCap, BookOpen, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import DatabaseCoursePlayer from "./DatabaseCoursePlayer";

export default function Learn() {
  const { enrollmentId } = useParams();
  const id = parseInt(enrollmentId || "0", 10);
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { data: enrollment, isLoading: isEnrollmentLoading } = useGetEnrollment(id, {
    query: { enabled: !!id, queryKey: ["enrollment", id], retry: 1 },
  });
  const { data: fallbackCourse, isLoading: isCourseLoading } = useGetCourse(id, {
    query: { enabled: !enrollment && !!id, queryKey: ["course", id], retry: 1 },
  });
  const { data: progressRows } = useGetProgress(id, { query: { enabled: !!id, queryKey: ["progress", id] } });
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  const updateProgress = useUpdateProgress();
  const enrollMutation = useCreateEnrollment();
  const { toast } = useToast();

  const completedIds = new Set((progressRows || []).filter((p) => p.completed).map((p) => p.lessonId));

  useEffect(() => {
    if (enrollment && enrollment.course && enrollment.course.lessons && activeLessonId === null) {
      const lessons = enrollment.course.lessons;
      // Resume at the first lesson that isn't completed yet, else the first lesson
      const firstUncompleted = lessons.find((l) => !completedIds.has(l.id));
      const target = firstUncompleted || lessons[0];
      if (target) setActiveLessonId(target.id);
    }
  }, [enrollment, activeLessonId, progressRows]);

  const handleEnrollAndStart = () => {
    if (!id) return;
    enrollMutation.mutate(
      { data: { courseId: id } },
      {
        onSuccess: (newEnrollment) => {
          queryClient.invalidateQueries({ queryKey: ["enrollment", newEnrollment.id] });
          queryClient.invalidateQueries({ queryKey: ["/api/enrollments"] });
          toast({
            title: "Course Enrolled",
            description: "Opening course player...",
          });
          setLocation(`/learn/${newEnrollment.id}`);
        },
        onError: (err: any) => {
          toast({
            title: "Enrollment Error",
            description: err?.message || "Could not enroll in course. Please try again.",
            variant: "destructive",
          });
        },
      },
    );
  };

  if (isEnrollmentLoading || (isCourseLoading && !enrollment)) {
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
    if (fallbackCourse) {
      return (
        <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-4">
          <Card className="max-w-xl w-full shadow-lg border-primary/20 overflow-hidden">
            {fallbackCourse.thumbnailUrl && (
              <div className="h-48 w-full overflow-hidden bg-muted relative">
                <img
                  src={fallbackCourse.thumbnailUrl}
                  alt={fallbackCourse.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                  <span className="text-xs font-semibold px-3 py-1 bg-primary text-white rounded-full">
                    {fallbackCourse.level || "Foundation"}
                  </span>
                </div>
              </div>
            )}
            <CardContent className="p-6 md:p-8 space-y-5">
              <div>
                <h2 className="text-2xl font-bold font-serif mb-2">{fallbackCourse.title}</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {fallbackCourse.description || "Start this practical workplace sustainability course to develop your skills."}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground border-y py-3">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4 text-primary" /> {fallbackCourse.lessons?.length || 4} Lessons
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Award className="h-4 w-4 text-primary" /> Certificate Included
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  size="lg"
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold"
                  onClick={handleEnrollAndStart}
                  disabled={enrollMutation.isPending}
                >
                  <PlayCircle className="mr-2 h-5 w-5" />
                  {enrollMutation.isPending ? "Enrolling..." : "Enroll & Start Course"}
                </Button>
                <Button variant="outline" asChild size="lg">
                  <Link href={`/courses/${id}`}>View Details</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
            <BookOpen className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold mb-2 font-serif">Course Ready to Start</h2>
          <p className="text-sm text-muted-foreground mb-5">
            You can browse the course catalog to enroll or return to your learning dashboard.
          </p>
          <div className="flex justify-center gap-3">
            <Button asChild><Link href="/courses">Browse Courses</Link></Button>
            <Button variant="outline" asChild><Link href="/dashboard">My Dashboard</Link></Button>
          </div>
        </div>
      </div>
    );
  }

  // Inspect lessons/contentBlocks to see if the course has structured database content blocks.
  // If so, load our generic DatabaseCoursePlayer.
  const lessonsList = enrollment.course?.lessons || [];
  const hasStructuredBlocks = lessonsList.some(
    (l) => l.contentBlocks && Array.isArray(l.contentBlocks) && l.contentBlocks.length > 0,
  );
  if (hasStructuredBlocks) {
    return <DatabaseCoursePlayer enrollmentId={enrollment.id} />;
  }

  const course = enrollment.course;
  const lessons = course.lessons || [];
  const activeLesson = lessons.find(l => l.id === activeLessonId) || lessons[0];
  const activeIndex = activeLesson ? lessons.findIndex(l => l.id === activeLesson.id) : -1;
  const isLastLesson = activeIndex === lessons.length - 1;
  const allComplete = lessons.length > 0 && lessons.every(l => completedIds.has(l.id));

  const handleMarkComplete = () => {
    if (!activeLesson) return;
    const alreadyDone = completedIds.has(activeLesson.id);

    updateProgress.mutate(
      { enrollmentId: id, data: { lessonId: activeLesson.id, completed: true } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['progress', id] });
          queryClient.invalidateQueries({ queryKey: ['enrollment', id] });
          if (!alreadyDone) toast({ title: "Lesson completed" });

          if (!isLastLesson) {
            setActiveLessonId(lessons[activeIndex + 1].id);
            window.scrollTo({ top: 0 });
          } else {
            toast({ title: "Course content finished", description: "You're ready to take the final quiz." });
          }
        },
        onError: () => {
          toast({ title: "Could not save progress", description: "Please try again.", variant: "destructive" });
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
          {allComplete ? (
            <Button size="lg" asChild className="shadow-sm">
              <Link href={`/quiz/${course.id}`}>
                <GraduationCap className="mr-2 h-5 w-5" /> Take Final Quiz
              </Link>
            </Button>
          ) : (
            <Button size="lg" disabled className="shadow-sm">
              <GraduationCap className="mr-2 h-5 w-5" /> Finish Lessons First
            </Button>
          )}
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
              const isCompleted = completedIds.has(lesson.id);

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

        {/* Reading Area */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-background relative">
          {activeLesson ? (
            <article className="max-w-3xl mx-auto w-full p-4 md:p-10 space-y-6">
              <div className="space-y-2">
                <div className="text-sm font-medium text-primary">
                  Lesson {activeIndex + 1} of {lessons.length}
                  {completedIds.has(activeLesson.id) && (
                    <span className="ml-2 inline-flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="h-4 w-4" /> Completed
                    </span>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold font-serif leading-tight">{activeLesson.title}</h1>
                <div className="text-sm text-muted-foreground">{activeLesson.durationMinutes} min read</div>
              </div>

              {activeLesson.videoUrl && (
                <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg border relative flex items-center justify-center">
                  <PlayCircle className="h-16 w-16 text-white/50" />
                </div>
              )}

              <div className="prose prose-lg max-w-none leading-relaxed text-foreground/90 whitespace-pre-line">
                {activeLesson.content || "Lesson notes for this section are being prepared. Use the assessment to test what you have learned so far."}
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

              {isLastLesson && allComplete && (
                <div className="p-6 border rounded-xl bg-primary/5 text-center space-y-3">
                  <Award className="h-10 w-10 text-primary mx-auto" />
                  <h3 className="text-xl font-semibold font-serif">You have finished all the lessons</h3>
                  <p className="text-muted-foreground text-sm">Take the final quiz to test your knowledge and earn your certificate.</p>
                  <Button size="lg" asChild>
                    <Link href={`/quiz/${course.id}`}>
                      <GraduationCap className="mr-2 h-5 w-5" /> Start Final Quiz
                    </Link>
                  </Button>
                </div>
              )}
              {isLastLesson && !allComplete && (
                <div className="p-4 border rounded-xl bg-muted/20 text-sm text-muted-foreground">
                  Complete every lesson to unlock the final quiz and certificate.
                </div>
              )}

              <div className="flex items-center justify-between pt-8 border-t">
                <Button
                  variant="ghost"
                  disabled={activeIndex <= 0}
                  onClick={() => { setActiveLessonId(lessons[activeIndex - 1].id); window.scrollTo({ top: 0 }); }}
                >
                  Previous
                </Button>
                <Button
                  size="lg"
                  onClick={handleMarkComplete}
                  disabled={updateProgress.isPending}
                >
                  {updateProgress.isPending
                    ? "Saving..."
                    : isLastLesson
                      ? "Mark Complete"
                      : "Mark Complete & Continue"}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </article>
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
