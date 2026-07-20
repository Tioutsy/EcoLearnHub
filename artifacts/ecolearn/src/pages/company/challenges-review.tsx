import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Building,
  FileText,
  AlertCircle,
  Loader2,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface PendingSubmission {
  submissionId: number;
  challengeId: number;
  challengeTitle: string;
  challengeCode: string;
  userId: string;
  employeeName: string;
  employeeDepartment: string | null;
  evidenceText: string;
  submittedAt: string;
  status: string;
}

export default function ChallengesReview() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingQueue, isLoading, refetch } = useQuery<PendingSubmission[]>({
    queryKey: ["/api/challenges/submissions/pending"],
    queryFn: () => customFetch<PendingSubmission[]>("/api/challenges/submissions/pending"),
  });

  const [activeReview, setActiveReview] = useState<PendingSubmission | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const handleApprove = async (submissionId: number) => {
    setIsSubmitting(true);
    try {
      await customFetch(`/api/challenges/submissions/${submissionId}/review`, {
        method: "POST",
        body: JSON.stringify({ action: "approve" }),
      });

      toast({
        title: "Submission Approved!",
        description: "Employee successfully awarded 10 points and +1 score bonus.",
      });

      refetch();
      queryClient.invalidateQueries({ queryKey: ["/api/challenges/score"] });
    } catch (err: any) {
      toast({
        title: "Approval failed",
        description: err.message || "Failed to approve submission.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReview) return;

    if (!rejectNote.trim()) {
      toast({
        title: "Feedback required",
        description: "Please provide a concise note explaining what clarification is needed.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await customFetch(`/api/challenges/submissions/${activeReview.submissionId}/review`, {
        method: "POST",
        body: JSON.stringify({ action: "reject", reviewNote: rejectNote.trim() }),
      });

      toast({
        title: "Submission Returned",
        description: "Sent back to the employee for revision with feedback.",
      });

      setShowRejectModal(false);
      setActiveReview(null);
      setRejectNote("");
      refetch();
    } catch (err: any) {
      toast({
        title: "Rejection failed",
        description: err.message || "Failed to process rejection.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenRejectModal = (submission: PendingSubmission) => {
    setActiveReview(submission);
    setRejectNote("");
    setShowRejectModal(true);
  };

  return (
    <Layout>
      <div className="bg-primary/5 border-b py-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-3">
            <Trophy className="h-4.5 w-4.5" />
            Review Workplace Action Submissions
          </div>
          <h1 className="text-3xl font-bold font-serif mb-2 text-foreground">
            Challenge Submissions Queue
          </h1>
          <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
            Review reflections and action evidence submitted by employees. Approve valid submissions to award 10 Challenge Points and add +1 to their Final Sustainability Score.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {isLoading ? (
          <div className="space-y-6">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="border rounded-2xl p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <div className="flex gap-3 pt-2">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-24" />
                  </div>
                </div>
              ))}
          </div>
        ) : !pendingQueue || pendingQueue.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed rounded-2xl bg-muted/10">
            <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-40" />
            <h3 className="text-xl font-bold mb-2">Queue is empty</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              There are no challenge submissions awaiting review.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingQueue.map((sub) => (
              <div key={sub.submissionId} className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row gap-6 justify-between items-start">
                <div className="flex-1 space-y-4">
                  {/* Top user / context metadata */}
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <div className="flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      {sub.challengeCode}
                    </div>
                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                      <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      {sub.employeeName}
                    </div>
                    {sub.employeeDepartment && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Building className="h-3.5 w-3.5 shrink-0" />
                        {sub.employeeDepartment}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      Submitted {new Date(sub.submittedAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  {/* Challenge details */}
                  <h3 className="text-lg font-bold text-foreground font-serif">
                    {sub.challengeTitle}
                  </h3>

                  {/* Evidence Text Box */}
                  <div className="bg-muted/40 border border-border/80 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      <FileText className="h-3.5 w-3.5" />
                      Action Evidence & Reflection:
                    </div>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                      {sub.evidenceText}
                    </p>
                  </div>
                </div>

                {/* Review action buttons */}
                <div className="lg:self-center shrink-0 w-full lg:w-auto flex flex-row lg:flex-col gap-3 justify-end">
                  <Button
                    disabled={isSubmitting}
                    onClick={() => handleApprove(sub.submissionId)}
                    className="flex-1 lg:flex-none bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center justify-center gap-2 h-10 px-5"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    Approve
                  </Button>
                  <Button
                    disabled={isSubmitting}
                    variant="outline"
                    onClick={() => handleOpenRejectModal(sub)}
                    className="flex-1 lg:flex-none border-red-500/20 bg-red-500/5 text-red-800 hover:bg-red-500/10 font-semibold flex items-center justify-center gap-2 h-10 px-5"
                  >
                    <XCircle className="h-4 w-4 shrink-0 text-red-600" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject clarification modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="max-w-md">
          {activeReview && (
            <form onSubmit={handleRejectSubmit}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-800 font-serif">
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                  Return Submission for Revision
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-1">
                  Explain what information is missing or what the employee needs to clarify. Rejections do not permanently block completion.
                </DialogDescription>
              </DialogHeader>

              <div className="my-5 space-y-4">
                <div className="text-xs">
                  <span className="font-semibold text-foreground">Employee:</span> {activeReview.employeeName}
                  <br />
                  <span className="font-semibold text-foreground">Challenge:</span> {activeReview.challengeTitle}
                </div>
                <div className="space-y-2">
                  <label htmlFor="rejectionNote" className="text-xs font-bold text-foreground block">
                    Reviewer Note / Feedback:
                  </label>
                  <Textarea
                    id="rejectionNote"
                    required
                    placeholder="e.g. Please clarify what energy wastes you identified, or expand your reflection details..."
                    className="min-h-[100px] text-xs"
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowRejectModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 text-white font-semibold">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" />
                      Returning...
                    </>
                  ) : (
                    "Send Feedback & Reject"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
