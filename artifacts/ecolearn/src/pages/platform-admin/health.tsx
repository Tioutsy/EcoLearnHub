import { PlatformAdminLayout } from "@/components/layout/PlatformAdminLayout";
import { useQuery } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, CheckCircle2 } from "lucide-react";

interface HealthWarning {
  id: string;
  type: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  message: string;
}

export default function PlatformAdminHealth() {
  const { data: warnings, isLoading } = useQuery<HealthWarning[]>({
    queryKey: ["/api/platform-admin/health"],
    queryFn: () => customFetch<HealthWarning[]>("/api/platform-admin/health"),
  });

  return (
    <PlatformAdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold font-serif">Account & Organisation Health Warnings</h2>
          <p className="text-muted-foreground">Automated health checks identifying orphaned users, missing company admins, or setup inconsistencies.</p>
        </div>

        {isLoading ? (
          <Skeleton className="h-64 rounded-xl" />
        ) : (warnings ?? []).length === 0 ? (
          <div className="p-12 text-center border rounded-xl bg-card border-emerald-200 bg-emerald-50/20">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto mb-3" />
            <h3 className="font-semibold text-lg text-emerald-950">All Systems Healthy</h3>
            <p className="text-sm text-emerald-800">No orphaned users or missing company administrator warnings found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {(warnings ?? []).map((warn) => (
              <div
                key={warn.id}
                className="p-5 border rounded-xl bg-card flex items-start gap-4 shadow-sm"
              >
                <div
                  className={`p-2 rounded-lg shrink-0 ${
                    warn.severity === "HIGH"
                      ? "bg-rose-100 text-rose-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-base">{warn.title}</h4>
                    <Badge
                      variant="outline"
                      className={
                        warn.severity === "HIGH"
                          ? "bg-rose-50 text-rose-700 border-rose-200 text-xs"
                          : "bg-amber-50 text-amber-700 border-amber-200 text-xs"
                      }
                    >
                      {warn.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{warn.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PlatformAdminLayout>
  );
}
