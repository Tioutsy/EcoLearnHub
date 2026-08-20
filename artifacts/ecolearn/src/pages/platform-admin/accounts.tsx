import { PlatformAdminLayout } from "@/components/layout/PlatformAdminLayout";
import { useQuery } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, User, Search } from "lucide-react";
import { useState } from "react";

interface AccountItem {
  id: number;
  clerkUserId: string | null;
  name: string;
  email: string;
  role: string;
  companyId: number;
  companyName: string;
  status: string;
  createdAt: string;
  lastActiveAt: string | null;
}

export default function PlatformAdminAccounts() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: accounts, isLoading } = useQuery<AccountItem[]>({
    queryKey: ["/api/platform-admin/accounts"],
    queryFn: () => customFetch<AccountItem[]>("/api/platform-admin/accounts"),
  });

  const filtered = (accounts ?? []).filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PlatformAdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold font-serif">Global Accounts Directory</h2>
          <p className="text-muted-foreground">Search and inspect all user accounts across ELEVIO SKILLS.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-md bg-background text-sm"
            />
          </div>
        </div>

        {isLoading ? (
          <Skeleton className="h-64 rounded-xl" />
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center border rounded-xl bg-card">
            <User className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold text-lg">No accounts found</h3>
            <p className="text-sm text-muted-foreground">No user accounts matched your search parameters.</p>
          </div>
        ) : (
          <div className="border rounded-xl bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-muted-foreground font-medium border-b">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Organisation</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((acc) => (
                    <tr key={acc.id} className="hover:bg-muted/50">
                      <td className="p-4 font-semibold">{acc.name}</td>
                      <td className="p-4 text-muted-foreground">{acc.email}</td>
                      <td className="p-4">
                        {acc.role === "PLATFORM_ADMIN" ? (
                          <Badge className="bg-emerald-700 text-white">Platform Admin</Badge>
                        ) : acc.role === "COMPANY_ADMIN" ? (
                          <Badge className="bg-purple-600 text-white">Company Admin</Badge>
                        ) : acc.role === "MANAGER" ? (
                          <Badge className="bg-blue-600 text-white">Manager</Badge>
                        ) : (
                          <Badge variant="outline">Learner</Badge>
                        )}
                      </td>
                      <td className="p-4 font-medium">{acc.companyName}</td>
                      <td className="p-4">
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                          {acc.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-muted-foreground text-xs">
                        {acc.createdAt ? new Date(acc.createdAt).toLocaleDateString() : "N/A"}
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
