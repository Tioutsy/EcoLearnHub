import { useRef, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TrainingActionConfirmationModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Sprint 11B: Confirmation modal for state-changing training management actions.
 * Required before dispatching reminders or assigning refresher training.
 * Prevents accidental bulk actions; all state-changing routes require explicit confirmation.
 */
export function TrainingActionConfirmationModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isPending = false,
  onConfirm,
  onCancel,
}: TrainingActionConfirmationModalProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  // Focus the confirm button when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => confirmRef.current?.focus(), 50);
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="relative z-10 bg-card border rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          onClick={onCancel}
          aria-label="Close confirmation dialog"
          id="confirm-modal-close-btn"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icon + Title */}
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h2
              id="confirm-modal-title"
              className="font-bold text-base leading-tight"
            >
              {title}
            </h2>
          </div>
        </div>

        {/* Message */}
        <p className="text-sm text-muted-foreground leading-relaxed pl-13">{message}</p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
            id="confirm-modal-cancel-btn"
          >
            {cancelLabel}
          </Button>
          <Button
            ref={confirmRef}
            onClick={onConfirm}
            disabled={isPending}
            id="confirm-modal-confirm-btn"
          >
            {isPending ? "Processing…" : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
