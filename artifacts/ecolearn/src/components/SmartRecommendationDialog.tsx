import { useState, useEffect, useCallback } from "react";
import { customFetch } from "@workspace/api-client-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Sparkles, AlertCircle, CheckCircle2, RefreshCw, Layers } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAssignCompanyCourses } from "@/lib/lms-api";

export interface RecommendedCourseItem {
  courseId: number;
  courseCode: string;
  title: string;
  description: string;
  level: string;
  durationMinutes: number;
  reason: string;
  priority: "high" | "medium" | "optional";
  prerequisitesMet: boolean;
  missingPrerequisiteTitles: string[];
}

export interface RecommendationData {
  employeeId: number;
  employeeName: string;
  department: string | null;
  jobTitle: string | null;
  companySector: string | null;
  trainingPriorities: string[];
  recommendations: RecommendedCourseItem[];
  pathwayReason: string;
  confidence: "high" | "medium" | "low";
  isFallback: boolean;
}

interface SmartRecommendationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: {
    id: number;
    name: string;
    department?: string | null;
    jobTitle?: string | null;
  } | null;
  onSuccessAssignment?: () => void;
}

export function SmartRecommendationDialog({
  open,
  onOpenChange,
  employee,
  onSuccessAssignment,
}: SmartRecommendationDialogProps) {
  const { toast } = useToast();
  const assignCourses = useAssignCompanyCourses();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RecommendationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);

  const fetchRecommendations = useCallback(async () => {
    if (!employee) return;
    setLoading(true);
    setError(null);
    try {
      const result = await customFetch<RecommendationData>(`/api/company/employees/${employee.id}/recommendations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      setData(result);

      // Auto-select high priority courses by default
      const highPriority = (result.recommendations || [])
        .filter((r) => r.priority === "high" || r.priority === "medium")
        .map((r) => r.courseId);
      setSelectedCourseIds(highPriority.length > 0 ? highPriority : (result.recommendations || []).map((r) => r.courseId));
    } catch (err: any) {
      setError(err.message || "We couldn't generate recommendations right now. You can still assign courses manually from the catalogue.");
    } finally {
      setLoading(false);
    }
  }, [employee]);

  useEffect(() => {
    if (open && employee) {
      fetchRecommendations();
    } else {
      setData(null);
      setError(null);
      setSelectedCourseIds([]);
    }
  }, [open, employee?.id, fetchRecommendations]);

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
  };

  const toggleCourse = (id: number) => {
    setSelectedCourseIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (!data) return;
    setSelectedCourseIds(data.recommendations.map((r) => r.courseId));
  };

  const deselectAll = () => {
    setSelectedCourseIds([]);
  };

  const handleAssign = async () => {
    if (!employee || selectedCourseIds.length === 0) return;
    try {
      const result = await assignCourses.mutateAsync({
        courseIds: selectedCourseIds,
        employeeIds: [employee.id],
      });

      toast({
        title: "Training Assigned",
        description: `Successfully assigned ${selectedCourseIds.length} course(s) to ${employee.name}.`,
      });

      handleOpenChange(false);
      if (onSuccessAssignment) onSuccessAssignment();
    } catch (err: any) {
      toast({
        title: "Assignment Failed",
        description: err.message || "Failed to assign selected courses.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-semibold">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            <span>Recommended Learning Path</span>
          </div>
          <DialogTitle className="text-xl">
            Training Recommendations for {employee?.name}
          </DialogTitle>
          {data && (
            <p className="text-xs text-muted-foreground mt-1">
              Suggested based on employee's role ({data.department || "General"} · {data.jobTitle || "Employee"}), sector ({data.companySector || "Sustainability"}), and company priorities.
            </p>
          )}
        </DialogHeader>

        {loading ? (
          <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="h-8 w-8 text-emerald-600 animate-spin" />
            <p className="text-sm font-medium text-muted-foreground">
              Analyzing role, training history, and company priorities...
            </p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 space-y-3">
            <div className="flex items-center gap-2 font-medium text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Recommendation Service Notice</span>
            </div>
            <p className="text-xs leading-relaxed">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchRecommendations}>
              <RefreshCw className="mr-2 h-3.5 w-3.5" /> Try Again
            </Button>
          </div>
        ) : data ? (
          <div className="space-y-4 py-2">
            <div className="p-3 bg-muted/40 rounded-lg border text-xs text-muted-foreground flex items-start gap-2">
              <Layers className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground">Pathway Strategy:</span>{" "}
                {data.pathwayReason}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {data.recommendations.length} Recommended Course(s)
              </span>
              <div className="flex gap-2 text-xs">
                <button type="button" onClick={selectAll} className="text-emerald-600 hover:underline">
                  Select All
                </button>
                <span>·</span>
                <button type="button" onClick={deselectAll} className="text-muted-foreground hover:underline">
                  Deselect All
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {data.recommendations.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground border rounded-lg">
                  This employee has completed or is currently assigned to all relevant courses for their role.
                </div>
              ) : (
                data.recommendations.map((course) => {
                  const isSelected = selectedCourseIds.includes(course.courseId);
                  return (
                    <div
                      key={course.courseId}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "border-emerald-500/50 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm"
                          : "border-border hover:bg-muted/30"
                      }`}
                      onClick={() => toggleCourse(course.courseId)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleCourse(course.courseId)}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs font-mono">
                                {course.courseCode}
                              </Badge>
                              <h4 className="font-semibold text-sm text-foreground">
                                {course.title}
                              </h4>
                            </div>
                            <Badge
                              variant={course.priority === "high" ? "default" : "secondary"}
                              className={
                                course.priority === "high"
                                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                  : ""
                              }
                            >
                              {course.priority} priority
                            </Badge>
                          </div>

                          <p className="text-xs text-muted-foreground leading-relaxed pt-0.5">
                            {course.reason}
                          </p>

                          {!course.prerequisitesMet && (
                            <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1 pt-1">
                              <AlertCircle className="h-3 w-3" />
                              Prerequisites recommended first: {course.missingPrerequisiteTitles.join(", ")}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : null}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={assignCourses.isPending || selectedCourseIds.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {assignCourses.isPending ? (
              "Assigning..."
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Assign {selectedCourseIds.length} Selected Course(s)
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
