import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useUser } from "@clerk/react";
import { LayoutDashboard, Leaf, FolderOpen, Route, BookOpen, Target, ShieldAlert, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Layout } from "./Layout";
import { isPlatformAdmin } from "@/lib/authHelpers";

interface PlatformAdminLayoutProps {
  children: ReactNode;
}

export function PlatformAdminLayout({ children }: PlatformAdminLayoutProps) {
  const [location] = useLocation();
  const { user, isLoaded } = useUser();
  const isAuthorized = isPlatformAdmin(user);

  if (!isLoaded) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <Skeleton className="h-64 rounded-xl" />
            <div className="md:col-span-3">
              <Skeleton className="h-96 rounded-xl" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthorized) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 max-w-md text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-rose-100 flex items-center justify-center mb-4">
            <ShieldAlert className="h-6 w-6 text-rose-600" />
          </div>
          <h1 className="text-2xl font-bold font-serif mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You do not have permission to view this section. This portal is strictly limited to EcoLearn Mauritius platform administrators.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Go to student dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Layout>
    );
  }

  const sidebarLinks = [
    { href: "/platform-admin", label: "Overview", icon: LayoutDashboard },
    { href: "/platform-admin/insights", label: "Insights", icon: Leaf },
    { href: "/platform-admin/sectors", label: "Sectors", icon: FolderOpen },
    { href: "/platform-admin/learning-paths", label: "Learning Paths", icon: Route },
    { href: "/platform-admin/courses", label: "Courses", icon: BookOpen },
    { href: "/platform-admin/sdg-mapping", label: "SDG Mapping", icon: Target },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-primary mb-1">Platform Admin Portal</p>
          <h1 className="text-3xl font-bold font-serif">EcoLearn Administrator</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Side Nav */}
          <aside className="space-y-1">
            {sidebarLinks.map((link) => {
              const active = location === link.href || (link.href !== "/platform-admin" && location.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <link.icon className="h-4 w-4 shrink-0" />
                  {link.label}
                </Link>
              );
            })}
          </aside>

          {/* Main Content */}
          <main className="md:col-span-3 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </Layout>
  );
}
