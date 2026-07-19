import { useParams, Link } from "wouter";
import { useUser } from "@clerk/react";
import { isPlatformAdmin } from "@/lib/authHelpers";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert } from "lucide-react";
import DatabaseCoursePlayer from "../learn/DatabaseCoursePlayer";

export default function AdminCoursePreview() {
  const { id: courseIdRaw } = useParams();
  const courseId = parseInt(courseIdRaw || "0", 10);
  const { user, isLoaded } = useUser();
  const isAuthorized = isPlatformAdmin(user);

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-md text-center">
        <div className="mx-auto h-12 w-12 rounded-xl bg-rose-100 flex items-center justify-center mb-4">
          <ShieldAlert className="h-6 w-6 text-rose-600" />
        </div>
        <h1 className="text-2xl font-bold font-serif mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6">
          You do not have permission to preview courses. This portal is strictly limited to EcoLearn Mauritius platform administrators.
        </p>
        <Link href="/dashboard" className="text-primary hover:underline">
          Go to Student Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Explicit Admin Preview Banner */}
      <div className="bg-amber-500 text-amber-950 px-4 py-2 text-center text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 select-none">
        <ShieldAlert className="h-4 w-4" />
        Preview Mode (Administrator) - No completion progress or certification will be saved.
      </div>
      <div className="flex-1">
        <DatabaseCoursePlayer isPreview={true} previewCourseId={courseId} />
      </div>
    </div>
  );
}
