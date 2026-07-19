import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetEnrollment,
  useGetProgress,
  useUpdateProgress,
  useGetCommitments,
  useSaveCommitments,
  useGetCourseProgressSummary,
  useGetCourseQuiz,
  useSubmitQuiz,
  useGetCourse,
  usePlatformAdminListQuizQuestions,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  Trophy,
  Download,
  GraduationCap,
  AlertCircle,
} from "lucide-react";
import {
  TextView,
  CalloutView,
  ScenarioView,
  CheckView,
  CommitmentView,
} from "./blocks";

function isDatabaseInteractive(block: any): boolean {
  return ["multiple_choice", "decision_scenario", "commitment"].includes(block.type);
}

type Phase = "modules" | "quiz" | "complete";

export default function DatabaseCoursePlayer({
  enrollmentId,
  isPreview = false,
  previewCourseId,
}: {
  enrollmentId?: number;
  isPreview?: boolean;
  previewCourseId?: number;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // 1. Queries and Mutations (Conditional on preview mode)
  const { data: rawEnrollment, isLoading: isEnrollmentLoading } = useGetEnrollment(enrollmentId || 0, {
    query: { enabled: !!enrollmentId && !isPreview, queryKey: ["enrollment", enrollmentId] },
  });

  const { data: rawProgressRows } = useGetProgress(enrollmentId || 0, {
    query: { enabled: !!enrollmentId && !isPreview, queryKey: ["progress", enrollmentId] },
  });

  const { data: previewCourse, isLoading: isPreviewCourseLoading } = useGetCourse(previewCourseId || 0, {
    query: { enabled: isPreview && !!previewCourseId, queryKey: ["course", previewCourseId] },
  });

  const courseId = isPreview ? (previewCourseId ?? 0) : (rawEnrollment?.course?.id ?? 0);

  const { data: rawExistingCommitments } = useGetCommitments(courseId, {
    query: { enabled: !!courseId && !isPreview, queryKey: ["commitments", courseId] },
  });

  const rawUpdateProgress = useUpdateProgress();
  const rawSaveCommitments = useSaveCommitments();

  // Mock States for Admin Preview
  const [mockCompletedIds, setMockCompletedIds] = useState<Set<number>>(new Set());
  const [mockCommitments, setMockCommitments] = useState<string[]>([]);

  // 2. Computed States
  const enrollment = useMemo(() => {
    if (isPreview) {
      return {
        course: previewCourse ? {
          ...previewCourse,
        } : null,
        progressPct: 0,
        status: "active",
      };
    }
    return rawEnrollment;
  }, [isPreview, previewCourse, rawEnrollment]);

  const lessons = useMemo(
    () => (enrollment?.course?.lessons ? [...enrollment.course.lessons].sort((a, b) => a.orderIndex - b.orderIndex) : []),
    [enrollment],
  );

  const completedIds = useMemo(
    () => isPreview ? mockCompletedIds : new Set((rawProgressRows || []).filter((p) => p.completed).map((p) => p.lessonId)),
    [isPreview, mockCompletedIds, rawProgressRows],
  );

  const existingCommitments = useMemo(() => {
    if (isPreview) {
      return { commitments: mockCommitments };
    }
    return rawExistingCommitments;
  }, [isPreview, mockCommitments, rawExistingCommitments]);

  // Mock mutations
  const updateProgress = useMemo(() => {
    if (isPreview) {
      return {
        isPending: false,
        mutate: (args: any, callbacks: any) => {
          setMockCompletedIds(prev => {
            const next = new Set(prev);
            next.add(args.data.lessonId);
            return next;
          });
          callbacks?.onSuccess?.();
        }
      };
    }
    return rawUpdateProgress;
  }, [isPreview, rawUpdateProgress]);

  const saveCommitments = useMemo(() => {
    if (isPreview) {
      return {
        isPending: false,
        mutate: (args: any, callbacks: any) => {
          setMockCommitments(args.data.commitments);
          callbacks?.onSuccess?.();
        }
      };
    }
    return rawSaveCommitments;
  }, [isPreview, rawSaveCommitments]);

  const [phase, setPhase] = useState<Phase>("modules");
  const [moduleIndex, setModuleIndex] = useState(0);
  const [resolved, setResolved] = useState<Set<number>>(new Set());
  const [commitmentSel, setCommitmentSel] = useState<Set<string>>(new Set());
  const [initialised, setInitialised] = useState(false);

  // Resume to first uncompleted module, or to the completion hub if all modules done.
  useEffect(() => {
    if (initialised || (!isPreview && !enrollment) || (isPreview && !previewCourse) || lessons.length === 0) return;
    const firstUncompleted = lessons.findIndex((l) => !completedIds.has(l.id));
    if (firstUncompleted === -1) {
      setPhase("complete");
      setModuleIndex(lessons.length - 1);
    } else {
      setModuleIndex(firstUncompleted);
    }
    setInitialised(true);
  }, [enrollment, previewCourse, lessons, completedIds, initialised, isPreview]);

  // Prefill saved commitments.
  useEffect(() => {
    if (existingCommitments?.commitments?.length) {
      setCommitmentSel(new Set(existingCommitments.commitments));
    }
  }, [existingCommitments]);

  // Reset per-module interaction state when the module changes.
  useEffect(() => {
    setResolved(new Set());
  }, [moduleIndex]);

  const isLoading = isPreview ? isPreviewCourseLoading : (isEnrollmentLoading || !initialised);

  if (isLoading || (isPreview && !previewCourse) || (!isPreview && !enrollment)) {
    return (
      <div className="min-h-screen bg-background">
        <header className="h-16 border-b flex items-center px-4">
          <Skeleton className="h-6 w-40" />
        </header>
        <div className="max-w-3xl mx-auto p-6 space-y-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  const module = lessons[moduleIndex];
  const blocks = module?.contentBlocks || [];
  const isCommitmentLesson = blocks.some((b: any) => b.type === "commitment");
  const interactiveCount = blocks.filter(isDatabaseInteractive).length;
  const gatePassed = isCommitmentLesson ? commitmentSel.size > 0 : resolved.size >= interactiveCount;
  const overallPct = Math.round((completedIds.size / Math.max(lessons.length, 1)) * 100);

  function markResolved(blockIndex: number) {
    setResolved((prev) => {
      if (prev.has(blockIndex)) return prev;
      const next = new Set(prev);
      next.add(blockIndex);
      return next;
    });
  }

  function invalidateProgress() {
    if (!isPreview && enrollmentId) {
      queryClient.invalidateQueries({ queryKey: ["progress", enrollmentId] });
      queryClient.invalidateQueries({ queryKey: ["enrollment", enrollmentId] });
    }
  }

  function advanceFromModule() {
    const lesson = lessons[moduleIndex];
    const isLast = moduleIndex === lessons.length - 1;

    const proceed = () => {
      invalidateProgress();
      if (isLast) {
        setPhase("quiz");
      } else {
        setModuleIndex((i) => i + 1);
      }
      window.scrollTo({ top: 0 });
    };

    if (lesson && !completedIds.has(lesson.id)) {
      updateProgress.mutate(
        { enrollmentId: enrollmentId || 0, data: { lessonId: lesson.id, completed: true } },
        {
          onSuccess: proceed,
          onError: () => toast({ title: "Could not save progress", variant: "destructive" }),
        },
      );
    } else {
      proceed();
    }
  }

  function handleModuleContinue() {
    if (isCommitmentLesson) {
      saveCommitments.mutate(
        { courseId, data: { commitments: Array.from(commitmentSel) } },
        {
          onSuccess: () => {
            if (!isPreview) {
              queryClient.invalidateQueries({ queryKey: ["commitments", courseId] });
            }
            toast({ title: "Commitments saved", description: "Well done for taking the first step." });
            advanceFromModule();
          },
          onError: () => toast({ title: "Could not save commitments", variant: "destructive" }),
        },
      );
    } else {
      advanceFromModule();
    }
  }

  function renderDatabaseBlock(block: any, i: number) {
    switch (block.type) {
      case "heading":
        return <TextView key={i} block={{ type: "text", heading: block.headingText, body: "" }} />;
      case "short_text":
        return <TextView key={i} block={{ type: "text", body: block.bodyText }} />;
      case "key_message":
      case "workplace_example":
      case "mauritian_example":
      case "practical_action":
        return <CalloutView key={i} block={{ type: "callout", title: block.headingText || "Key Concept", body: block.bodyText }} />;
      case "multiple_choice":
        return (
          <CheckView
            key={i}
            block={{
              type: "check",
              question: block.mcqQuestion || "Knowledge Check",
              options: block.mcqOptions || [],
              correctIndex: block.mcqCorrectIndex ?? 0,
              explanation: block.mcqCorrectExplanation || ""
            }}
            onResolved={() => markResolved(i)}
          />
        );
      case "decision_scenario":
        return (
          <ScenarioView
            key={i}
            block={{
              type: "scenario",
              prompt: block.decisionIntro ? `${block.decisionIntro}\n\n${block.decisionPrompt}` : block.decisionPrompt || "",
              choices: (block.decisionChoices || []).map((c: any) => ({
                label: c.label,
                feedback: c.feedback,
                ideal: c.correct
              }))
            }}
            onResolved={() => markResolved(i)}
          />
        );
      case "commitment":
        return (
          <CommitmentView
            key={i}
            block={{
              type: "commitment",
              instruction: block.commitmentInstruction || "Select commitments:",
              options: block.commitmentOptions || []
            }}
            selected={commitmentSel}
            onToggle={(value) =>
              setCommitmentSel((prev) => {
                const next = new Set(prev);
                if (next.has(value)) next.delete(value);
                else next.add(value);
                return next;
              })
            }
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="h-16 border-b flex items-center justify-between px-4 shrink-0 bg-card sticky top-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <Link href={isPreview ? "/platform-admin/courses" : "/dashboard"} className="text-muted-foreground hover:text-foreground shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="font-serif font-semibold text-base sm:text-lg truncate">
            {enrollment?.course?.title || "Course Player"}
          </div>
        </div>
        <div className="text-sm font-medium text-muted-foreground shrink-0">{overallPct}% complete</div>
      </header>

      <div className="border-b bg-card">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <Progress value={phase === "modules" ? overallPct : 100} className="h-1.5" />
          {phase === "modules" ? (
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {lessons.map((l, i) => (
                <span
                  key={l.id}
                  className={
                    i === moduleIndex
                      ? "font-semibold text-primary"
                      : completedIds.has(lessons[i]?.id)
                        ? "text-emerald-600"
                        : ""
                  }
                >
                  {i + 1}. {l.title}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <main className="flex-1 w-full">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {phase === "modules" ? (
            <div className="space-y-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-primary">
                  Module {moduleIndex + 1} of {lessons.length}
                </p>
                <h1 className="text-3xl font-bold font-serif leading-tight">{module?.title}</h1>
              </div>

              <div className="space-y-5" key={module?.id}>
                {blocks.map((b: any, i: number) => renderDatabaseBlock(b, i))}
              </div>

              {!gatePassed ? (
                <p className="text-sm text-muted-foreground">
                  {isCommitmentLesson
                    ? "Choose at least one commitment to finish the course."
                    : "Complete the activities above to continue."}
                </p>
              ) : null}

              <div className="flex items-center justify-between border-t pt-6">
                <Button
                  variant="ghost"
                  disabled={moduleIndex === 0}
                  onClick={() => {
                    setModuleIndex((i) => Math.max(0, i - 1));
                    window.scrollTo({ top: 0 });
                  }}
                >
                  Previous
                </Button>
                <Button
                  size="lg"
                  disabled={!gatePassed || updateProgress.isPending || saveCommitments.isPending}
                  onClick={handleModuleContinue}
                >
                  {updateProgress.isPending || saveCommitments.isPending
                    ? "Saving..."
                    : moduleIndex === lessons.length - 1
                      ? "Finish and take the quiz"
                      : "Mark complete and continue"}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : null}

          {phase === "quiz" ? (
            <FinalQuiz
              courseId={courseId}
              isPreview={isPreview}
              onPassed={() => {
                invalidateProgress();
                if (!isPreview) {
                  queryClient.invalidateQueries({ queryKey: ["courseSummary", courseId] });
                }
                setPhase("complete");
                window.scrollTo({ top: 0 });
              }}
              onBackToModules={() => {
                setPhase("modules");
                setModuleIndex(lessons.length - 1);
              }}
            />
          ) : null}

          {phase === "complete" ? (
            <CompletionScreen
              courseId={courseId}
              isPreview={isPreview}
              mockCompletedIds={mockCompletedIds}
              mockCommitments={mockCommitments}
              lessons={lessons}
              enrollment={enrollment}
              onTakeQuiz={() => setPhase("quiz")}
            />
          ) : null}
        </div>
      </main>
    </div>
  );
}

function FinalQuiz({
  courseId,
  isPreview,
  onPassed,
  onBackToModules,
}: {
  courseId: number;
  isPreview: boolean;
  onPassed: () => void;
  onBackToModules: () => void;
}) {
  const { toast } = useToast();
  const { data: rawQuiz, isLoading: isRawQuizLoading } = useGetCourseQuiz(courseId, {
    query: { enabled: !isPreview && !!courseId, queryKey: ["quiz", courseId] },
  });
  const { data: adminQuiz, isLoading: isAdminQuizLoading } = usePlatformAdminListQuizQuestions(courseId, {
    query: { enabled: isPreview && !!courseId, queryKey: ["adminQuiz", courseId] },
  });
  const { data: course } = useGetCourse(courseId, {
    query: { enabled: isPreview && !!courseId, queryKey: ["course", courseId] },
  });
  const rawSubmitQuiz = useSubmitQuiz();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<{ passed: boolean; score: number; correctAnswers: number; totalQuestions: number } | null>(null);

  const passingScore = course?.passingScore ?? 80;

  const quiz = useMemo(() => {
    if (isPreview) {
      return {
        courseId,
        questions: adminQuiz || [],
      };
    }
    return rawQuiz;
  }, [isPreview, courseId, rawQuiz, adminQuiz]);

  const isLoading = isPreview ? isAdminQuizLoading : isRawQuizLoading;

  const submitQuiz = useMemo(() => {
    if (isPreview) {
      return {
        isPending: false,
        mutate: (args: any, callbacks: any) => {
          let correctAnswers = 0;
          const questions = (quiz?.questions || []) as any[];
          for (const answer of args.data.answers) {
            const question = questions.find((q: any) => q.id === answer.questionId);
            if (question && question.correctOption === answer.selectedOption) {
              correctAnswers++;
            }
          }
          const totalQuestions = questions.length;
          const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
          const passed = score >= passingScore;
          callbacks?.onSuccess?.({
            passed,
            score,
            correctAnswers,
            totalQuestions,
            certificateId: null
          });
        }
      };
    }
    return rawSubmitQuiz;
  }, [isPreview, quiz, passingScore, rawSubmitQuiz]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground mb-4">The quiz is not available right now.</p>
        <Button variant="outline" onClick={onBackToModules}>
          Back to modules
        </Button>
      </Card>
    );
  }

  if (result) {
    if (result.competencyScores) {
      const passed = result.passed;
      return (
        <Card className="p-8 text-center max-w-2xl mx-auto">
          {passed ? (
            <>
              <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="text-3xl font-bold font-serif mb-2">Certification Passed!</h2>
              <p className="text-muted-foreground mb-6">
                Overall Score: {result.score}% ({result.correctAnswers}/{result.totalQuestions})
              </p>
            </>
          ) : (
            <>
              <div className="h-20 w-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-5">
                <XCircle className="h-10 w-10" />
              </div>
              <h2 className="text-3xl font-bold font-serif mb-2">Certification Failed</h2>
              <p className="text-muted-foreground mb-6">
                Overall Score: {result.score}% (Requires {passingScore}%)
              </p>
            </>
          )}

          <div className="text-left space-y-4 mb-8">
            <h3 className="font-semibold text-lg border-b pb-2">Competency Breakdown (Requires 70% each)</h3>
            {Object.entries(result.competencyScores).map(([area, score]: [string, any]) => (
              <div key={area} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="font-medium capitalize">{area.replace(/_/g, ' ')}</span>
                <div className="flex items-center gap-4 mt-2 sm:mt-0">
                  <span className="text-sm text-muted-foreground">{score.correct}/{score.total}</span>
                  <span className={`font-bold ${score.passed ? 'text-emerald-600' : 'text-destructive'}`}>
                    {score.percentage}% {score.passed ? '(Pass)' : '(Fail)'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {!passed && result.recommendations && result.recommendations.length > 0 && (
            <div className="text-left space-y-4 mb-8 bg-amber-50 dark:bg-amber-950/30 p-4 rounded-xl border border-amber-200 dark:border-amber-900">
              <h3 className="font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" /> Recommended Review
              </h3>
              <p className="text-sm text-amber-800 dark:text-amber-300">Based on your incorrect answers, we recommend reviewing these courses before trying again:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-amber-800 dark:text-amber-300">
                {result.recommendations.map((courseId: number) => (
                  <li key={courseId}>
                    <Link href={`/courses/${courseId}`} className="underline hover:text-amber-900">
                      Review Course {courseId}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3 justify-center pt-4 border-t">
             {passed ? (
               <Button size="lg" onClick={onPassed}>
                 See your results
               </Button>
             ) : (
               <>
                 <Button
                   size="lg"
                   onClick={() => {
                     setResult(null);
                     setCurrent(0);
                     setAnswers({});
                   }}
                 >
                   Retry Certification
                 </Button>
                 <Button size="lg" variant="outline" onClick={onBackToModules}>
                   Back to Briefing
                 </Button>
               </>
             )}
          </div>
        </Card>
      );
    }

    return (
      <Card className="p-8 text-center">
        {result.passed ? (
          <>
            <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="text-3xl font-bold font-serif mb-2">You passed</h2>
            <p className="text-muted-foreground mb-1">
              Score: {result.score}% ({result.correctAnswers}/{result.totalQuestions})
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              {isPreview ? "Preview complete. No certificate will be generated." : "Your certificate is ready."}
            </p>
            <Button size="lg" onClick={onPassed}>
              See your results
            </Button>
          </>
        ) : (
          <>
            <div className="h-20 w-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-5">
              <XCircle className="h-10 w-10" />
            </div>
            <h2 className="text-3xl font-bold font-serif mb-2">Not quite there yet</h2>
            <p className="text-muted-foreground mb-1">
              Score: {result.score}% ({result.correctAnswers}/{result.totalQuestions})
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              You need {passingScore}% to pass. Review the modules and try again.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                size="lg"
                onClick={() => {
                  setResult(null);
                  setCurrent(0);
                  setAnswers({});
                }}
              >
                Retry quiz
              </Button>
              <Button size="lg" variant="outline" onClick={onBackToModules}>
                Review modules
              </Button>
            </div>
          </>
        )}
      </Card>
    );
  }

  const question = quiz.questions[current];
  const isLast = current === quiz.questions.length - 1;
  const answered = answers[question.id] !== undefined;
  const progress = (current / quiz.questions.length) * 100;

  function next() {
    if (!isLast) {
      setCurrent((i) => i + 1);
      return;
    }
    const formatted = Object.entries(answers).map(([questionId, selectedOption]) => ({
      questionId: parseInt(questionId, 10),
      selectedOption,
    }));
    submitQuiz.mutate(
      { courseId, data: { answers: formatted } },
      {
        onSuccess: (res: any) => setResult(res),
        onError: () => toast({ title: "Error submitting quiz", variant: "destructive" }),
      },
    );
  }

  return (
    <div>
      <div className="mb-2">
        <p className="text-sm font-medium text-primary">Final quiz</p>
        <h1 className="text-2xl font-bold font-serif">Test what you have learned</h1>
      </div>
      <div className="mb-6 mt-4">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>
            Question {current + 1} of {quiz.questions.length}
          </span>
          <span>You need {passingScore}% to pass</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-medium leading-relaxed mb-6">{question.question}</h2>
        <div className="space-y-3 mb-8">
          {question.options.map((option: string, index: number) => {
            const isSelected = answers[question.id] === index;
            return (
              <button
                key={index}
                onClick={() => setAnswers({ ...answers, [question.id]: index })}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                  isSelected
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-muted bg-background hover:border-primary/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                <div
                  className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    isSelected ? "border-primary" : "border-muted-foreground/30"
                  }`}
                >
                  {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                </div>
                <span>{option}</span>
              </button>
            );
          })}
        </div>
        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="ghost" disabled={current === 0} onClick={() => setCurrent((i) => i - 1)}>
            Previous
          </Button>
          <Button size="lg" disabled={!answered || submitQuiz.isPending} onClick={next}>
            {submitQuiz.isPending ? "Submitting..." : isLast ? "Submit quiz" : "Next question"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function CompletionScreen({
  courseId,
  isPreview,
  mockCompletedIds,
  mockCommitments,
  lessons,
  enrollment,
  onTakeQuiz,
}: {
  courseId: number;
  isPreview: boolean;
  mockCompletedIds: Set<number>;
  mockCommitments: string[];
  lessons: any[];
  enrollment: any;
  onTakeQuiz: () => void;
}) {
  const { data: rawSummary, isLoading: isSummaryLoading } = useGetCourseProgressSummary(courseId, {
    query: { enabled: !!courseId && !isPreview, queryKey: ["courseSummary", courseId] },
  });

  const { data: rawCommitments } = useGetCommitments(courseId, {
    query: { enabled: !!courseId && !isPreview, queryKey: ["commitments", courseId] },
  });

  const summary = useMemo(() => {
    if (isPreview) {
      return {
        modulesCompleted: mockCompletedIds.size,
        totalModules: lessons.length,
        points: { totalPoints: mockCompletedIds.size * 50 + 100 },
        bestScore: 100,
        quizPassed: true,
        badgeEarned: true,
        badgeName: enrollment?.course?.badgeName || "Badge",
        certificateId: null,
      };
    }
    return rawSummary;
  }, [isPreview, mockCompletedIds, lessons, rawSummary, enrollment]);

  const selectedCommitmentList = useMemo(() => {
    if (isPreview) {
      return mockCommitments;
    }
    return rawCommitments?.commitments || [];
  }, [isPreview, mockCommitments, rawCommitments]);

  const nextCourseId = enrollment?.course?.recommendedNextCourseId;
  const { data: nextCourse } = useGetCourse(nextCourseId || 0, {
    query: { enabled: !!nextCourseId, queryKey: ["course", nextCourseId] }
  });

  if (isSummaryLoading || !summary) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const completionMessage = enrollment?.course?.completionMessage ||
    `You have completed the course ${enrollment?.course?.title || ""}. You can now put your newly acquired knowledge into practice.`;

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <Sparkles className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-bold font-serif">Well done</h1>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          {completionMessage}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">
            {summary.modulesCompleted}/{summary.totalModules}
          </p>
          <p className="text-xs text-muted-foreground">Modules done</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{summary.points?.totalPoints || 0}</p>
          <p className="text-xs text-muted-foreground">Points earned</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">
            {summary.bestScore != null ? `${summary.bestScore}%` : "--"}
          </p>
          <p className="text-xs text-muted-foreground">Best quiz score</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{summary.quizPassed ? "Pass" : "Pending"}</p>
          <p className="text-xs text-muted-foreground">Final quiz</p>
        </Card>
      </div>

      {summary.badgeEarned && summary.badgeName ? (
        <Card className="p-5 flex items-center gap-4 border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40">
          <div className="h-12 w-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold text-emerald-900 dark:text-emerald-200">Badge unlocked: {summary.badgeName}</p>
            <p className="text-sm text-emerald-800 dark:text-emerald-300">
              {enrollment?.course?.badgeDescription || "You earned this for completing the course."}
            </p>
          </div>
        </Card>
      ) : null}

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Award className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Your certificate</h3>
        </div>
        {summary.quizPassed && (summary.certificateId || isPreview) ? (
          <div className="flex flex-col sm:flex-row gap-3">
            {isPreview ? (
              <Button disabled variant="outline">
                Download certificate (Preview)
              </Button>
            ) : (
              <Button asChild>
                <a href={`/api/certificates/${summary.certificateId}/pdf`} target="_blank" rel="noopener noreferrer">
                  <Download className="mr-2 h-4 w-4" /> Download certificate
                </a>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/certificates">View all certificates</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Pass the final quiz with {enrollment?.course?.passingScore ?? 80}% or more to unlock your certificate.
            </p>
            <Button onClick={onTakeQuiz}>
              <GraduationCap className="mr-2 h-4 w-4" /> Take the final quiz
            </Button>
          </div>
        )}
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold mb-2">Your Commitments</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Here are the daily workplace actions you committed to practice:
        </p>
        <div className="flex flex-wrap gap-2 mb-5">
          {selectedCommitmentList.length > 0 ? (
            selectedCommitmentList.map((cValue) => {
              // Dynamic lookup of commitment option label from lessons
              let label = cValue;
              for (const l of lessons) {
                const cBlock = (l.contentBlocks as any[])?.find((b: any) => b.type === "commitment");
                if (cBlock?.commitmentOptions) {
                  const opt = cBlock.commitmentOptions.find((o: any) => o.value === cValue);
                  if (opt) {
                    label = opt.label;
                    break;
                  }
                }
              }
              return (
                <span
                  key={cValue}
                  className="rounded-full bg-emerald-100 text-emerald-850 dark:bg-emerald-950/40 dark:text-emerald-200 px-3 py-1.5 text-xs font-semibold"
                >
                  {label}
                </span>
              );
            })
          ) : (
            <span className="text-xs text-muted-foreground italic">No commitments registered yet.</span>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          {nextCourseId && nextCourse && nextCourse.isPublished ? (
            <Button asChild>
              <Link href={`/courses/${nextCourse.id}`}>
                Next course: {nextCourse.title}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : null}
          <Button variant="outline" asChild>
            <Link href={isPreview ? "/platform-admin/courses" : "/dashboard"}>
              Back to dashboard
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
