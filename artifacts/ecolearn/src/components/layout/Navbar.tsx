import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth, useUser, UserButton } from "@clerk/react";
import {
  Menu,
  X,
  Leaf,
  BookOpen,
  Building2,
  UserCircle,
  Route as RouteIcon,
  Target,
  MapPin,
  ShieldCheck,
  Home as HomeIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isPlatformAdmin, isCompanyAdmin, getUserRoleLabel } from "@/lib/authHelpers";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/LanguageContext";

export function Navbar() {
  const [location] = useLocation();
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const { t } = useLanguage();
  const showSuperAdminLink = user?.publicMetadata?.role === "super_admin";
  const showPlatformAdminLink = isPlatformAdmin(user);
  const showReviewLink = isCompanyAdmin(user) || isPlatformAdmin(user);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const displayedLinks = isSignedIn
    ? [
        { href: "/home", label: t("nav.home") || "Home", icon: HomeIcon },
        { href: "/dashboard", label: t("nav.my_learning"), icon: UserCircle },
        { href: "/courses", label: t("nav.courses"), icon: BookOpen },
        { href: "/challenges", label: t("nav.challenges"), icon: Target },
        { href: "/company", label: t("nav.company"), icon: Building2 },
        ...(showReviewLink
          ? [{ href: "/company/challenges-review", label: t("nav.employee_reviews"), icon: ShieldCheck }]
          : []),
        ...(showSuperAdminLink
          ? [{ href: "/admin", label: t("nav.admin"), icon: ShieldCheck }]
          : []),
        ...(showPlatformAdminLink
          ? [{ href: "/platform-admin", label: t("nav.platform_admin"), icon: ShieldCheck }]
          : []),
      ]
    : [
        { href: "/courses", label: t("nav.courses"), icon: BookOpen },
        { href: "/challenges", label: t("nav.challenges"), icon: Target },
        { href: "/pricing", label: t("nav.pricing"), icon: Building2 },
      ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link
            href={isLoaded && isSignedIn ? "/home" : "/"}
            aria-label="Go to ELEVIO SKILLS Home"
            className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-lg p-0.5"
          >
            {/* Green Leaf Badge Logo */}
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm transition-transform group-hover:scale-105">
              <Leaf className="h-5 w-5" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg font-bold tracking-wider text-emerald-950 dark:text-emerald-50 font-serif uppercase">
                ELEVIO SKILLS
              </span>
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 tracking-tight mt-0.5">
                By Recyclean
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex md:items-center md:gap-4 lg:gap-6">
          <div className="flex items-center gap-4 lg:gap-6 text-sm font-medium">
            {displayedLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "transition-colors hover:text-primary flex items-center gap-1.5",
                  location === link.href ? "text-primary font-semibold" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 border-l pl-4 ml-2">
            {isSignedIn ? (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="hidden sm:inline-flex text-xs bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
                  {getUserRoleLabel(user)}
                </Badge>
                <UserButton userProfileMode="modal" />
              </div>
            ) : (
              <>
                <Button variant="ghost" asChild className="hidden lg:flex">
                  <Link href="/sign-in">{t("nav.sign_in")}</Link>
                </Button>
                <Button asChild>
                  <Link href="/sign-up">{t("nav.get_started")}</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="flex items-center justify-center p-2 md:hidden text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background px-4 py-4">
          <div className="flex flex-col space-y-4">
            {displayedLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium p-2 rounded-md",
                  location === link.href ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}

            <div className="pt-4 border-t flex flex-col gap-3">
              {isSignedIn ? (
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border">
                  <div className="flex items-center gap-2.5">
                    <UserButton userProfileMode="modal" />
                    <Link
                      href="/profile"
                      className="text-sm font-medium hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Account Settings
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <Button variant="outline" asChild className="w-full justify-start">
                    <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>{t("nav.sign_in")}</Link>
                  </Button>
                  <Button asChild className="w-full justify-start">
                    <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>{t("nav.get_started")}</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
