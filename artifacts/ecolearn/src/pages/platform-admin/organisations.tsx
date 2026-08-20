import { PlatformAdminLayout } from "@/components/layout/PlatformAdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Building2, Plus, Search, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

interface OrganisationItem {
  id: number;
  name: string;
  slug: string;
  status: string;
  planBand: string;
  maxEmployees: number;
  userCount: number;
  companyAdminCount: number;
  onboardingComplete: boolean;
  createdAt: string;
}

export default function PlatformAdminOrganisations() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgIndustry, setNewOrgIndustry] = useState("");
  const [newOrgSeats, setNewOrgSeats] = useState(25);
  const [newOrgAdminEmail, setNewOrgAdminEmail] = useState("");
  const [newOrgAdminName, setNewOrgAdminName] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  const { data: orgs, isLoading, isError, error, refetch } = useQuery<OrganisationItem[]>({
    queryKey: ["/api/platform-admin/organisations"],
    queryFn: () => customFetch<OrganisationItem[]>("/api/platform-admin/organisations"),
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      return await customFetch("/api/platform-admin/organisations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newOrgName,
          industry: newOrgIndustry,
          maxEmployees: newOrgSeats,
          adminEmail: newOrgAdminEmail,
          adminName: newOrgAdminName,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/platform-admin/organisations"] });
      refetch();
      setIsCreateOpen(false);
      setNewOrgName("");
      setNewOrgIndustry("");
      setNewOrgAdminEmail("");
      setNewOrgAdminName("");
      setCreateError(null);
    },
    onError: (err: any) => {
      setCreateError(err?.message || "Failed to create client organisation");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await customFetch(`/api/platform-admin/organisations/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/platform-admin/organisations"] });
      refetch();
    },
  });

  const filteredOrgs = (orgs ?? []).filter((o) =>
    o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.toString().includes(searchTerm)
  );

  return (
    <PlatformAdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold font-serif">Client Organisations</h2>
            <p className="text-muted-foreground">Search, inspect, and register client organisations on ELEVIO SKILLS.</p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shrink-0">
                <Plus className="h-4 w-4" />
                Add Organisation
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Register Client Organisation</DialogTitle>
                <DialogDescription>
                  Manually provision a client workspace with allocated employee capacity and administrator access.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {createError && (
                  <div className="p-3 text-xs bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded border border-red-200">
                    {createError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="orgName">Organisation Name *</Label>
                  <Input
                    id="orgName"
                    placeholder="e.g. Infracare"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="orgIndustry">Industry / Sector</Label>
                  <Input
                    id="orgIndustry"
                    placeholder="e.g. Facilities Management"
                    value={newOrgIndustry}
                    onChange={(e) => setNewOrgIndustry(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="orgSeats">Max Allocated Seats</Label>
                  <Input
                    id="orgSeats"
                    type="number"
                    min={1}
                    max={1000}
                    value={newOrgSeats}
                    onChange={(e) => setNewOrgSeats(parseInt(e.target.value) || 25)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="adminEmail">Primary Administrator Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    placeholder="e.g. infracare.mu@gmail.com"
                    value={newOrgAdminEmail}
                    onChange={(e) => setNewOrgAdminEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="adminName">Administrator Full Name</Label>
                  <Input
                    id="adminName"
                    placeholder="e.g. Infracare Administrator"
                    value={newOrgAdminName}
                    onChange={(e) => setNewOrgAdminName(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={!newOrgName.trim() || createMutation.isPending}
                  onClick={() => createMutation.mutate()}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating…
                    </>
                  ) : (
                    "Create Workspace"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by company name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-md bg-background text-sm"
            />
          </div>
        </div>

        {isError && (
          <div className="p-4 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-xl border border-red-200 flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">Failed to load client organisations</p>
              <p className="text-xs text-red-600 dark:text-red-400">{(error as any)?.message || "Server returned an error"}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {isLoading ? (
          <Skeleton className="h-64 rounded-xl" />
        ) : filteredOrgs.length === 0 ? (
          <div className="p-12 text-center border rounded-xl bg-card">
            <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold text-lg">No client organisations found</h3>
            <p className="text-sm text-muted-foreground">No organisations matched your search query.</p>
          </div>
        ) : (
          <div className="border rounded-xl bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-muted-foreground font-medium border-b">
                  <tr>
                    <th className="p-4">Company</th>
                    <th className="p-4">Org ID</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Plan / Band</th>
                    <th className="p-4">Users</th>
                    <th className="p-4">Admins</th>
                    <th className="p-4">Created</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredOrgs.map((org) => (
                    <tr key={org.id} className="hover:bg-muted/50">
                      <td className="p-4 font-semibold">{org.name}</td>
                      <td className="p-4 text-muted-foreground">#{org.id}</td>
                      <td className="p-4">
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                          {org.status}
                        </Badge>
                      </td>
                      <td className="p-4">{org.planBand}</td>
                      <td className="p-4 font-medium">{org.userCount}</td>
                      <td className="p-4">
                        {org.companyAdminCount === 0 ? (
                          <Badge variant="destructive" className="text-xs">
                            No Admin
                          </Badge>
                        ) : (
                          <span className="font-medium text-emerald-600">{org.companyAdminCount}</span>
                        )}
                      </td>
                      <td className="p-4 text-muted-foreground text-xs">
                        {org.createdAt ? new Date(org.createdAt).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/platform-admin/organisations/${org.id}`}
                            className="text-xs font-medium text-primary hover:underline"
                          >
                            View Detail
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                            title="Delete organisation"
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to permanently delete "${org.name}"?`)) {
                                deleteMutation.mutate(org.id);
                              }
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PlatformAdminLayout>
  );
}
