import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import {
  useListChallenges,
  customFetch,
  getListChallengesQueryKey,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import {
  Target,
  Recycle,
  Zap,
  Droplets,
  Trash2,
  Trophy,
  Award,
  CheckCircle2,
  Calendar,
  Sparkles,
  ChevronRight,
  Clock,
  BookOpen,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  FileText,
  UserCheck,
  Check,
  RefreshCw,
  Loader2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const ICONS: Record<string, LucideIcon> = {
  recycle: Recycle,
  zap: Zap,
  droplets: Droplets,
  "trash-2": Trash2,
  target: Target,
};

const THEME: Record<
  string,
  { bg: string; text: string; border: string; soft: string }
> = {
  cyan: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-700",
    border: "border-cyan-500/20",
    soft: "bg-cyan-500/5",
  },
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-700",
    border: "border-amber-500/20",
    soft: "bg-amber-500/5",
  },
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-700",
    border: "border-blue-500/20",
    soft: "bg-blue-500/5",
  },
  green: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-700",
    border: "border-emerald-500/20",
    soft: "bg-emerald-500/5",
  },
};

interface ChallengeItem {
  id: number;
  code: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  icon: string;
  theme: string;
  focus: string;
  unit: string;
  goalTarget: number;
  points: number;
  badgeName: string | null;
  startDate: string;
  endDate: string;
  category: string;
  linkedCourseId: number | null;
  durationLabel: string;
  instructions: string;
  evidencePrompt: string;
  status: "upcoming" | "active" | "ended";
  joined: boolean;
  participationStatus: "in_progress" | "submitted" | "approved" | "rejected" | null;
  evidenceText: string | null;
  reviewNote: string | null;
  progress: number;
  completed: boolean;
  pointsEarned: number;
  submittedAt: string | null;
  progressPct: number;
}

