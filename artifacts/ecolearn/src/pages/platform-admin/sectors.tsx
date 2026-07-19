import { useState } from "react";
import { PlatformAdminLayout } from "@/components/layout/PlatformAdminLayout";
import {
  usePlatformAdminListSectors,
  usePlatformAdminCreateSector,
  usePlatformAdminUpdateSector,
  usePlatformAdminUpdateSectorStatus
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Plus, Edit, Archive, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";

interface SectorFormData {
  name: string;
  slug: string;
  description: string;
}

export default function PlatformAdminSectors() {
  const queryClient = useQueryClient();
  const sectorsQuery = usePlatformAdminListSectors();

  const createSectorMutation = usePlatformAdminCreateSector({
    mutation: {
      onSuccess: () => {
        toast.success("Sector created successfully");
        queryClient.invalidateQueries({ queryKey: ["platformAdminListSectors"] });
        setCreateOpen(false);
        setForm({ name: "", slug: "", description: "" });
      },
      onError: (err: any) => {
        toast.error(`Error: ${err.message || "Failed to create sector"}`);
      }
    }
  });

  const updateSectorMutation = usePlatformAdminUpdateSector({
    mutation: {
      onSuccess: () => {
        toast.success("Sector updated successfully");
        queryClient.invalidateQueries({ queryKey: ["platformAdminListSectors"] });
        setEditOpen(false);
        setEditingSectorId(null);
        setForm({ name: "", slug: "", description: "" });
      },
      onError: (err: any) => {
        toast.error(`Error: ${err.message || "Failed to update sector"}`);
      }
    }
  });

  const updateStatusMutation = usePlatformAdminUpdateSectorStatus({
    mutation: {
      onSuccess: () => {
        toast.success("Sector status updated successfully");
        queryClient.invalidateQueries({ queryKey: ["platformAdminListSectors"] });
      },
      onError: (err: any) => {
        toast.error(`Error: ${err.message || "Failed to change status"}`);
      }
    }
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingSectorId, setEditingSectorId] = useState<number | null>(null);
  const [form, setForm] = useState<SectorFormData>({ name: "", slug: "", description: "" });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error("Name and Slug are required");
      return;
    }
    // Simple frontend slug validation
    if (!/^[a-z0-9-_]+$/.test(form.slug)) {
      toast.error("Slug must contain only lowercase letters, numbers, dashes, and underscores");
      return;
    }
    createSectorMutation.mutate({ data: form });
  };

  const handleEditClick = (sector: any) => {
    setEditingSectorId(sector.id);
    setForm({
      name: sector.name,
      slug: sector.slug,
      description: sector.description || ""
    });
    setEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSectorId) return;
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    updateSectorMutation.mutate({
      id: editingSectorId,
      data: form
    });
  };

  const handleStatusChange = (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "inactive" : "active";
    if (nextStatus === "inactive") {
      const confirmArchive = window.confirm("Are you sure you want to archive this sector? This will set it to inactive status.");
      if (!confirmArchive) return;
    }
    updateStatusMutation.mutate({
      id,
      data: { status: nextStatus }
    });
  };

  const sectors = sectorsQuery.data || [];

  return (
    <PlatformAdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold font-serif">Sectors</h2>
            <p className="text-muted-foreground mt-1">
              Manage industrial and economic sectors used for classification.
            </p>
          </div>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Create Sector
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <DialogHeader>
                  <DialogTitle>Create Sector</DialogTitle>
                  <DialogDescription>
                    Add a new business or industrial sector to classify content.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="name">Sector Name</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        const slugified = val
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/(^-|-$)/g, "");
                        setForm({ ...form, name: val, slug: form.slug ? form.slug : slugified });
                      }}
                      placeholder="e.g. Hospitality & Tourism"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="slug">Slug (Unique Identifier)</Label>
                    <Input
                      id="slug"
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase() })}
                      placeholder="e.g. hospitality-tourism"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Brief summary of activities included..."
                      className="mt-1"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createSectorMutation.isPending}>
                    {createSectorMutation.isPending ? "Creating..." : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {sectorsQuery.isLoading ? (
          <div className="space-y-2">
            <div className="h-8 bg-muted animate-pulse rounded-md" />
            <div className="h-20 bg-muted animate-pulse rounded-md" />
          </div>
        ) : sectorsQuery.isError ? (
          <div className="p-6 text-center border border-destructive/20 rounded-xl bg-destructive/5 text-destructive flex items-center justify-center gap-2">
            <AlertCircle className="h-5 w-5" /> Failed to load sectors. Please try again.
          </div>
        ) : sectors.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">No sectors registered yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="border rounded-lg overflow-x-auto bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Courses</TableHead>
                  <TableHead className="text-center">Paths</TableHead>
                  <TableHead className="text-center">Insights</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sectors.map((sector: any) => (
                  <TableRow key={sector.id}>
                    <TableCell className="font-medium">{sector.name}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{sector.slug}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground text-xs">
                      {sector.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant={sector.status === "active" ? "default" : "secondary"}>
                        {sector.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-xs text-muted-foreground">Not available</TableCell>
                    <TableCell className="text-center text-xs text-muted-foreground">Not available</TableCell>
                    <TableCell className="text-center text-xs text-muted-foreground">Not available</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(sector)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleStatusChange(sector.id, sector.status)}
                          className={sector.status === "active" ? "text-amber-600" : "text-emerald-600"}
                        >
                          {sector.status === "active" ? <Archive className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <DialogHeader>
                <DialogTitle>Edit Sector</DialogTitle>
                <DialogDescription>
                  Modify the name or description of the sector. Slug cannot be changed after creation.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="edit-name">Sector Name</Label>
                  <Input
                    id="edit-name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Hospitality & Tourism"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-slug">Slug (Immutable)</Label>
                  <Input
                    id="edit-slug"
                    value={form.slug}
                    disabled
                    className="mt-1 bg-muted text-muted-foreground cursor-not-allowed"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Brief summary of activities included..."
                    className="mt-1"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateSectorMutation.isPending}>
                  {updateSectorMutation.isPending ? "Saving..." : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </PlatformAdminLayout>
  );
}
