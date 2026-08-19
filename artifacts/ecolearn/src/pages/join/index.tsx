import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useAuth, useUser, SignIn, SignUp } from "@clerk/react";
import { customFetch } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle2,
  AlertCircle,
  Building2,
  Key,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ValidatedInvitation {
  valid: boolean;
  companyId: number;
  companyName: string;
  logoUrl: string | null;
  email: string;
  firstName: string | null;
  lastName: string | null;
  department: string | null;
  intendedRole: string;
  expiresAt: string;
}

export default function JoinCompanyPage() {
  const [, setLocation] = useLocation();
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { user } = useUser();

  const [inputCode, setInputCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [invitation, setInvitation] = useState<ValidatedInvitation | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<"preview" | "signup" | "signin">("preview");
  const [acceptedSuccess, setAcceptedSuccess] = useState(false);

  // Extract query parameters (?token=... or ?code=... or ?invite=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token") || params.get("invite");
    const code = params.get("code");
    const secret = token || code;

    if (secret) {
      setInputCode(secret);
      handleValidate(secret);
    }
  }, []);

  // Validate the token or code against the server
  const handleValidate = async (secretToValidate?: string) => {
    const secret = (secretToValidate || inputCode).trim();
    if (!secret) {
      setErrorMessage("Please enter an invitation token or access code.");
      return;
    }

    setIsValidating(true);
    setErrorMessage(null);

    try {
      const isToken = !secret.startsWith("ELH-") && secret.length > 20;
      const payload = isToken ? { token: secret } : { code: secret };

      const res = await customFetch<ValidatedInvitation>("/api/employee-invitations/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setInvitation(res);
      setAuthMode("preview");
    } catch (err: any) {
      setInvitation(null);
      setErrorMessage(
        err?.message || "Invalid or expired invitation code. Please check with your administrator."
      );
    } finally {
      setIsValidating(false);
    }
  };

  // When signed in and invitation is verified, atomically accept the invitation
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !invitation || acceptedSuccess || isAccepting) return;

    const accept = async () => {
      setIsAccepting(true);
      setErrorMessage(null);
      try {
        const secret = inputCode.trim();
        const isToken = !secret.startsWith("ELH-") && secret.length > 20;
        const payload = isToken ? { token: secret } : { code: secret };

        await customFetch("/api/employee-invitations/accept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        setAcceptedSuccess(true);
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      } catch (err: any) {
        setErrorMessage(
          err?.message || "Failed to accept invitation. Please check that you are signed in with the invited email."
        );
      } finally {
        setIsAccepting(false);
      }
    };

    accept();
  }, [isLoaded, isSignedIn, invitation, inputCode, acceptedSuccess, isAccepting]);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-gradient-to-b from-primary/5 via-background to-muted/30 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Logo / Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
            <Building2 className="h-3.5 w-3.5" /> Corporate Training Portal
          </div>
          <h1 className="text-2xl font-bold font-serif text-foreground">Join Your Company</h1>
          <p className="text-sm text-muted-foreground">
            Activate your learning account with an invitation link or single-use access code.
          </p>
        </div>

        {/* Step 1: Code Entry & Validation Card */}
        {!invitation && (
          <Card className="shadow-sm border-border/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Key className="h-4 w-4 text-emerald-600" /> Enter Invitation Code
              </CardTitle>
              <CardDescription>
                Enter the access code (e.g. <code>ELH-ABCD-1234</code>) or paste your invitation link.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-1">
              <div className="space-y-2">
                <Input
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ELH-XXXX-XXXX"
                  className="font-mono text-base tracking-wider text-center"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleValidate();
                  }}
                />
              </div>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2 pt-0">
              <Button
                onClick={() => handleValidate()}
                disabled={isValidating || !inputCode.trim()}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Validating Code...
                  </>
                ) : (
                  <>
                    Validate & Join <ArrowRight className="h-4 w-4 ml-1.5" />
                  </>
                )}
              </Button>
              <div className="text-center text-xs text-muted-foreground mt-2">
                Need to register a new company instead?{" "}
                <Link href="/sign-up" className="text-primary underline hover:text-primary/80">
                  Administrator sign up
                </Link>
              </div>
            </CardFooter>
          </Card>
        )}

        {/* Step 2: Validated Invitation Preview & Action */}
        {invitation && !acceptedSuccess && (
          <Card className="shadow-md border-emerald-200 dark:border-emerald-800">
            <CardHeader className="bg-emerald-50/50 dark:bg-emerald-950/20 pb-4 border-b">
              <div className="flex items-center justify-between">
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 hover:bg-emerald-100 border-none text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Valid Invitation
                </Badge>
                <button
                  onClick={() => {
                    setInvitation(null);
                    setAuthMode("preview");
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  Change Code
                </button>
              </div>
              <CardTitle className="text-lg mt-2 text-foreground">
                Join {invitation.companyName}
              </CardTitle>
              <CardDescription className="text-xs">
                You have been invited to join the organisation's sustainability learning workspace.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
              <div className="p-3 rounded-lg border bg-card text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invited Email:</span>
                  <span className="font-semibold text-foreground">{invitation.email}</span>
                </div>
                {invitation.department && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Department:</span>
                    <span className="font-semibold text-foreground">{invitation.department}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assigned Role:</span>
                  <span className="font-semibold capitalize text-foreground">{invitation.intendedRole}</span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* If user is already signed in, show joining spinner / trigger */}
              {isSignedIn ? (
                <div className="text-center py-4 space-y-3">
                  <Loader2 className="h-8 w-8 text-emerald-600 animate-spin mx-auto" />
                  <p className="text-sm font-medium text-foreground">
                    Linking account for <strong>{user?.primaryEmailAddress?.emailAddress}</strong>…
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Please wait while your membership is activated.
                  </p>
                </div>
              ) : authMode === "preview" ? (
                <div className="space-y-2 pt-2">
                  <Button
                    onClick={() => setAuthMode("signup")}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white"
                  >
                    Create Account to Join
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setAuthMode("signin")}
                    className="w-full"
                  >
                    I already have an account (Sign In)
                  </Button>
                </div>
              ) : authMode === "signup" ? (
                <div className="pt-2">
                  <div className="text-xs text-muted-foreground mb-3 text-center">
                    Sign up with your work email (<strong>{invitation.email}</strong>):
                  </div>
                  <SignUp
                    routing="path"
                    path="/sign-up"
                    signInUrl="/sign-in"
                    forceRedirectUrl={`/join?code=${encodeURIComponent(inputCode)}`}
                  />
                </div>
              ) : (
                <div className="pt-2">
                  <div className="text-xs text-muted-foreground mb-3 text-center">
                    Sign in to link your account to {invitation.companyName}:
                  </div>
                  <SignIn
                    routing="path"
                    path="/sign-in"
                    signUpUrl="/sign-up"
                    forceRedirectUrl={`/join?code=${encodeURIComponent(inputCode)}`}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Acceptance Completed Success State */}
        {acceptedSuccess && (
          <Card className="shadow-md border-emerald-300 dark:border-emerald-800 text-center py-8">
            <CardContent className="space-y-4">
              <div className="h-14 w-14 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl text-emerald-900 dark:text-emerald-100">
                  Welcome to {invitation?.companyName || "Elevio Skills"}!
                </CardTitle>
                <CardDescription>
                  Your employee account is active. Redirecting to your learning dashboard…
                </CardDescription>
              </div>
              <Loader2 className="h-5 w-5 text-emerald-600 animate-spin mx-auto mt-4" />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
