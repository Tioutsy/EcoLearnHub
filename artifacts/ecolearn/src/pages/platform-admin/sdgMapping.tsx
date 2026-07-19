import { useState } from "react";
import { PlatformAdminLayout } from "@/components/layout/PlatformAdminLayout";
import {
  usePlatformAdminListSdgGoals,
  usePlatformAdminCreateSdgGoal,
  usePlatformAdminUpdateSdgGoal,
  usePlatformAdminUpdateSdgGoalStatus,
  usePlatformAdminListSdgTargets,
  usePlatformAdminCreateSdgTarget,
  usePlatformAdminUpdateSdgTarget,
  usePlatformAdminUpdateSdgTargetStatus,
  usePlatformAdminListSdgContributions,
  usePlatformAdminCreateSdgContribution,
  usePlatformAdminUpdateSdgContribution,
  usePlatformAdminUpdateSdgContributionStatus
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Edit, Archive, CheckCircle, Target, Award, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function PlatformAdminSdgMapping() {
  const queryClient = useQueryClient();

  // Queries
  const goalsQuery = usePlatformAdminListSdgGoals();
  const targetsQuery = usePlatformAdminListSdgTargets();
  const contributionsQuery = usePlatformAdminListSdgContributions();

  // Mutations - Goals
  const createGoalMutation = usePlatformAdminCreateSdgGoal({
    mutation: {
      onSuccess: () => {
        toast.success("SDG goal created");
        queryClient.invalidateQueries({ queryKey: ["platformAdminListSdgGoals"] });
        setGoalCreateOpen(false);
        setGoalForm({ goalNumber: 1, title: "", officialReference: "", sourceVersion: "" });
      },
      onError: (err: any) => toast.error(err.message || "Failed to create SDG goal")
    }
  });

  const updateGoalMutation = usePlatformAdminUpdateSdgGoal({
    mutation: {
      onSuccess: () => {
        toast.success("SDG goal updated");
        queryClient.invalidateQueries({ queryKey: ["platformAdminListSdgGoals"] });
        setGoalEditOpen(false);
        setGoalForm({ goalNumber: 1, title: "", officialReference: "", sourceVersion: "" });
      },
      onError: (err: any) => toast.error(err.message || "Failed to update SDG goal")
    }
  });

  const updateGoalStatusMutation = usePlatformAdminUpdateSdgGoalStatus({
    mutation: {
      onSuccess: () => {
        toast.success("Goal status updated");
        queryClient.invalidateQueries({ queryKey: ["platformAdminListSdgGoals"] });
      },
      onError: (err: any) => toast.error(err.message || "Failed to update status")
    }
  });

  // Mutations - Targets
  const createTargetMutation = usePlatformAdminCreateSdgTarget({
    mutation: {
      onSuccess: () => {
        toast.success("SDG target created");
        queryClient.invalidateQueries({ queryKey: ["platformAdminListSdgTargets"] });
        setTargetCreateOpen(false);
        setTargetForm({ sdgGoalId: "", targetCode: "", officialOrApprovedSummary: "", officialReference: "", sourceVersion: "" });
      },
      onError: (err: any) => toast.error(err.message || "Failed to create target")
    }
  });

  const updateTargetMutation = usePlatformAdminUpdateSdgTarget({
    mutation: {
      onSuccess: () => {
        toast.success("SDG target updated");
        queryClient.invalidateQueries({ queryKey: ["platformAdminListSdgTargets"] });
        setTargetEditOpen(false);
        setTargetForm({ sdgGoalId: "", targetCode: "", officialOrApprovedSummary: "", officialReference: "", sourceVersion: "" });
      },
      onError: (err: any) => toast.error(err.message || "Failed to update target")
    }
  });

  const updateTargetStatusMutation = usePlatformAdminUpdateSdgTargetStatus({
    mutation: {
      onSuccess: () => {
        toast.success("Target status updated");
        queryClient.invalidateQueries({ queryKey: ["platformAdminListSdgTargets"] });
      },
      onError: (err: any) => toast.error(err.message || "Failed to update status")
    }
  });

  // Mutations - Contributions
  const createContribMutation = usePlatformAdminCreateSdgContribution({
    mutation: {
      onSuccess: () => {
        toast.success("SDG contribution created");
        queryClient.invalidateQueries({ queryKey: ["platformAdminListSdgContributions"] });
        setContribCreateOpen(false);
        resetContribForm();
      },
      onError: (err: any) => toast.error(err.message || "Failed to create contribution")
    }
  });

  const updateContribMutation = usePlatformAdminUpdateSdgContribution({
    mutation: {
      onSuccess: () => {
        toast.success("SDG contribution updated");
        queryClient.invalidateQueries({ queryKey: ["platformAdminListSdgContributions"] });
        setContribEditOpen(false);
        resetContribForm();
      },
      onError: (err: any) => toast.error(err.message || "Failed to update contribution")
    }
  });

  const updateContribStatusMutation = usePlatformAdminUpdateSdgContributionStatus({
    mutation: {
      onSuccess: () => {
        toast.success("Contribution status updated");
        queryClient.invalidateQueries({ queryKey: ["platformAdminListSdgContributions"] });
      },
      onError: (err: any) => toast.error(err.message || "Failed to update status")
    }
  });

  // State Management
  const [activeTab, setActiveTab] = useState("goals");

  // Goals Dialog State
  const [goalCreateOpen, setGoalCreateOpen] = useState(false);
  const [goalEditOpen, setGoalEditOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);
  const [goalForm, setGoalForm] = useState({ goalNumber: 1, title: "", officialReference: "", sourceVersion: "" });

  // Targets Dialog State
  const [targetCreateOpen, setTargetCreateOpen] = useState(false);
  const [targetEditOpen, setTargetEditOpen] = useState(false);
  const [editingTargetId, setEditingTargetId] = useState<number | null>(null);
  const [targetForm, setTargetForm] = useState({ sdgGoalId: "" as number | "", targetCode: "", officialOrApprovedSummary: "", officialReference: "", sourceVersion: "" });

  // Contributions Dialog State
  const [contribCreateOpen, setContribCreateOpen] = useState(false);
  const [contribEditOpen, setContribEditOpen] = useState(false);
  const [editingContribId, setEditingContribId] = useState<number | null>(null);

  const [contribTargetId, setContribTargetId] = useState<number | "">("");
  const [contribCategory, setContribCategory] = useState<"education_awareness" | "capacity_building" | "operational_output" | "operational_outcome" | "self_reported_action" | "calculated_estimate">("education_awareness");
  const [contribRationale, setContribRationale] = useState("");
  const [contribEvidenceRequired, setContribEvidenceRequired] = useState("");
  const [contribEvidenceStrength, setContribEvidenceStrength] = useState<"weak" | "medium" | "strong">("medium");
  const [contribIsDirect, setContribIsDirect] = useState(false);
  const [contribSourceReference, setContribSourceReference] = useState("");
  const [contribMethodologyVersion, setContribMethodologyVersion] = useState("");
  const [contribLimitations, setContribLimitations] = useState("");

  const resetContribForm = () => {
    setEditingContribId(null);
    setContribTargetId("");
    setContribCategory("education_awareness");
    setContribRationale("");
    setContribEvidenceRequired("");
    setContribEvidenceStrength("medium");
    setContribIsDirect(false);
    setContribSourceReference("");
    setContribMethodologyVersion("");
    setContribLimitations("");
  };

  // Submit Handlers
  const handleGoalSubmit = (e: React.FormEvent, mode: "create" | "edit") => {
    e.preventDefault();
    if (!goalForm.title.trim()) {
      toast.error("Goal title is required");
      return;
    }

    if (mode === "create") {
      createGoalMutation.mutate({ data: goalForm });
    } else if (mode === "edit" && editingGoalId) {
      updateGoalMutation.mutate({
        id: editingGoalId,
        data: goalForm
      });
    }
  };

  const handleGoalStatusToggle = (id: number, current: boolean) => {
    const nextStatus = current ? "inactive" : "active";
    if (nextStatus === "inactive") {
      const ok = window.confirm("Are you sure you want to de-activate this SDG Goal?");
      if (!ok) return;
    }
    updateGoalStatusMutation.mutate({
      id,
      data: { status: nextStatus }
    });
  };

  const handleTargetSubmit = (e: React.FormEvent, mode: "create" | "edit") => {
    e.preventDefault();
    if (!targetForm.sdgGoalId || !targetForm.targetCode.trim() || !targetForm.officialOrApprovedSummary.trim()) {
      toast.error("Goal, target code, and summary are required");
      return;
    }

    const payload = {
      sdgGoalId: Number(targetForm.sdgGoalId),
      targetCode: targetForm.targetCode,
      officialOrApprovedSummary: targetForm.officialOrApprovedSummary,
      officialReference: targetForm.officialReference || undefined,
      sourceVersion: targetForm.sourceVersion || undefined
    };

    if (mode === "create") {
      createTargetMutation.mutate({ data: payload });
    } else if (mode === "edit" && editingTargetId) {
      updateTargetMutation.mutate({
        id: editingTargetId,
        data: payload
      });
    }
  };

  const handleTargetStatusToggle = (id: number, current: boolean) => {
    const nextStatus = current ? "inactive" : "active";
    if (nextStatus === "inactive") {
      const ok = window.confirm("Are you sure you want to de-activate this target?");
      if (!ok) return;
    }
    updateTargetStatusMutation.mutate({
      id,
      data: { status: nextStatus }
    });
  };

  const handleContribSubmit = (e: React.FormEvent, mode: "create" | "edit") => {
    e.preventDefault();
    if (!contribTargetId || !contribCategory || !contribRationale.trim()) {
      toast.error("Target, category, and rationale are required");
      return;
    }

    const payload = {
      sdgTargetId: Number(contribTargetId),
      contributionCategory: contribCategory,
      rationale: contribRationale,
      evidenceRequired: contribEvidenceRequired || null,
      evidenceStrength: contribEvidenceStrength,
      isDirect: contribIsDirect,
      sourceReference: contribSourceReference || null,
      methodologyVersion: contribMethodologyVersion || null,
      limitations: contribLimitations || null
    };

    if (mode === "create") {
      createContribMutation.mutate({ data: payload });
    } else if (mode === "edit" && editingContribId) {
      updateContribMutation.mutate({
        id: editingContribId,
        data: payload
      });
    }
  };

  const handleContribStatusToggle = (id: number, current: string) => {
    const next = current === "active" ? "inactive" : "active";
    if (next === "inactive") {
      const ok = window.confirm("Are you sure you want to archive this SDG contribution mapping?");
      if (!ok) return;
    }
    updateContribStatusMutation.mutate({
      id,
      data: { status: next === "inactive" ? "archived" : "active" }
    });
  };

  // Helper arrays
  const goals = goalsQuery.data || [];
  const targets = targetsQuery.data || [];
  const contributions = contributionsQuery.data || [];

  return (
    <PlatformAdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold font-serif">SDG Mapping Hub</h2>
            <p className="text-muted-foreground mt-1">
              Configure UN Sustainable Development Goals (SDG) references and contribution rules.
            </p>
          </div>
        </div>

        {/* SDG Compliance Caution notice */}
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex gap-3 text-rose-800 text-sm">
          <ShieldAlert className="h-5 w-5 shrink-0 text-rose-600" />
          <div>
            <span className="font-semibold">Compliance Policy Warning:</span> Mappings are strictly for internal impact modeling and sector-level educational alignment. Never display language claiming direct SDG achievement, certification, official UN endorsement, or GRI compliance.
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="goals">SDG Goals</TabsTrigger>
            <TabsTrigger value="targets">SDG Targets</TabsTrigger>
            <TabsTrigger value="contributions">Contribution Mappings</TabsTrigger>
          </TabsList>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={goalCreateOpen} onOpenChange={setGoalCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Create Goal
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={(e) => handleGoalSubmit(e, "create")} className="space-y-4">
                    <DialogHeader>
                      <DialogTitle>Add SDG Goal</DialogTitle>
                      <DialogDescription>Create a main UN Sustainable Development Goal definition.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="goal-num">Goal Number (1-17) *</Label>
                        <Input
                          id="goal-num"
                          type="number"
                          min={1}
                          max={17}
                          value={goalForm.goalNumber}
                          onChange={(e) => setGoalForm({ ...goalForm, goalNumber: Number(e.target.value) })}
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="goal-title">Goal Title *</Label>
                        <Input
                          id="goal-title"
                          value={goalForm.title}
                          onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                          placeholder="e.g. Responsible Consumption and Production"
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="goal-ref">Official Reference Summary</Label>
                        <Input
                          id="goal-ref"
                          value={goalForm.officialReference}
                          onChange={(e) => setGoalForm({ ...goalForm, officialReference: e.target.value })}
                          placeholder="UN SDG details URL..."
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="goal-ver">Source Version</Label>
                        <Input
                          id="goal-ver"
                          value={goalForm.sourceVersion}
                          onChange={(e) => setGoalForm({ ...goalForm, sourceVersion: e.target.value })}
                          placeholder="e.g. 2030 Agenda"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setGoalCreateOpen(false)}>Cancel</Button>
                      <Button type="submit">Create Goal</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {goalsQuery.isLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <div className="border rounded-lg overflow-x-auto bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Goal No.</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Source Version</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {goals.map((g: any) => (
                      <TableRow key={g.id}>
                        <TableCell className="font-bold text-center">SDG {g.goalNumber}</TableCell>
                        <TableCell className="font-medium">{g.title}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{g.sourceVersion || "None"}</TableCell>
                        <TableCell>
                          <Badge variant={g.isActive ? "default" : "secondary"}>
                            {g.isActive ? "active" : "inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingGoalId(g.id);
                                setGoalForm({ goalNumber: g.goalNumber, title: g.title, officialReference: g.officialReference || "", sourceVersion: g.sourceVersion || "" });
                                setGoalEditOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleGoalStatusToggle(g.id, g.isActive)}
                              className={g.isActive ? "text-amber-600" : "text-emerald-600"}
                            >
                              {g.isActive ? <Archive className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Targets Tab */}
          <TabsContent value="targets" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={targetCreateOpen} onOpenChange={setTargetCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Create Target
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={(e) => handleTargetSubmit(e, "create")} className="space-y-4">
                    <DialogHeader>
                      <DialogTitle>Add SDG Target</DialogTitle>
                      <DialogDescription>Define a specific SDG sub-target code.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="t-goal">Parent SDG Goal *</Label>
                        <select
                          id="t-goal"
                          value={targetForm.sdgGoalId}
                          onChange={(e) => setTargetForm({ ...targetForm, sdgGoalId: Number(e.target.value) })}
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-1"
                          required
                        >
                          <option value="">Select Goal...</option>
                          {goals.map((g: any) => <option key={g.id} value={g.id}>SDG {g.goalNumber}: {g.title}</option>)}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="t-code">Target Code (e.g. 12.5) *</Label>
                        <Input
                          id="t-code"
                          value={targetForm.targetCode}
                          onChange={(e) => setTargetForm({ ...targetForm, targetCode: e.target.value })}
                          placeholder="e.g. 12.5"
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="t-sum">Approved Target Summary *</Label>
                        <Textarea
                          id="t-sum"
                          value={targetForm.officialOrApprovedSummary}
                          onChange={(e) => setTargetForm({ ...targetForm, officialOrApprovedSummary: e.target.value })}
                          placeholder="Summarize target criteria..."
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="t-ref">Official Reference</Label>
                        <Input
                          id="t-ref"
                          value={targetForm.officialReference}
                          onChange={(e) => setTargetForm({ ...targetForm, officialReference: e.target.value })}
                          placeholder="UN link..."
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="t-ver">Source Version</Label>
                        <Input
                          id="t-ver"
                          value={targetForm.sourceVersion}
                          onChange={(e) => setTargetForm({ ...targetForm, sourceVersion: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setTargetCreateOpen(false)}>Cancel</Button>
                      <Button type="submit">Create Target</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {targetsQuery.isLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <div className="border rounded-lg overflow-x-auto bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Goal</TableHead>
                      <TableHead>Summary</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {targets.map((t: any) => {
                      const goalTitle = goals.find((g: any) => g.id === t.sdgGoalId)?.title || `SDG ${t.sdgGoalId}`;
                      return (
                        <TableRow key={t.id}>
                          <TableCell className="font-bold text-xs">{t.targetCode}</TableCell>
                          <TableCell className="text-xs max-w-xs truncate">{goalTitle}</TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-sm truncate">{t.officialOrApprovedSummary}</TableCell>
                          <TableCell>
                            <Badge variant={t.isActive ? "default" : "secondary"}>
                              {t.isActive ? "active" : "inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingTargetId(t.id);
                                  setTargetForm({
                                    sdgGoalId: t.sdgGoalId,
                                    targetCode: t.targetCode,
                                    officialOrApprovedSummary: t.officialOrApprovedSummary,
                                    officialReference: t.officialReference || "",
                                    sourceVersion: t.sourceVersion || ""
                                  });
                                  setTargetEditOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleTargetStatusToggle(t.id, t.isActive)}
                                className={t.isActive ? "text-amber-600" : "text-emerald-600"}
                              >
                                {t.isActive ? <Archive className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Contributions Tab */}
          <TabsContent value="contributions" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => { resetContribForm(); setContribCreateOpen(true); }} className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Create Contribution Mapping
              </Button>
            </div>

            {contributionsQuery.isLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <div className="border rounded-lg overflow-x-auto bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rationale</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Evidence Strength</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contributions.map((c: any) => {
                      const targetCode = targets.find((t: any) => t.id === c.sdgTargetId)?.targetCode || `Target ID ${c.sdgTargetId}`;
                      return (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium max-w-sm truncate text-xs">{c.rationale}</TableCell>
                          <TableCell className="font-bold text-xs">{targetCode}</TableCell>
                          <TableCell className="capitalize text-xs text-muted-foreground">{c.contributionCategory.replace('_', ' ')}</TableCell>
                          <TableCell className="capitalize text-xs text-muted-foreground">{c.evidenceStrength}</TableCell>
                          <TableCell>
                            <Badge variant={c.status === "active" ? "default" : "secondary"}>
                              {c.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingContribId(c.id);
                                  setContribTargetId(c.sdgTargetId);
                                  setContribCategory(c.contributionCategory as any);
                                  setContribRationale(c.rationale);
                                  setContribEvidenceRequired(c.evidenceRequired || "");
                                  setContribEvidenceStrength(c.evidenceStrength as any);
                                  setContribIsDirect(c.isDirect || false);
                                  setContribSourceReference(c.sourceReference || "");
                                  setContribMethodologyVersion(c.methodologyVersion || "");
                                  setContribLimitations(c.limitations || "");
                                  setContribEditOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleContribStatusToggle(c.id, c.status)}
                                className={c.status === "active" ? "text-amber-600" : "text-emerald-600"}
                                disabled={c.status === "archived"}
                              >
                                {c.status === "active" ? <Archive className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Goal Edit Dialog */}
        <Dialog open={goalEditOpen} onOpenChange={setGoalEditOpen}>
          <DialogContent>
            <form onSubmit={(e) => handleGoalSubmit(e, "edit")} className="space-y-4">
              <DialogHeader>
                <DialogTitle>Edit SDG Goal</DialogTitle>
                <DialogDescription>Modify titles and references.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="edit-goal-num">Goal Number (1-17) *</Label>
                  <Input
                    id="edit-goal-num"
                    type="number"
                    value={goalForm.goalNumber}
                    disabled
                    className="mt-1 bg-muted cursor-not-allowed text-muted-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-goal-title">Goal Title *</Label>
                  <Input
                    id="edit-goal-title"
                    value={goalForm.title}
                    onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-goal-ref">Official Reference</Label>
                  <Input
                    id="edit-goal-ref"
                    value={goalForm.officialReference}
                    onChange={(e) => setGoalForm({ ...goalForm, officialReference: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-goal-ver">Source Version</Label>
                  <Input
                    id="edit-goal-ver"
                    value={goalForm.sourceVersion}
                    onChange={(e) => setGoalForm({ ...goalForm, sourceVersion: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setGoalEditOpen(false)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Target Edit Dialog */}
        <Dialog open={targetEditOpen} onOpenChange={setTargetEditOpen}>
          <DialogContent>
            <form onSubmit={(e) => handleTargetSubmit(e, "edit")} className="space-y-4">
              <DialogHeader>
                <DialogTitle>Edit SDG Target</DialogTitle>
                <DialogDescription>Modify target details.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="edit-t-goal">Parent SDG Goal *</Label>
                  <select
                    id="edit-t-goal"
                    value={targetForm.sdgGoalId}
                    disabled
                    className="flex h-9 w-full rounded-md border border-input bg-muted px-3 py-1 text-sm shadow-sm transition-colors cursor-not-allowed mt-1 text-muted-foreground"
                  >
                    {goals.map((g: any) => <option key={g.id} value={g.id}>SDG {g.goalNumber}: {g.title}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="edit-t-code">Target Code *</Label>
                  <Input
                    id="edit-t-code"
                    value={targetForm.targetCode}
                    onChange={(e) => setTargetForm({ ...targetForm, targetCode: e.target.value })}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-t-sum">Approved Target Summary *</Label>
                  <Textarea
                    id="edit-t-sum"
                    value={targetForm.officialOrApprovedSummary}
                    onChange={(e) => setTargetForm({ ...targetForm, officialOrApprovedSummary: e.target.value })}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-t-ref">Official Reference</Label>
                  <Input
                    id="edit-t-ref"
                    value={targetForm.officialReference}
                    onChange={(e) => setTargetForm({ ...targetForm, officialReference: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-t-ver">Source Version</Label>
                  <Input
                    id="edit-t-ver"
                    value={targetForm.sourceVersion}
                    onChange={(e) => setTargetForm({ ...targetForm, sourceVersion: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setTargetEditOpen(false)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Contribution Create Dialog */}
        <Dialog open={contribCreateOpen} onOpenChange={setContribCreateOpen}>
          <DialogContent className="max-w-lg">
            <form onSubmit={(e) => handleContribSubmit(e, "create")} className="space-y-4">
              <DialogHeader>
                <DialogTitle>Add SDG Contribution Mapping</DialogTitle>
                <DialogDescription>Map content outcomes to official SDG indicators.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto px-1">
                <div>
                  <Label htmlFor="c-target">SDG Target *</Label>
                  <select
                    id="c-target"
                    value={contribTargetId}
                    onChange={(e) => setContribTargetId(Number(e.target.value))}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                    required
                  >
                    <option value="">Select Target...</option>
                    {targets.map((t: any) => <option key={t.id} value={t.id}>{t.targetCode}: {t.officialOrApprovedSummary.slice(0, 50)}...</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="c-cat">Contribution Category *</Label>
                  <select
                    id="c-cat"
                    value={contribCategory}
                    onChange={(e) => setContribCategory(e.target.value as any)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                    required
                  >
                    <option value="education_awareness">Education & Awareness</option>
                    <option value="capacity_building">Capacity Building</option>
                    <option value="operational_output">Operational Output</option>
                    <option value="operational_outcome">Operational Outcome</option>
                    <option value="self_reported_action">Self-Reported Action</option>
                    <option value="calculated_estimate">Calculated Estimate</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="c-rat">Rationale *</Label>
                  <Textarea
                    id="c-rat"
                    value={contribRationale}
                    onChange={(e) => setContribRationale(e.target.value)}
                    placeholder="Justify how content helps this target..."
                    className="mt-1"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="c-ev">Evidence Required</Label>
                  <Input
                    id="c-ev"
                    value={contribEvidenceRequired}
                    onChange={(e) => setContribEvidenceRequired(e.target.value)}
                    placeholder="e.g. Complete waste logging forms..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="c-str">Evidence Strength</Label>
                  <select
                    id="c-str"
                    value={contribEvidenceStrength}
                    onChange={(e) => setContribEvidenceStrength(e.target.value as any)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                  >
                    <option value="weak">Weak</option>
                    <option value="medium">Medium</option>
                    <option value="strong">Strong</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="c-dir"
                    checked={contribIsDirect}
                    onChange={(e) => setContribIsDirect(e.target.checked)}
                    className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                  />
                  <Label htmlFor="c-dir" className="font-semibold text-xs cursor-pointer">Direct Indicator</Label>
                </div>
                <div>
                  <Label htmlFor="c-ref">Source Reference</Label>
                  <Input
                    id="c-ref"
                    value={contribSourceReference}
                    onChange={(e) => setContribSourceReference(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="c-meth">Methodology Version</Label>
                  <Input
                    id="c-meth"
                    value={contribMethodologyVersion}
                    onChange={(e) => setContribMethodologyVersion(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="c-lim">Limitations</Label>
                  <Textarea
                    id="c-lim"
                    value={contribLimitations}
                    onChange={(e) => setContribLimitations(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setContribCreateOpen(false)}>Cancel</Button>
                <Button type="submit">Create Contribution</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Contribution Edit Dialog */}
        <Dialog open={contribEditOpen} onOpenChange={setContribEditOpen}>
          <DialogContent className="max-w-lg">
            <form onSubmit={(e) => handleContribSubmit(e, "edit")} className="space-y-4">
              <DialogHeader>
                <DialogTitle>Edit SDG Contribution Mapping</DialogTitle>
                <DialogDescription>Modify rationale or evidence requirements.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto px-1">
                <div>
                  <Label htmlFor="edit-c-target">SDG Target *</Label>
                  <select
                    id="edit-c-target"
                    value={contribTargetId}
                    disabled
                    className="flex h-9 w-full rounded-md border border-input bg-muted px-3 py-1 text-sm mt-1 cursor-not-allowed text-muted-foreground"
                  >
                    {targets.map((t: any) => <option key={t.id} value={t.id}>{t.targetCode}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="edit-c-cat">Contribution Category *</Label>
                  <select
                    id="edit-c-cat"
                    value={contribCategory}
                    onChange={(e) => setContribCategory(e.target.value as any)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                    required
                  >
                    <option value="education_awareness">Education & Awareness</option>
                    <option value="capacity_building">Capacity Building</option>
                    <option value="operational_output">Operational Output</option>
                    <option value="operational_outcome">Operational Outcome</option>
                    <option value="self_reported_action">Self-Reported Action</option>
                    <option value="calculated_estimate">Calculated Estimate</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="edit-c-rat">Rationale *</Label>
                  <Textarea
                    id="edit-c-rat"
                    value={contribRationale}
                    onChange={(e) => setContribRationale(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="edit-c-ev">Evidence Required</Label>
                  <Input
                    id="edit-c-ev"
                    value={contribEvidenceRequired}
                    onChange={(e) => setContribEvidenceRequired(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-c-str">Evidence Strength</Label>
                  <select
                    id="edit-c-str"
                    value={contribEvidenceStrength}
                    onChange={(e) => setContribEvidenceStrength(e.target.value as any)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                  >
                    <option value="weak">Weak</option>
                    <option value="medium">Medium</option>
                    <option value="strong">Strong</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="edit-c-dir"
                    checked={contribIsDirect}
                    onChange={(e) => setContribIsDirect(e.target.checked)}
                    className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                  />
                  <Label htmlFor="edit-c-dir" className="font-semibold text-xs cursor-pointer">Direct Indicator</Label>
                </div>
                <div>
                  <Label htmlFor="edit-c-ref">Source Reference</Label>
                  <Input
                    id="edit-c-ref"
                    value={contribSourceReference}
                    onChange={(e) => setContribSourceReference(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-c-meth">Methodology Version</Label>
                  <Input
                    id="edit-c-meth"
                    value={contribMethodologyVersion}
                    onChange={(e) => setContribMethodologyVersion(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="edit-c-lim">Limitations</Label>
                  <Textarea
                    id="edit-c-lim"
                    value={contribLimitations}
                    onChange={(e) => setContribLimitations(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setContribEditOpen(false)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </PlatformAdminLayout>
  );
}
