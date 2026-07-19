import { Layout } from "@/components/layout/Layout";
import { useGetCourseQuiz, useSubmitQuiz, useGetCourse, useListEnrollments } from "@workspace/api-client-react";
import { useParams, Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, ArrowLeft, Award, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Quiz() {
  const { courseId } = useParams();
  const id = parseInt(courseId || "0", 10);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: course } = useGetCourse(id, { query: { enabled: !!id, queryKey: ['course', id] } });
  const { data: quiz, isLoading } = useGetCourseQuiz(id, { query: { enabled: !!id, queryKey: ['quiz', id] } });
  const { data: enrollments } = useListEnrollments();
  const submitQuiz = useSubmitQuiz();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<any>(null);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <Skeleton className="h-8 w-1/3 mb-8" />
          <Skeleton className="h-4 w-full mb-12" />
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h2 className="text-2xl font-bold mb-4">Quiz not available</h2>
          <p className="text-muted-foreground mb-8">This course doesn't have a quiz yet.</p>
          <Button asChild><Link href="/dashboard">Back to Dashboard</Link></Button>
        </div>
      </Layout>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / quiz.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const enrollment = enrollments?.find((item) => item.courseId === id);

  const handleSelectOption = (optionIndex: number) => {
    setAnswers({ ...answers, [currentQuestion.id]: optionIndex });
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Submit
      const formattedAnswers = Object.entries(answers).map(([questionId, selectedOption]) => ({
        questionId: parseInt(questionId, 10),
        selectedOption
      }));

      submitQuiz.mutate(
        { courseId: id, data: { answers: formattedAnswers } },
        {
          onSuccess: (res) => {
            setResult(res);
          },
          onError: () => {
            toast({ title: "Error submitting quiz", variant: "destructive" });
          }
        }
      );
    } else {
      setCurrentQuestionIndex(i => i + 1);
    }
  };

  if (result) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 max-w-2xl text-center">
          {result.passed ? (
            <div className="mb-8">
              <div className="h-24 w-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <h2 className="text-4xl font-bold font-serif mb-4">Congratulations!</h2>
              <p className="text-xl text-muted-foreground mb-2">You passed the course quiz.</p>
              <p className="text-lg font-medium">Score: {result.score}% ({result.correctAnswers}/{result.totalQuestions})</p>
            </div>
          ) : (
            <div className="mb-8">
              <div className="h-24 w-24 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="h-12 w-12" />
              </div>
              <h2 className="text-4xl font-bold font-serif mb-4">Not quite there yet.</h2>
              <p className="text-xl text-muted-foreground mb-2">You didn't pass the quiz this time.</p>
              <p className="text-lg font-medium">Score: {result.score}% ({result.correctAnswers}/{result.totalQuestions})</p>
              <p className="text-sm text-muted-foreground mt-4">You need {course?.passingScore ?? 70}% to pass. Please review the material and try again.</p>
            </div>
          )}

          <div className="flex gap-4 justify-center mt-12">
            {result.passed && result.certificateId && (
              <Button asChild size="lg">
                <Link href="/certificates"><Award className="mr-2 h-5 w-5" /> View Certificate</Link>
              </Button>
            )}
            {result.passed && result.certificateId && (
              <Button asChild size="lg" variant="outline">
                <a href={`/api/certificates/${result.certificateId}/pdf`} target="_blank" rel="noopener noreferrer">
                  <Download className="mr-2 h-5 w-5" /> Download PDF
                </a>
              </Button>
            )}
            {!result.passed && (
              <Button size="lg" onClick={() => {
                setResult(null);
                setCurrentQuestionIndex(0);
                setAnswers({});
              }}>
                Retry Quiz
              </Button>
            )}
            <Button variant={result.passed ? "outline" : "secondary"} size="lg" asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>

          {result.feedback && result.feedback.length > 0 && (
            <div className="mt-16 text-left border-t pt-12">
              <h3 className="text-2xl font-bold font-serif mb-8 text-center">Review Your Answers</h3>
              <div className="space-y-8">
                {result.feedback.map((item: any, i: number) => (
                  <div key={item.questionId} className={`p-6 rounded-2xl border-2 ${item.isCorrect ? "border-green-200 bg-green-50/50" : "border-red-200 bg-red-50/50"}`}>
                    <h4 className="text-lg font-medium mb-4">
                      <span className="text-muted-foreground mr-2">{i + 1}.</span>
                      {item.question}
                    </h4>
                    <div className="space-y-3 mb-6">
                      {item.options.map((opt: string, optIdx: number) => {
                        const isSelected = item.selectedOption === optIdx;
                        const isCorrectOpt = item.correctOption === optIdx;
                        let badge = null;
                        if (isSelected && isCorrectOpt) badge = <span className="ml-auto text-xs font-bold uppercase tracking-wider text-green-600 bg-green-100 px-2 py-1 rounded">Your Answer (Correct)</span>;
                        else if (isSelected && !isCorrectOpt) badge = <span className="ml-auto text-xs font-bold uppercase tracking-wider text-red-600 bg-red-100 px-2 py-1 rounded">Your Answer (Incorrect)</span>;
                        else if (!isSelected && isCorrectOpt) badge = <span className="ml-auto text-xs font-bold uppercase tracking-wider text-green-600 bg-green-100 px-2 py-1 rounded">Correct Answer</span>;

                        return (
                          <div key={optIdx} className={`p-3 rounded-xl border flex items-center gap-3 ${isSelected ? (isCorrectOpt ? "border-green-400 bg-green-50" : "border-red-400 bg-red-50") : (isCorrectOpt ? "border-green-400 bg-green-50" : "bg-card")}`}>
                            <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? (isCorrectOpt ? "border-green-500" : "border-red-500") : "border-muted-foreground/30"}`}>
                              {isSelected && <div className={`h-2.5 w-2.5 rounded-full ${isCorrectOpt ? "bg-green-500" : "bg-red-500"}`} />}
                            </div>
                            <div>
                              <span className={isCorrectOpt ? "font-medium" : ""}>{opt}</span>
                              {item.optionFeedback && item.optionFeedback[optIdx] && (
                                <p className="text-xs text-muted-foreground mt-1">{item.optionFeedback[optIdx]}</p>
                              )}
                            </div>
                            {badge}
                          </div>
                        );
                      })}
                    </div>
                    {(item.correctExplanation || item.incorrectExplanation) && (
                      <div className="bg-card/60 p-4 rounded-xl border text-sm text-muted-foreground">
                        <strong className="block text-foreground mb-1">Explanation:</strong>
                        {item.isCorrect ? (item.correctExplanation || item.incorrectExplanation) : (item.incorrectExplanation || item.correctExplanation)}
                        {item.practicalTakeaway && (
                          <>
                            <strong className="block text-foreground mt-3 mb-1">Practical Takeaway:</strong>
                            {item.practicalTakeaway}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Layout>
    );
  }

  const hasAnsweredCurrent = answers[currentQuestion.id] !== undefined;

  return (
    <Layout>
      <div className="bg-primary/5 border-b py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link href={enrollment ? `/learn/${enrollment.id}` : "/dashboard"} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to course
          </Link>
          <h1 className="text-3xl font-bold font-serif mb-2">Final Quiz</h1>
          <p className="text-muted-foreground">{course?.title}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-12">
          <div className="flex justify-between text-sm font-medium text-muted-foreground mb-2">
            <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
            <span>{Math.round(progress)}% Completed</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="bg-card border rounded-2xl p-6 md:p-10 shadow-sm">
          <h2 className="text-2xl font-medium leading-relaxed mb-8">
            {currentQuestion.question}
          </h2>

          <div className="space-y-3 mb-10">
            {currentQuestion.options.map((option, index) => {
              const isSelected = answers[currentQuestion.id] === index;
              return (
                <button
                  key={index}
                  onClick={() => handleSelectOption(index)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                    isSelected 
                      ? 'border-primary bg-primary/5 text-foreground' 
                      : 'border-muted bg-background hover:border-primary/30 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-primary' : 'border-muted-foreground/30'
                  }`}>
                    {isSelected && <div className="h-3 w-3 rounded-full bg-primary" />}
                  </div>
                  <span className="text-lg">{option}</span>
                </button>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-6 border-t">
            <Button 
              variant="ghost" 
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex(i => i - 1)}
            >
              Previous
            </Button>
            <Button 
              size="lg"
              disabled={!hasAnsweredCurrent || submitQuiz.isPending}
              onClick={handleNext}
            >
              {submitQuiz.isPending ? "Submitting..." : isLastQuestion ? "Submit Quiz" : "Next Question"}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
