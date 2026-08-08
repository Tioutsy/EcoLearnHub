import { PlatformAdminLayout } from "@/components/layout/PlatformAdminLayout";
import { useQuery } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";

interface LogItem {
  id: string;
  eventType: string;
  timestamp: string;
  details: string;
}

export default function PlatformAdminActivity() {
  const { data: logs, isLoading } = useQuery<LogItem[]>({
    queryKey: ["/api/platform-admin/activity"],
    queryFn: () => customFetch<LogItem[]>("/api/platform-admin/activity"),
  });

  return (
    <PlatformAdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold font-serif">Platform Activity Log</h2>
          <p className="text-muted-foreground">Monitor recent account creation, organisation registrations, and administrative events.</p>
        </div>

        {isLoading ? (
          <Skeleton className="h-64 rounded-xl" />
        ) : (logs ?? []).length === 0 ? (
          <div className="p-12 text-center border rounded-xl bg-card">
            <Activity className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold text-lg">No recent activity</h3>
            <p className="text-sm text-muted-foreground">Operational activity events will be logged here.</p>
          </div>
        ) : (
          <div className="border rounded-xl bg-card divide-y">
            {(logs ?? []).map((log) => (
              <div key={log.id} className="p-4 flex items-start gap-4 hover:bg-muted/50 transition-colors">
                <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0 mt-0.5">
                  <Activity className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {log.eventType}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground font-medium">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PlatformAdminLayout>
  );
}
