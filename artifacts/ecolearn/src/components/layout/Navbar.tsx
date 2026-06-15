import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth, useUser, UserButton } from "@clerk/react";
import { Menu, X, Leaf, BookOpen, BarChart3, Building2, UserCircle, Route as RouteIcon, Target, MapPin, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [location] = useLocation();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const isSuperAdmin = user?.publicMetadata?.role === "super_admin";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/courses", label: "Courses", icon: BookOpen },
    { href: "/learning-paths", label: "Paths", icon: RouteIcon },
    { href: "/challenges", label: "Challenges", icon: Target },
    { href: "/made-for-mauritius", label: "Made for Mauritius", icon: MapPin },
    { href: "/impact", label: "Impact", icon: BarChart3 },
    { href: "/pricing", label: "Pricing", icon: Building2 },
    { href: "/blog", label: "Insights", icon: Leaf },
  ];

  const authLinks = isSignedIn
    ? [
        { href: "/dashboard", label: "My Learning", icon: UserCircle },
        { href: "/company", label: "Company", icon: Building2 },
        ...(isSuperAdmin
          ? [{ href: "/admin", label: "Admin", icon: ShieldCheck }]
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
            <span className="text-xl font-bold tracking-tight text-foreground font-serif">EcoLearn</span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex md:items-center md:gap-6">
          <div className="flex items-center gap-6 text-sm font-medium">
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

          <div className="flex items-center gap-4 border-l pl-6 ml-2">
            {isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <>
                <Button variant="ghost" asChild className="hidden lg:flex">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/sign-up">Get Started</Link>
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

            <div className="pt-4 border-t flex flex-col gap-2">
              {isSignedIn ? (
                <div className="flex items-center gap-2 p-2">
                  <UserButton afterSignOutUrl="/" />
                  <span className="text-sm font-medium">Account Settings</span>
                </div>
              ) : (
                <>
                  <Button variant="outline" asChild className="w-full justify-start">
                    <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                  </Button>
                  <Button asChild className="w-full justify-start">
                    <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
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