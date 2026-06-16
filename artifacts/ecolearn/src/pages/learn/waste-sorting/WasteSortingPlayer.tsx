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
} from "lucide-react";
import { MODULES, WASTE_SORTING_COURSE_TITLE, type Block } from "./content";
import {
  TextView,
  CalloutView,
  RevealView,
  ScenarioView,
  SortView,
  MatchingView,
  CheckView,
  RolesView,
  DecisionView,
  PledgeView,
} from "./blocks";

function isInteractive(block: Block): boolean {
  return ["scenario", "matching", "check", "roles", "decision", "sort", "reveal"].includes(block.type);
}

type Phase = "modules" | "quiz" | "complete";

export default function WasteSortingPlayer({ enrollmentId }: { enrollmentId: number }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: enrollment, isLoading } = useGetEnrollment(enrollmentId, {
    query: { enabled: !!enrollmentId, queryKey: ["enrollment", enrollmentId] },
  });
  const { data: progressRows } = useGetProgress(enrollmentId, {
    query: { enabled: !!enrollmentId, queryKey: ["progress", enrollmentId] },
  });

  const courseId = enrollment?.course?.id ?? 0;
  const { data: existingCommitments } = useGetCommitments(courseId, {
    query: { enabled: !!courseId, queryKey: ["commitments", courseId] },
  });

  const updateProgress = useUpdateProgress();
  const saveCommitments = useSaveCommitments();

  const lessons = useMemo(
    () => (enrollment?.course?.lessons ? [...enrollment.course.lessons].sort((a, b) => a.orderIndex - b.orderIndex) : []),
    [enrollment],
  );
  const completedIds = useMemo(
    () => new Set((progressRows || []).filter((p) => p.completed).map((p) => p.lessonId)),
    [progressRows],
  );

  const [phase, setPhase] = useState<Phase>("modules");
  const [moduleIndex, setModuleIndex] = useState(0);
  const [resolved, setResolved] = useState<Set<number>>(new Set());
  const [pledgeSel, setPledgeSel] = useState<Set<string>>(new Set());
  const [initialised, setInitialised] = useState(false);

  // Resume to first uncompleted module, or to the completion hub if all modules done.
  useEffect(() => {
    if (initialised || !enrollment || lessons.length === 0) return;
    const firstUncompleted = lessons.findIndex((l) => !completedIds.has(l.id));
    if (firstUncompleted === -1) {
      setPhase("complete");
      setModuleIndex(lessons.length - 1);
    } else {
      setModuleIndex(firstUncompleted);
    }
    setInitialised(true);
  }, [enrollment, lessons, completedIds, initialised]);

  // Prefill saved pledges.
  useEffect(() => {
    if (existingCommitments?.commitments?.length) {
      setPledgeSel(new Set(existingCommitments.commitments));
    }
  }, [existingCommitments]);

  // Reset per-module interaction state when the module changes.
  useEffect(() => {
    setResolved(new Set());
  }, [moduleIndex]);

  if (isLoading || !initialised) {
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

  if (!enrollment || !enrollment.course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Enrollment not found</h2>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const module = MODULES[moduleIndex];
  const hasPledge = module.blocks.some((b) => b.type === "pledge");
  const interactiveCount = module.blocks.filter(isInteractive).length;
  const gatePassed = resolved.size >= interactiveCount && (!hasPledge || pledgeSel.size > 0);
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
    queryClient.invalidateQueries({ queryKey: ["progress", enrollmentId] });
    queryClient.invalidateQueries({ queryKey: ["enrollment", enrollmentId] });
  }

  function advanceFromModule() {
    const lesson = lessons[moduleIndex];
    const isLast = moduleIndex === MODULES.length - 1;

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
        { enrollmentId, data: { lessonId: lesson.id, completed: true } },
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
    if (hasPledge) {
      saveCommitments.mutate(
        { courseId, data: { commitments: Array.from(pledgeSel) } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["commitments", courseId] });
            toast({ title: "Pledge saved", description: "Well done for committing to better waste habits." });
            advanceFromModule();
          },
          onError: () => toast({ title: "Could not save your pledge", variant: "destructive" }),
        },
      );
    } else {
      advanceFromModule();
    }
  }

  function renderBlock(block: Block, i: number) {
    switch (block.type) {
      case "text":
        return <TextView key={i} block={block} />;
      case "callout":
        return <CalloutView key={i} block={block} />;
      case "reveal":
        return <RevealView key={i} block={block} onResolved={() => markResolved(i)} />;
      case "scenario":
        return <ScenarioView key={i} block={block} onResolved={() => markResolved(i)} />;
      case "sort":
        return <SortView key={i} block={block} onResolved={() => markResolved(i)} />;
      case "matching":
        return <MatchingView key={i} block={block} onResolved={() => markResolved(i)} />;
      case "check":
        return <CheckView key={i} block={block} onResolved={() => markResolved(i)} />;
      case "roles":
        return <RolesView key={i} block={block} onResolved={() => markResolved(i)} />;
      case "decision":
        return <DecisionView key={i} block={block} onResolved={() => markResolved(i)} />;
      case "pledge":
        return (
          <PledgeView
            key={i}
            block={block}
            selected={pledgeSel}
            onToggle={(value) =>
              setPledgeSel((prev) => {
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
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="font-serif font-semibold text-base sm:text-lg truncate">{WASTE_SORTING_COURSE_TITLE}</div>
        </div>
        <div className="text-sm font-medium text-muted-foreground shrink-0">{overallPct}% complete</div>
      </header>

      <div className="border-b bg-card">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <Progress value={phase === "modules" ? overallPct : 100} className="h-1.5" />
          {phase === "modules" ? (
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {MODULES.map((m, i) => (
                <span
                  key={m.key}
                  className={
                    i === moduleIndex
                      ? "font-semibold text-primary"
                      : completedIds.has(lessons[i]?.id)
                        ? "text-emerald-600"
                        : ""
                  }
                >
                  {i + 1}. {m.title}
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
              {module.image ? (
                <div className="aspect-[16/9] overflow-hidden rounded-xl border bg-muted">
                  <img src={module.image} alt={module.title} className="h-full w-full object-cover" />
                </div>
              ) : null}
              <div className="space-y-1">
                <p className="text-sm font-medium text-primary">
                  Module {moduleIndex + 1} of {MODULES.length}
                </p>
                <h1 className="text-3xl font-bold font-serif leading-tight">{module.title}</h1>
                <p className="text-muted-foreground">{module.subtitle}</p>
              </div>

              <div className="space-y-5" key={module.key}>
                {module.blocks.map((b, i) => renderBlock(b, i))}
              </div>

              {!gatePassed ? (
                <p className="text-sm text-muted-foreground">
                  {hasPledge
                    ? "Complete the activities and choose at least one pledge to finish the course."
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
                    : moduleIndex === MODULES.length - 1
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
              onPassed={() => {
                invalidateProgress();
                queryClient.invalidateQueries({ queryKey: ["courseSummary", courseId] });
                setPhase("complete");
                window.scrollTo({ top: 0 });
              }}
              onBackToModules={() => {
                setPhase("modules");
                setModuleIndex(MODULES.length - 1);
              }}
            />
          ) : null}

          {phase === "complete" ? (
            <CompletionScreen courseId={courseId} onTakeQuiz={() => setPhase("quiz")} />
          ) : null}
        </div>
      </main>
    </div>
  );
}

function FinalQuiz({
  courseId,
  onPassed,
  onBackToModules,
}: {
  courseId: number;
  onPassed: () => void;
  onBackToModules: () => void;
}) {
  const { toast } = useToast();
  const { data: quiz, isLoading } = useGetCourseQuiz(courseId, {
    query: { enabled: !!courseId, queryKey: ["quiz", courseId] },
  });
  const submitQuiz = useSubmitQuiz();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<{ passed: boolean; score: number; correctAnswers: number; totalQuestions: number } | null>(null);

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
            <p className="text-sm text-muted-foreground mb-6">Your certificate is ready.</p>
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
              You need 80% to pass. Review the modules and try again.
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
        onSuccess: (res) => setResult(res),
        onError: () => toast({ title: "Error submitting quiz", variant: "destructive" }),
      },
    );
  }

  return (
    <div>
      <div className="mb-2">
        <p className="text-sm font-medium text-primary">Final assessment</p>
        <h1 className="text-2xl font-bold font-serif">Test what you have learned</h1>
      </div>
      <div className="mb-6 mt-4">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>
            Question {current + 1} of {quiz.questions.length}
          </span>
          <span>You need 80% to pass</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-medium leading-relaxed mb-6">{question.question}</h2>
        <div className="space-y-3 mb-8">
          {question.options.map((option, index) => {
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

function CompletionScreen({ courseId, onTakeQuiz }: { courseId: number; onTakeQuiz: () => void }) {
  const { data: summary, isLoading } = useGetCourseProgressSummary(courseId, {
    query: { enabled: !!courseId, queryKey: ["courseSummary", courseId] },
  });

  if (isLoading || !summary) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <Sparkles className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-bold font-serif">Well done</h1>
        <p className="text-muted-foreground">
          You have completed the Waste Sorting course. Here is your progress.
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
          <p className="text-2xl font-bold text-foreground">{summary.points.totalPoints}</p>
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
              You earned this for completing the course and making your waste sorting pledge.
            </p>
          </div>
        </Card>
      ) : null}

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Award className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Your certificate</h3>
        </div>
        {summary.quizPassed && summary.certificateId ? (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild>
              <a href={`/api/certificates/${summary.certificateId}/pdf`} target="_blank" rel="noopener noreferrer">
                <Download className="mr-2 h-4 w-4" /> Download certificate
              </a>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/certificates">View all certificates</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Pass the final assessment with 80% or more to unlock your certificate.
            </p>
            <Button onClick={onTakeQuiz}>
              <GraduationCap className="mr-2 h-4 w-4" /> Take the final quiz
            </Button>
          </div>
        )}
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold mb-2">Keep the momentum going</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Put your pledge into practice every day and keep building your knowledge with more courses.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" asChild>
            <Link href="/courses">Browse more courses</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
