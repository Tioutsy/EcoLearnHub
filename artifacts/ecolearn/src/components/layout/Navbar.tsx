import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth, useUser, UserButton } from "@clerk/react";
import { Menu, X, Leaf, BookOpen, BarChart3, Building2, UserCircle, Route as RouteIcon, Target, MapPin, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { isPlatformAdmin, isCompanyAdmin, getUserRoleLabel } from "@/lib/authHelpers";
import { Badge } from "@/components/ui/badge";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import { useLanguage } from "@/context/LanguageContext";

export function Navbar() {
  const [location] = useLocation();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { t } = useLanguage();
  const showSuperAdminLink = user?.publicMetadata?.role === "super_admin";
  const showPlatformAdminLink = isPlatformAdmin(user);
  const showReviewLink = isCompanyAdmin(user) || isPlatformAdmin(user);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/courses", label: t("nav.courses"), icon: BookOpen },
    { href: "/challenges", label: t("nav.challenges"), icon: Target },
    { href: "/mauritius-rules-resources", label: t("nav.mauritius_resources"), icon: Leaf },
    { href: "/impact", label: t("nav.impact"), icon: BarChart3 },
    { href: "/pricing", label: t("nav.pricing"), icon: Building2 },
  ];

  const authLinks = isSignedIn
    ? [
        { href: "/dashboard", label: t("nav.my_learning"), icon: UserCircle },
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
    : [];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-3 group">
            {/* Rising Arrow Leaf Badge */}
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/60 p-1 transition-transform group-hover:scale-105">
              <svg viewBox="0 0 100 100" className="h-7 w-7" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Bottom dark green leaf layer */}
                <path d="M15 65 C 25 50, 45 42, 60 40 C 50 60, 35 72, 15 65 Z" fill="#15803D" />
                {/* Middle medium green leaf layer */}
                <path d="M22 55 C 32 38, 55 30, 72 26 C 60 50, 42 62, 22 55 Z" fill="#22C55E" />
                {/* Top vibrant green rising arrow leaf */}
                <path d="M30 45 C 42 25, 68 12, 85 10 L 78 30 C 65 32, 48 42, 30 45 Z" fill="#4ADE80" />
                <path d="M58 22 L 85 10 L 72 34 Z" fill="#16A34A" />
              </svg>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg font-extrabold tracking-wider text-emerald-950 dark:text-emerald-50 font-sans uppercase">
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
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "transition-colors hover:text-primary flex items-center gap-1.5",
                  location === link.href ? "text-primary" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
            
            {authLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "transition-colors hover:text-primary flex items-center gap-1.5",
                  location === link.href ? "text-primary" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 border-l pl-4 ml-2">
            <LanguageSelector />
            {isSignedIn ? (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="hidden sm:inline-flex text-xs bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
                  {getUserRoleLabel(user)}
                </Badge>
                <UserButton />
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
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium p-2 rounded-md",
                  location === link.href ? "bg-primary/10 text-primary" : "text-muted-foreground"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
            
            {authLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium p-2 rounded-md",
                  location === link.href ? "bg-primary/10 text-primary" : "text-muted-foreground"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}

            <div className="pt-4 border-t flex flex-col gap-3">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Language / Langue</span>
                <LanguageSelector />
              </div>
              {isSignedIn ? (
                <div className="flex items-center gap-2 p-2">
                  <UserButton />
                  <span className="text-sm font-medium">Account Settings</span>
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
