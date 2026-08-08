import { PlatformAdminLayout } from "@/components/layout/PlatformAdminLayout";
import { useQuery } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Building2, Search } from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const { data: orgs, isLoading } = useQuery<OrganisationItem[]>({
    queryKey: ["/api/platform-admin/organisations"],
    queryFn: () => customFetch<OrganisationItem[]>("/api/platform-admin/organisations"),
  });

  const filteredOrgs = (orgs ?? []).filter((o) =>
    o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.toString().includes(searchTerm)
  );

  return (
    <PlatformAdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold font-serif">Client Organisations</h2>
          <p className="text-muted-foreground">Search and inspect all client organisations registered on ELEVIO SKILLS.</p>
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
                        <Link
                          href={`/platform-admin/organisations/${org.id}`}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          View Detail
                        </Link>
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
