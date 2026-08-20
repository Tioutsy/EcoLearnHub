import { Layout } from "@/components/layout/Layout";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import {
  Building2,
  Briefcase,
  Plus,
  Pencil,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Users,
  Search,
} from "lucide-react";

interface ListItem {
  id: number;
  companyId: number;
  name: string;
  code: string | null;
  status: "active" | "inactive";
  employeeCount?: number;
  createdAt: string;
  updatedAt: string;
}

export default function CompanyListSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"departments" | "job-titles">("departments");
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ListItem | null>(null);
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");

  // Fetch Departments
  const {
    data: departments = [],
    isLoading: isLoadingDepts,
    refetch: refetchDepts,
  } = useQuery<ListItem[]>({
    queryKey: ["company", "departments"],
    queryFn: async () => {
      const res = await customFetch("/api/company/departments?includeArchived=true");
      return (res as any) || [];
    },
  });

  // Fetch Job Titles
  const {
    data: jobTitles = [],
    isLoading: isLoadingTitles,
    refetch: refetchTitles,
  } = useQuery<ListItem[]>({
    queryKey: ["company", "job-titles"],
    queryFn: async () => {
      const res = await customFetch("/api/company/job-titles?includeArchived=true");
      return (res as any) || [];
    },
  });

  // Add Item Mutation
  const addMutation = useMutation({
    mutationFn: async ({ type, name, code }: { type: "departments" | "job-titles"; name: string; code?: string }) => {
      const endpoint = type === "departments" ? "/api/company/departments" : "/api/company/job-titles";
      return await customFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, code: code || undefined }),
      } as RequestInit);
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Success",
        description: `${variables.type === "departments" ? "Department" : "Job title"} created successfully.`,
      });
      setIsAddOpen(false);
      setFormName("");
      setFormCode("");
      queryClient.invalidateQueries({ queryKey: ["company", variables.type] });
      queryClient.invalidateQueries({ queryKey: ["company", "onboarding-options"] });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err?.message || "Failed to create list item.",
        variant: "destructive",
      });
    },
  });

  // Update Item Mutation
  const updateMutation = useMutation({
    mutationFn: async ({
      type,
      id,
      name,
      code,
      status,
    }: {
      type: "departments" | "job-titles";
      id: number;
      name?: string;
      code?: string;
      status?: "active" | "inactive";
    }) => {
      const endpoint = type === "departments" ? `/api/company/departments/${id}` : `/api/company/job-titles/${id}`;
      return await customFetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, code: code || undefined, status }),
      } as RequestInit);
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Success",
        description: `${variables.type === "departments" ? "Department" : "Job title"} updated successfully.`,
      });
      setIsEditOpen(false);
      setEditingItem(null);
      queryClient.invalidateQueries({ queryKey: ["company", variables.type] });
      queryClient.invalidateQueries({ queryKey: ["company", "onboarding-options"] });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err?.message || "Failed to update item.",
        variant: "destructive",
      });
    },
  });

  const handleOpenAdd = () => {
    setFormName("");
    setFormCode("");
    setIsAddOpen(true);
  };

  const handleOpenEdit = (item: ListItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCode(item.code || "");
    setIsEditOpen(true);
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = formName.trim();
    if (!cleanName) {
      toast({ title: "Validation Error", description: "Name is required.", variant: "destructive" });
      return;
    }

    const currentList = activeTab === "departments" ? departments : jobTitles;
    if (currentList.some((item) => item.name.toLowerCase() === cleanName.toLowerCase())) {
      toast({
        title: "Duplicate Entry",
        description: `A ${activeTab === "departments" ? "department" : "job title"} with this name already exists.`,
        variant: "destructive",
      });
      return;
    }

    addMutation.mutate({
      type: activeTab,
      name: cleanName,
      code: formCode.trim() || undefined,
    });
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    const cleanName = formName.trim();
    if (!cleanName) {
      toast({ title: "Validation Error", description: "Name is required.", variant: "destructive" });
      return;
    }

    const currentList = activeTab === "departments" ? departments : jobTitles;
    if (
      currentList.some(
        (item) => item.id !== editingItem.id && item.name.toLowerCase() === cleanName.toLowerCase()
      )
    ) {
      toast({
        title: "Duplicate Entry",
        description: `A ${activeTab === "departments" ? "department" : "job title"} with this name already exists.`,
        variant: "destructive",
      });
      return;
    }

    updateMutation.mutate({
      type: activeTab,
      id: editingItem.id,
      name: cleanName,
      code: formCode.trim() || undefined,
    });
  };

  const handleToggleStatus = (item: ListItem) => {
    const nextStatus = item.status === "active" ? "inactive" : "active";
    updateMutation.mutate({
      type: activeTab,
      id: item.id,
      status: nextStatus,
    });
  };

  const currentItems = (activeTab === "departments" ? departments : jobTitles).filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.code && item.code.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activeCount = currentItems.filter((i) => i.status === "active").length;
  const inactiveCount = currentItems.filter((i) => i.status === "inactive").length;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header & Back Link */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link href="/company/employees">
              <Button variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back to Employees
              </Button>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-serif text-foreground">
              Company Lists & Structure
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Configure active departments and job titles for employee profiles and autonomous invitation onboarding.
            </p>
          </div>
          <Button
            onClick={handleOpenAdd}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium self-start md:self-auto"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add {activeTab === "departments" ? "Department" : "Job Title"}
          </Button>
        </div>

        {/* Warning if lists are empty */}
        {departments.length === 0 && !isLoadingDepts && (
          <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-800 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200">No departments configured</h4>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                Invited employees will need at least one active department to complete their profile setup upon joining.
              </p>
            </div>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as any); setSearchQuery(""); }} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
            <TabsList className="grid grid-cols-2 w-full sm:w-auto">
              <TabsTrigger value="departments" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>Departments</span>
                <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0 h-4">
                  {departments.filter(d => d.status === "active").length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="job-titles" className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                <span>Job Titles</span>
                <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0 h-4">
                  {jobTitles.filter(j => j.status === "active").length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${activeTab === "departments" ? "departments" : "job titles"}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </div>

          <TabsContent value="departments" className="m-0 space-y-4">
            {isLoadingDepts ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : currentItems.length === 0 ? (
              <div className="text-center py-12 border rounded-xl bg-card">
                <Building2 className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="text-base font-medium text-foreground">
                  {searchQuery ? "No matching departments found" : "No departments added yet"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  {searchQuery
                    ? "Try adjusting your search query."
                    : "Add departments such as 'Operations', 'Finance', or 'Sustainability' to categorize your employees."}
                </p>
                {!searchQuery && (
                  <Button onClick={handleOpenAdd} size="sm" variant="outline" className="mt-4">
                    <Plus className="w-4 h-4 mr-1.5" />
                    Add Department
                  </Button>
                )}
              </div>
            ) : (
              <div className="border rounded-xl bg-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-foreground">
                          {item.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs font-mono">
                          {item.code || "—"}
                        </TableCell>
                        <TableCell>
                          {item.status === "active" ? (
                            <Badge className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(item)}
                            className="h-8 px-2 text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="w-3.5 h-3.5 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(item)}
                            className={`h-8 px-2 ${
                              item.status === "active"
                                ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                                : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                            }`}
                          >
                            {item.status === "active" ? "Deactivate" : "Activate"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="job-titles" className="m-0 space-y-4">
            {isLoadingTitles ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : currentItems.length === 0 ? (
              <div className="text-center py-12 border rounded-xl bg-card">
                <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="text-base font-medium text-foreground">
                  {searchQuery ? "No matching job titles found" : "No job titles added yet"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  {searchQuery
                    ? "Try adjusting your search query."
                    : "Add job titles such as 'Manager', 'Analyst', or 'Coordinator' for your team."}
                </p>
                {!searchQuery && (
                  <Button onClick={handleOpenAdd} size="sm" variant="outline" className="mt-4">
                    <Plus className="w-4 h-4 mr-1.5" />
                    Add Job Title
                  </Button>
                )}
              </div>
            ) : (
              <div className="border rounded-xl bg-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-foreground">
                          {item.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs font-mono">
                          {item.code || "—"}
                        </TableCell>
                        <TableCell>
                          {item.status === "active" ? (
                            <Badge className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(item)}
                            className="h-8 px-2 text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="w-3.5 h-3.5 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(item)}
                            className={`h-8 px-2 ${
                              item.status === "active"
                                ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                                : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                            }`}
                          >
                            {item.status === "active" ? "Deactivate" : "Activate"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Add Dialog */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleSubmitAdd}>
              <DialogHeader>
                <DialogTitle>Add {activeTab === "departments" ? "Department" : "Job Title"}</DialogTitle>
                <DialogDescription>
                  Enter the details for the new {activeTab === "departments" ? "department" : "job title"}.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="name"
                    placeholder={activeTab === "departments" ? "e.g. Operations" : "e.g. Sustainability Lead"}
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Code (Optional)</Label>
                  <Input
                    id="code"
                    placeholder={activeTab === "departments" ? "e.g. OPS" : "e.g. SL-01"}
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={addMutation.isPending || !formName.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {addMutation.isPending && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
                  Save
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleSubmitEdit}>
              <DialogHeader>
                <DialogTitle>Edit {activeTab === "departments" ? "Department" : "Job Title"}</DialogTitle>
                <DialogDescription>
                  Update the name or code for this {activeTab === "departments" ? "department" : "job title"}.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="edit-name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-code">Code (Optional)</Label>
                  <Input
                    id="edit-code"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending || !formName.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