export default function Challenges() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, refetch: refetchChallenges } = useListChallenges() as any;

  // Fetch score calculation details
  const { data: scoreCard, refetch: refetchScore } = useQuery({
    queryKey: ["/api/challenges/score"],
    queryFn: () => customFetch<any>("/api/challenges/score"),
  });

  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeItem | null>(null);
  const [evidenceText, setEvidenceText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListChallengesQueryKey() });
    refetchChallenges();
    refetchScore();
  };

  const handleStartChallenge = async (challengeId: number) => {
    try {
      await customFetch(`/api/challenges/${challengeId}/join`, { method: "POST" });
      toast({
        title: "Challenge Started!",
        description: "Review instructions and begin putting your green habits to work.",
      });
      invalidate();
    } catch (err: any) {
      toast({
        title: "Error starting challenge",
        description: err.message || "Failed to join the challenge.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitReflection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallenge) return;

    if (evidenceText.trim().length < 10) {
      toast({
        title: "Reflection too short",
        description: "Please share a bit more details about your actions (minimum 10 characters).",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await customFetch(`/api/challenges/${selectedChallenge.id}/submit`, {
        method: "POST",
        body: JSON.stringify({ evidenceText: evidenceText.trim() }),
      });

      toast({
        title: "Reflection Submitted!",
        description: "Your submission has been sent to your manager for approval.",
      });

      setSelectedChallenge(null);
      setEvidenceText("");
      invalidate();
    } catch (err: any) {
      toast({
        title: "Submission failed",
        description: err.message || "An error occurred during submission.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDetailModal = (challenge: ChallengeItem) => {
    setSelectedChallenge(challenge);
    setEvidenceText(challenge.evidenceText || "");
  };

  return (
    <Layout>
      {/* Intro Header Section */}
      <div className="bg-primary/5 border-b py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-3">
            <Target className="h-4.5 w-4.5 animate-pulse" />
            Empower Sustainability Actions
          </div>
          <div className="grid lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-7">
              <h1 className="text-3xl md:text-4xl font-bold font-serif mb-3 text-foreground">
                Workplace Sustainability Challenges
              </h1>
              <p className="text-muted-foreground text-md max-w-2xl leading-relaxed">
                Put your learning into practice through short workplace challenges. Choose the actions that are relevant to you, submit a short reflection and earn points when your completion is approved.
              </p>
            </div>
            
            {/* Scorecard Display Block */}
            <div className="lg:col-span-5 w-full flex flex-col gap-3">
              {scoreCard && (
                <div className="bg-card border rounded-2xl p-5 shadow-sm backdrop-blur-md">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    My Sustainability Scorecard
                  </h3>
                  <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                    <div className="bg-muted/40 rounded-xl p-2.5">
                      <div className="text-xl font-bold text-primary">
                        {scoreCard.challengePoints}/100
                      </div>
                      <div className="text-[10px] text-muted-foreground font-medium uppercase mt-0.5">
                        Points Earned
                      </div>
                    </div>
                    <div className="bg-muted/40 rounded-xl p-2.5">
                      <div className="text-xl font-bold text-primary">
                        {scoreCard.approvedChallengeCount}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-medium uppercase mt-0.5">
                        Approved
                      </div>
                    </div>
                    <div className="bg-muted/40 rounded-xl p-2.5">
                      <div className="text-xl font-bold text-primary text-emerald-600">
                        +{scoreCard.challengeBonus}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-medium uppercase mt-0.5">
                        Bonus Points
                      </div>
                    </div>
                  </div>

                  {/* Certification pass vs fail info */}
                  <div className="pt-3 border-t">
                    {scoreCard.certificationPassed ? (
                      <div className="flex justify-between items-center bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                        <div className="text-left">
                          <div className="text-xs font-semibold text-emerald-800">
                            Final Sustainability Score
                          </div>
                          <div className="text-[10px] text-emerald-600 font-medium">
                            Course 12 Passed ({scoreCard.certificationExamScore}%)
                          </div>
                        </div>
                        <div className="text-2xl font-black text-emerald-800">
                          {scoreCard.finalSustainabilityScore}/100
                        </div>
                      </div>
                    ) : (
                      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 flex gap-2.5 items-start">
                        <AlertCircle className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-left text-xs leading-normal text-amber-700">
                          <p className="font-semibold text-amber-800 mb-0.5">Final Score Pending Course 12 Pass</p>
                          <p className="text-[10px] text-amber-600">
                            Passing Course 12 is required to unlock your Final Sustainability Score. Your potential bonus currently stands at <strong>+{scoreCard.challengeBonus}</strong>.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Challenges Cards Grid */}
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="border rounded-2xl p-6 space-y-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              ))}
          </div>
        ) : !data || data.challenges.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed rounded-2xl bg-muted/10">
            <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-40" />
            <h3 className="text-xl font-bold mb-2">No active challenges</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              No challenges have been started yet. Choose an action that is relevant to your workplace and begin when you are ready.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.challenges.map((challenge: ChallengeItem) => {
              const theme = THEME[challenge.theme] || THEME.green;
              const Icon = ICONS[challenge.icon] || Target;

              // Render button state based on participation status
              let cardButton = null;
              if (challenge.completed) {
                cardButton = (
                  <Button variant="outline" className="w-full border-emerald-500/30 bg-emerald-500/5 text-emerald-800 font-semibold" disabled>
                    <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600 shrink-0" />
                    Challenge completed
                  </Button>
                );
              } else if (challenge.participationStatus === "submitted") {
                cardButton = (
                  <Button variant="outline" className="w-full bg-blue-500/5 border-blue-500/30 text-blue-800 font-semibold" onClick={() => handleOpenDetailModal(challenge)}>
                    <Clock className="mr-2 h-4 w-4 text-blue-600 shrink-0 animate-spin" />
                    Awaiting Review
                  </Button>
                );
              } else if (challenge.participationStatus === "rejected") {
                cardButton = (
                  <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold" onClick={() => handleOpenDetailModal(challenge)}>
                    <RefreshCw className="mr-2 h-4 w-4 shrink-0" />
                    Update and Resubmit
                  </Button>
                );
              } else if (challenge.joined) {
                cardButton = (
                  <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold" onClick={() => handleOpenDetailModal(challenge)}>
                    <FileText className="mr-2 h-4 w-4 shrink-0" />
                    Continue Challenge
                  </Button>
                );
              } else {
                cardButton = (
                  <Button
                    className="w-full font-semibold"
                    disabled={challenge.status !== "active"}
                    onClick={() => handleStartChallenge(challenge.id)}
                  >
                    <Sparkles className="mr-2 h-4 w-4 shrink-0" />
                    {challenge.status === "upcoming" ? "Starts Soon" : "Start Challenge"}
                  </Button>
                );
              }

              return (
                <div key={challenge.id} className="bg-card border rounded-2xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
                  <div className={`p-6 ${theme.soft} border-b ${theme.border}`}>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className={`h-12 w-12 shrink-0 rounded-xl ${theme.bg} ${theme.text} flex items-center justify-center`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      
                      {/* Standard tags */}
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-[10px] font-bold tracking-wider uppercase bg-primary/10 text-primary px-2.5 py-0.5 rounded-full border border-primary/20">
                          {challenge.category}
                        </span>
                        {challenge.participationStatus && (
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                            challenge.participationStatus === "approved" ? "bg-emerald-500/10 text-emerald-800 border-emerald-500/20" :
                            challenge.participationStatus === "submitted" ? "bg-blue-500/10 text-blue-800 border-blue-500/20" :
                            challenge.participationStatus === "rejected" ? "bg-red-500/10 text-red-800 border-red-500/20" :
                            "bg-slate-500/10 text-slate-800 border-slate-500/20"
                          }`}>
                            {challenge.participationStatus === "in_progress" ? "In Progress" : challenge.participationStatus}
                          </span>
                        )}
                      </div>
                    </div>

                    <h2 className="font-bold font-serif text-xl mb-1 text-foreground">
                      {challenge.title}
                    </h2>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3 shrink-0" />
                      Duration: {challenge.durationLabel}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                        {challenge.summary}
                      </p>

                      <div className="flex flex-col gap-2 mb-6">
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                          <Trophy className="h-4 w-4 shrink-0 text-amber-500" />
                          10 Challenge Points available
                        </div>
                        {challenge.linkedCourseId && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 p-2 rounded-lg border border-border/60">
                            <BookOpen className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                            <span>Recommended course: Circular Economy / efficiency</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      {/* Display rejection note summary on card */}
                      {challenge.participationStatus === "rejected" && challenge.reviewNote && (
                        <div className="mb-4 bg-red-500/5 border border-red-500/20 rounded-xl p-3 text-left">
                          <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider block mb-1">Manager Feedback:</span>
                          <p className="text-xs text-red-700 leading-normal font-medium">{challenge.reviewNote}</p>
                        </div>
                      )}

                      {cardButton}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Submission & Reflection details modal */}
      <Dialog open={selectedChallenge !== null} onOpenChange={() => setSelectedChallenge(null)}>
        <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
          {selectedChallenge && (
            <form onSubmit={handleSubmitReflection}>
              <DialogHeader>
                <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-wider text-primary">
                  <Sparkles className="h-4 w-4 text-amber-500 animate-spin-slow" />
                  {selectedChallenge.category} Challenge Instructions
                </div>
                <DialogTitle className="text-2xl font-serif font-bold text-foreground mt-1">
                  {selectedChallenge.title}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-sm mt-1">
                  Review instructions below. Put your knowledge to work, then complete the evidence reflection.
                </DialogDescription>
              </DialogHeader>

              <div className="my-6 space-y-6">
                {/* Instructions Block */}
                <div className="space-y-2.5">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary shrink-0" />
                    Employee Instructions ({selectedChallenge.durationLabel})
                  </h4>
                  <div className="bg-muted/40 border border-border/80 rounded-xl p-4 text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                    {selectedChallenge.instructions}
                  </div>
                </div>

                {/* Prompt Details */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-amber-500 shrink-0" />
                    Evidence & Reflection Prompt
                  </h4>
                  <p className="text-sm text-foreground font-semibold bg-primary/5 p-3 rounded-lg border border-primary/10">
                    {selectedChallenge.evidencePrompt}
                  </p>
                </div>

                {/* Textarea Entry */}
                <div className="space-y-2">
                  <label htmlFor="reflection" className="text-sm font-bold text-foreground block">
                    Tell us what you did and what happened:
                  </label>
                  <Textarea
                    id="reflection"
                    required
                    disabled={selectedChallenge.participationStatus === "submitted" || selectedChallenge.completed}
                    placeholder="Describe the steps you took, any obstacles encountered, and results observed (minimum 10 characters)..."
                    className="min-h-[140px] text-sm"
                    value={evidenceText}
                    onChange={(e) => setEvidenceText(e.target.value)}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      Character count: <strong>{evidenceText.length}</strong> (min 10, max 1000)
                    </span>
                    <span className="flex items-center gap-1.5 text-amber-600 font-medium">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Do not include confidential data or photos.
                    </span>
                  </div>
                </div>

                {/* Rejection Review Note */}
                {selectedChallenge.participationStatus === "rejected" && selectedChallenge.reviewNote && (
                  <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 text-left">
                    <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider block mb-1">
                      Manager Rejection Reason:
                    </span>
                    <p className="text-sm text-red-700 leading-normal font-medium">
                      {selectedChallenge.reviewNote}
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setSelectedChallenge(null)}>
                  Close
                </Button>
                {selectedChallenge.participationStatus !== "submitted" && !selectedChallenge.completed && (
                  <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" />
                        Submitting reflection...
                      </>
                    ) : (
                      "Submit Reflection"
                    )}
                  </Button>
                )}
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
