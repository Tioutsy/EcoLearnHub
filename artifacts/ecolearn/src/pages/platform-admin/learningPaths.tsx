import { useState } from "react";
import { PlatformAdminLayout } from "@/components/layout/PlatformAdminLayout";
import {
  usePlatformAdminListLearningPaths,
  usePlatformAdminCreateLearningPath,
  usePlatformAdminUpdateLearningPath,
  usePlatformAdminUpdateLearningPathStatus,
  usePlatformAdminUpdateLearningPathCourses,
  useListCourses,
  usePlatformAdminListSectors
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Edit, Archive, CheckCircle, ArrowLeft, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface PathCourseItem {
  courseId: number;
  position: number;
  isRequired: boolean;
}

export default function PlatformAdminLearningPaths() {
  const queryClient = useQueryClient();

  // Queries
  const pathsQuery = usePlatformAdminListLearningPaths();
  const coursesQuery = useListCourses();
  const sectorsQuery = usePlatformAdminListSectors();

  // Mutations
  const createPathMutation = usePlatformAdminCreateLearningPath({
    mutation: {
      onSuccess: (newPath: any) => {
        toast.success("Learning path created");
        saveCourses(newPath.id);
      },
      onError: (err: any) => toast.error(err.message || "Failed to create learning path")
    }
  });

  const updatePathMutation = usePlatformAdminUpdateLearningPath({
    mutation: {
      onSuccess: (updatedPath: any) => {
        toast.success("Learning path updated");
        saveCourses(updatedPath.id);
      },
      onError: (err: any) => toast.error(err.message || "Failed to update learning path")
    }
  });

  const updateStatusMutation = usePlatformAdminUpdateLearningPathStatus({
    mutation: {
      onSuccess: () => {
        toast.success("Status updated");
        queryClient.invalidateQueries({ queryKey: ["platformAdminListLearningPaths"] });
      },
      onError: (err: any) => toast.error(err.message || "Failed to update status")
    }
  });

  const updateCoursesMutation = usePlatformAdminUpdateLearningPathCourses({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["platformAdminListLearningPaths"] });
        setViewMode("list");
        resetForm();
      },
      onError: (err: any) => toast.error(err.message || "Failed to save path courses sequence")
    }
  });

  // State Management
  const [viewMode, setViewMode] = useState<"list" | "create" | "edit">("list");
  const [editingPathId, setEditingPathId] = useState<number | null>(null);

  // Form Fields
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [audience, setAudience] = useState("");
  const [icon, setIcon] = useState("route");
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [intendedRoles, setIntendedRoles] = useState("");
  const [estimatedDurationMinutes, setEstimatedDurationMinutes] = useState(0);
  const [status, setStatus] = useState<"draft" | "active" | "archived">("draft");
  const [completionCriteria, setCompletionCriteria] = useState("");
  const [certificateEligibility, setCertificateEligibility] = useState(false);
  const [recommendedNextPathId, setRecommendedNextPathId] = useState<number | "">("");

  const [selectedSectors, setSelectedSectors] = useState<number[]>([]);
  const [pathCourses, setPathCourses] = useState<PathCourseItem[]>([]);

  const resetForm = () => {
    setEditingPathId(null);
    setSlug("");
    setTitle("");
    setDescription("");
    setAudience("");
    setIcon("route");
    setDifficulty("beginner");
    setIntendedRoles("");
    setEstimatedDurationMinutes(0);
    setStatus("draft");
    setCompletionCriteria("");
    setCertificateEligibility(false);
    setRecommendedNextPathId("");
    setSelectedSectors([]);
    setPathCourses([]);
  };

  const handleEditClick = (path: any) => {
    setEditingPathId(path.id);
    setSlug(path.slug);
    setTitle(path.title);
    setDescription(path.description);
    setAudience(path.audience);
    setIcon(path.icon || "route");
    setDifficulty(path.difficulty || "beginner");
    setIntendedRoles(path.intendedRoles?.join(", ") || "");
    setEstimatedDurationMinutes(path.estimatedDurationMinutes || 0);
    setStatus(path.status || "draft");
    setCompletionCriteria(path.completionCriteria || "");
    setCertificateEligibility(path.certificateEligibility || false);
    setRecommendedNextPathId(path.recommendedNextPathId || "");
    setSelectedSectors(path.sectors || []);

    // Load assigned courses
    const loadedCourses = (path.modules || []).map((m: any, idx: number) => ({
      courseId: m.courseId,
      position: idx + 1,
      isRequired: m.isRequired !== false
    }));
    setPathCourses(loadedCourses);
    setViewMode("edit");
  };

  const handleAddCourse = (courseId: number) => {
    if (pathCourses.some(c => c.courseId === courseId)) {
      toast.error("Course is already assigned to this learning path");
      return;
    }
    const maxPosition = pathCourses.reduce((max, c) => c.position > max ? c.position : max, 0);
    setPathCourses([...pathCourses, {
      courseId,
      position: maxPosition + 1,
      isRequired: true
    }]);
  };

  const handleRemoveCourse = (courseId: number) => {
    const remaining = pathCourses.filter(c => c.courseId !== courseId);
    // Recalculate positions to keep them continuous (1..N)
    const reindexed = remaining.map((c, idx) => ({ ...c, position: idx + 1 }));
    setPathCourses(reindexed);
  };

  const handleMoveCourse = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === pathCourses.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const newCourses = [...pathCourses];

    // Swap courses
    const temp = newCourses[index];
    newCourses[index] = newCourses[targetIndex];
    newCourses[targetIndex] = temp;

    // Correct positions
    const corrected = newCourses.map((c, idx) => ({ ...c, position: idx + 1 }));
    setPathCourses(corrected);
  };

  const handleToggleRequired = (index: number) => {
    const updated = [...pathCourses];
    updated[index].isRequired = !updated[index].isRequired;
    setPathCourses(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug.trim() || !title.trim() || !description.trim() || !audience.trim()) {
      toast.error("Please fill in all required fields (marked *)");
      return;
    }

    // Validate no duplicates
    const courseIds = pathCourses.map(c => c.courseId);
    const positions = pathCourses.map(c => c.position);
    if (new Set(courseIds).size !== courseIds.length) {
      toast.error("Duplicate course assignments detected");
      return;
    }
    if (new Set(positions).size !== positions.length) {
      toast.error("Duplicate course positions detected");
      return;
    }

    const payload: any = {
      slug,
      title,
      description,
      audience,
      icon,
      difficulty,
      intendedRoles: intendedRoles.split(",").map(r => r.trim()).filter(Boolean),
      estimatedDurationMinutes: Number(estimatedDurationMinutes),
      status,
      completionCriteria: completionCriteria || null,
      certificateEligibility,
      recommendedNextPathId: recommendedNextPathId === "" ? null : Number(recommendedNextPathId),
      sectors: selectedSectors
    };

    if (viewMode === "create") {
      createPathMutation.mutate({ data: payload });
    } else if (viewMode === "edit" && editingPathId) {
      updatePathMutation.mutate({
        id: editingPathId,
        data: payload
      });
    }
  };

  const saveCourses = (pathId: number) => {
    const payload = pathCourses.map(c => ({
      courseId: c.courseId,
      position: c.position,
      isRequired: c.isRequired
    }));
    updateCoursesMutation.mutate({
      id: pathId,
      data: { courses: payload }
    });
  };

  const handleStatusChange = (id: number, current: string) => {
    const next = current === "active" ? "inactive" : "active";
    if (next === "inactive") {
      const ok = window.confirm("Are you sure you want to archive this learning path?");
      if (!ok) return;
    }
    updateStatusMutation.mutate({
      id,
      data: { status: next === "inactive" ? "archived" : "active" }
    });
  };

  const paths = pathsQuery.data || [];
  const coursesList = coursesQuery.data || [];
  const sectors = sectorsQuery.data || [];

  return (
    <PlatformAdminLayout>
      {viewMode === "list" ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold font-serif">Learning Paths</h2>
              <p className="text-muted-foreground mt-1">
                Design multi-course structured paths targeted to sectors or user roles.
              </p>
            </div>

            <Button onClick={() => { resetForm(); setViewMode("create"); }} className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Create Path
            </Button>
          </div>

          {pathsQuery.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : paths.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="text-muted-foreground">
                No learning paths created yet.
              </CardContent>
            </Card>
          ) : (
            <div className="border rounded-lg overflow-x-auto bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Estimated Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paths.map((path: any) => (
                    <TableRow key={path.id}>
                      <TableCell className="font-medium">{path.title}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{path.slug}</TableCell>
                      <TableCell className="capitalize text-xs">{path.difficulty}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{path.estimatedDurationMinutes} mins</TableCell>
                      <TableCell>
                        <Badge variant={path.status === "active" ? "default" : "secondary"}>
                          {path.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(path)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleStatusChange(path.id, path.status)}
                            className={path.status === "active" ? "text-amber-600" : "text-emerald-600"}
                          >
                            {path.status === "active" ? <Archive className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      ) : (
        // Create / Edit View
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex items-center gap-4">
            <Button type="button" variant="outline" size="icon" onClick={() => setViewMode("list")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-2xl font-bold font-serif">
                {viewMode === "create" ? "Create Learning Path" : "Edit Learning Path"}
              </h2>
              <p className="text-sm text-muted-foreground">
                Set difficulty parameters, module sequences, and requirements.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6 bg-card border rounded-xl p-6 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="path-title">Path Title *</Label>
                  <Input
                    id="path-title"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (viewMode === "create") {
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
                      }
                    }}
                    placeholder="e.g. Hospitality Eco Officer Path"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="path-slug">Slug *</Label>
                  <Input
                    id="path-slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase())}
                    placeholder="hospitality-eco-officer"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="path-audience">Target Audience *</Label>
                  <Input
                    id="path-audience"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    placeholder="e.g. Hotel Managers and Staff"
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="path-desc">Description *</Label>
                <Textarea
                  id="path-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed description of the path objectives..."
                  className="mt-1"
                  required
                />
              </div>

              {/* Courses Sequence Builder */}
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm">Course Sequence Setup</h4>
                  <span className="text-xs text-muted-foreground">Order courses from first to last</span>
                </div>

                {pathCourses.length === 0 ? (
                  <div className="border border-dashed rounded-lg p-6 text-center text-xs text-muted-foreground">
                    No courses added yet. Select a course from the sidebar to start building the path sequence.
                  </div>
                ) : (
                  <div className="border rounded-lg bg-background">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">Pos</TableHead>
                          <TableHead>Course</TableHead>
                          <TableHead className="w-24 text-center">Required</TableHead>
                          <TableHead className="w-32 text-right">Order</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pathCourses.map((item, idx) => {
                          const courseTitle = coursesList.find((c: any) => c.id === item.courseId)?.title || `Course ID ${item.courseId}`;
                          return (
                            <TableRow key={item.courseId}>
                              <TableCell className="font-semibold text-xs">{item.position}</TableCell>
                              <TableCell className="font-medium text-xs">{courseTitle}</TableCell>
                              <TableCell className="text-center">
                                <input
                                  type="checkbox"
                                  checked={item.isRequired}
                                  onChange={() => handleToggleRequired(idx)}
                                  className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="inline-flex gap-1">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleMoveCourse(idx, "up")}
                                    disabled={idx === 0}
                                    className="h-7 w-7"
                                  >
                                    <ArrowUp className="h-4.5 w-4.5" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleMoveCourse(idx, "down")}
                                    disabled={idx === pathCourses.length - 1}
                                    className="h-7 w-7"
                                  >
                                    <ArrowDown className="h-4.5 w-4.5" />
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveCourse(item.courseId)}
                                  className="h-7 w-7 text-destructive"
                                >
                                  <Trash2 className="h-4.5 w-4.5" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4">
                <div>
                  <Label htmlFor="path-comp">Completion Criteria</Label>
                  <Input
                    id="path-comp"
                    value={completionCriteria}
                    onChange={(e) => setCompletionCriteria(e.target.value)}
                    placeholder="e.g. Pass all mandatory quizzes"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="path-next">Recommended Follow-up Path</Label>
                  <select
                    id="path-next"
                    value={recommendedNextPathId}
                    onChange={(e) => setRecommendedNextPathId(e.target.value === "" ? "" : Number(e.target.value))}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-1"
                  >
                    <option value="">None</option>
                    {paths.filter((p: any) => p.id !== editingPathId).map((p: any) => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 border-t pt-4">
                <Button type="button" variant="outline" onClick={() => setViewMode("list")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createPathMutation.isPending || updatePathMutation.isPending || updateCoursesMutation.isPending}>
                  Save Learning Path
                </Button>
              </div>
            </div>

            {/* Sidebar path configurations */}
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6 space-y-4 text-xs">
                  <div>
                    <Label htmlFor="path-diff">Difficulty Level</Label>
                    <select
                      id="path-diff"
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as any)}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-1"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="path-dur">Estimated Duration (minutes)</Label>
                    <Input
                      id="path-dur"
                      type="number"
                      value={estimatedDurationMinutes}
                      onChange={(e) => setEstimatedDurationMinutes(Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="path-roles">Intended Roles (comma-separated)</Label>
                    <Input
                      id="path-roles"
                      value={intendedRoles}
                      onChange={(e) => setIntendedRoles(e.target.value)}
                      placeholder="e.g. Officer, Manager"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="path-status">Publication Status</Label>
                    <select
                      id="path-status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-1"
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="path-cert"
                      checked={certificateEligibility}
                      onChange={(e) => setCertificateEligibility(e.target.checked)}
                      className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                    />
                    <Label htmlFor="path-cert" className="font-semibold text-xs cursor-pointer">Eligible for Certificate</Label>
                  </div>
                </CardContent>
              </Card>

              {/* Sectors select */}
              <Card>
                <CardContent className="pt-6 text-xs space-y-3">
                  <Label className="font-semibold text-xs mb-1 block">Assigned Sectors</Label>
                  <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                    {sectors.map((sec: any) => (
                      <label key={sec.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedSectors.includes(sec.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSectors([...selectedSectors, sec.id]);
                            } else {
                              setSelectedSectors(selectedSectors.filter(id => id !== sec.id));
                            }
                          }}
                        />
                        {sec.name}
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Add Courses Selection */}
              <Card>
                <CardContent className="pt-6 text-xs space-y-3">
                  <Label className="font-semibold text-xs mb-1 block">Add Courses to Path</Label>
                  <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2 bg-background">
                    {coursesList.map((crs: any) => {
                      const isAssigned = pathCourses.some(pc => pc.courseId === crs.id);
                      return (
                        <div key={crs.id} className="flex items-center justify-between gap-2 p-1.5 border-b last:border-b-0">
                          <span className="font-medium truncate">{crs.title}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={isAssigned}
                            onClick={() => handleAddCourse(crs.id)}
                            className="h-6 px-2 text-[10px]"
                          >
                            {isAssigned ? "Added" : "Add"}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      )}
    </PlatformAdminLayout>
  );
}
