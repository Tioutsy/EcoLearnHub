import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Target, CheckCircle2 } from "lucide-react";
import { useGetMyCompany } from "@workspace/api-client-react";

export const ALLOWED_TRAINING_PRIORITIES = [
  { id: "sustainability_foundations", label: "Sustainability Foundations" },
  { id: "waste_circularity", label: "Waste & Circularity" },
  { id: "energy_efficiency", label: "Energy Efficiency" },
  { id: "water_conservation", label: "Water Conservation" },
  { id: "esg_literacy", label: "ESG Literacy" },
  { id: "sustainable_procurement", label: "Sustainable Procurement" },
  { id: "environmental_awareness", label: "Environmental Awareness" },
  { id: "governance_responsible_business", label: "Governance & Responsible Business" },
  { id: "esg_data_reporting", label: "ESG Data & Reporting" },
  { id: "workplace_sustainability", label: "Workplace Sustainability Practices" },
];

interface TrainingPrioritiesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPriorities?: string[];
  onSaved?: () => void;
}

export function TrainingPrioritiesDialog({
  open,
  onOpenChange,
  currentPriorities = [],
  onSaved,
}: TrainingPrioritiesDialogProps) {
  const { toast } = useToast();
  const [selected, setSelected] = useState<string[]>(currentPriorities);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setSelected(currentPriorities);
    }
  }, [open, currentPriorities]);

  const togglePriority = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((item) => item !== id));
    } else {
      if (selected.length >= 3) {
        toast({
          title: "Maximum 3 Priorities",
          description: "You may select up to three priorities to guide recommendations.",
          variant: "destructive",
        });
        return;
      }
      setSelected([...selected, id]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/companies/priorities", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priorities: selected }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to update priorities");
      }

      toast({
        title: "Training Priorities Saved",
        description: "Updated priorities will now guide your AI learning path recommendations.",
      });

      onOpenChange(false);
      if (onSaved) onSaved();
    } catch (err: any) {
      toast({
        title: "Failed to Save",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-emerald-600 font-semibold">
            <Target className="h-5 w-5" />
            <span>Training Priorities</span>
          </div>
          <DialogTitle className="text-xl">Set Company Training Priorities</DialogTitle>
          <p className="text-xs text-muted-foreground pt-1">
            Select up to three priorities to help ELEVIO SKILLS recommend relevant learning paths for your team.
          </p>
        </DialogHeader>

        <div className="space-y-2.5 py-3 max-h-[55vh] overflow-y-auto pr-1">
          {ALLOWED_TRAINING_PRIORITIES.map((item) => {
            const isChecked = selected.includes(item.id);
            return (
              <label
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  isChecked
                    ? "border-emerald-500/50 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm"
                    : "border-border hover:bg-muted/30"
                }`}
              >
                <span className="text-sm font-medium text-foreground">{item.label}</span>
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => togglePriority(item.id)}
                />
              </label>
            );
          })}
        </div>

        <DialogFooter className="gap-2 sm:justify-between items-center">
          <span className="text-xs text-muted-foreground font-medium">
            {selected.length}/3 Selected
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {saving ? "Saving..." : <><CheckCircle2 className="mr-2 h-4 w-4" /> Save Priorities</>}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
