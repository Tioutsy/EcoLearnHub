import React, { useState } from "react";
import { useCreateWorkplaceCommitment } from "../lib/lms-api";

interface WorkplaceCommitmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: number;
  courseTitle: string;
  enrollmentId?: number;
  onSaved?: () => void;
}

const CATEGORY_OPTIONS = [
  { value: "workplace-practice", label: "Workplace Practice" },
  { value: "waste", label: "Waste & Recycling" },
  { value: "energy", label: "Energy Conservation" },
  { value: "water", label: "Water Efficiency" },
  { value: "procurement", label: "Sustainable Procurement" },
  { value: "biodiversity", label: "Biodiversity & Nature" },
  { value: "governance", label: "Governance & Ethics" },
  { value: "social", label: "Community & Social Responsibility" },
  { value: "other", label: "Other Workplace Action" },
];

export const WorkplaceCommitmentModal: React.FC<WorkplaceCommitmentModalProps> = ({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  enrollmentId,
  onSaved,
}) => {
  const [category, setCategory] = useState("workplace-practice");
  const [commitmentText, setCommitmentText] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const createCommitment = useCreateWorkplaceCommitment();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = commitmentText.trim();
    if (text.length < 20 || text.length > 500) {
      setValidationError("Please describe your workplace commitment in 20 to 500 characters.");
      return;
    }

    setValidationError(null);

    try {
      await createCommitment.mutateAsync({
        courseId,
        enrollmentId,
        commitmentText: text,
        actionCategory: category,
        commitmentType: "custom",
      });
      if (onSaved) onSaved();
      onClose();
    } catch (err: any) {
      setValidationError(err.message || "Failed to save workplace commitment");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-background border border-border rounded-xl shadow-xl p-6 space-y-5 text-foreground"
        role="dialog"
        aria-labelledby="commitment-modal-title"
      >
        <div className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Optional Post-Training Action
          </span>
          <h2 id="commitment-modal-title" className="text-xl font-bold tracking-tight">
            Choose one action to apply at work
          </h2>
          <p className="text-sm text-muted-foreground">
            Training becomes more useful when it leads to one practical action. Choose something realistic that you can apply in your role for <strong>{courseTitle}</strong>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="actionCategory" className="text-sm font-medium">
              Action category
            </label>
            <select
              id="actionCategory"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-ring focus:outline-none"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="commitmentText" className="text-sm font-medium">
              My workplace commitment
            </label>
            <textarea
              id="commitmentText"
              rows={4}
              value={commitmentText}
              onChange={(e) => setCommitmentText(e.target.value)}
              placeholder="For the next two weeks, I will check that recyclable materials are placed in the correct collection container before disposal."
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none resize-none"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>20 – 500 characters</span>
              <span>{commitmentText.trim().length}/500</span>
            </div>
          </div>

          {validationError && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
              {validationError}
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium border border-input rounded-lg hover:bg-accent transition-colors"
            >
              I’ll do this later
            </button>
            <button
              type="submit"
              disabled={createCommitment.isPending}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createCommitment.isPending ? "Saving..." : "Save my commitment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
