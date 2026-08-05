import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth, useUser, UserButton } from "@clerk/react";
import { Menu, X, Leaf, BookOpen, BarChart3, Building2, UserCircle, Route as RouteIcon, Target, MapPin, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { isPlatformAdmin, isCompanyAdmin } from "@/lib/authHelpers";
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
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Leaf className="h-5 w-5" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-bold tracking-tight text-foreground font-serif">Elevio</span>
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 tracking-wide uppercase">by Recyclean</span>
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
              <UserButton />
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
