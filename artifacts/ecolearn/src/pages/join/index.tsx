import { useState, useEffect, useCallback } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2,
  AlertCircle,
  Building2,
  Key,
  ArrowRight,
  User,
  Briefcase,
  Loader2,
  UserCheck,
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

interface EmployeeOnboardingProfile {
  employeeId: number;
  companyId: number;
  companyName: string;
  firstName: string;
  surname: string;
  email: string;
  departmentId: number | null;
  departmentName: string | null;
  jobTitleId: number | null;
  jobTitleName: string | null;
  profileCompleted: boolean;
  activeDepartments: { id: number; name: string }[];
  activeJobTitles: { id: number; name: string }[];
  isConfigurationMissing: boolean;
  configurationWarning?: string | null;
}

type FlowStep = "code-entry" | "auth" | "accepting" | "complete-profile" | "done";

export default function JoinCompanyPage() {
  const [, setLocation] = useLocation();
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { user } = useUser();

  const [inputCode, setInputCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [invitation, setInvitation] = useState<ValidatedInvitation | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<"preview" | "signup" | "signin">("preview");
  const [flowStep, setFlowStep] = useState<FlowStep>("code-entry");

  // Profile completion state
  const [profile, setProfile] = useState<EmployeeOnboardingProfile | null>(null);
  const [profileFirstName, setProfileFirstName] = useState("");
  const [profileSurname, setProfileSurname] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");
  const [selectedTitleId, setSelectedTitleId] = useState<string>("");

  // Extract query params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token") || params.get("invite");
    const code = params.get("code");
    const step = params.get("step");
    const secret = token || code;

    if (step === "profile") {
      setFlowStep("complete-profile");
      return;
    }

    if (secret) {
      setInputCode(secret);
      handleValidate(secret);
    }
  }, []);

  // When in profile step, load the profile from the server
  useEffect(() => {
    if (flowStep === "complete-profile" && isLoaded && isSignedIn && !profile) {
      loadProfile();
    }
  }, [flowStep, isLoaded, isSignedIn, profile]);

  const loadProfile = async () => {
    try {
      const data = await customFetch<EmployeeOnboardingProfile>("/api/onboarding/employee-profile", {
        method: "GET",
      });
      setProfile(data);
      setProfileFirstName(data.firstName || "");
      setProfileSurname(data.surname || "");
      if (data.departmentId) setSelectedDeptId(String(data.departmentId));
      if (data.jobTitleId) setSelectedTitleId(String(data.jobTitleId));
      // If already completed, redirect now
      if (data.profileCompleted) {
        window.location.href = "/internal-home";
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Could not load your profile. Please try refreshing.");
    }
  };

  const handleValidate = useCallback(async (secretToValidate?: string) => {
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
      setFlowStep("auth");
    } catch (err: any) {
      setInvitation(null);
      setErrorMessage(
        err?.message || "Invalid or expired invitation code. Please check with your administrator."
      );
    } finally {
      setIsValidating(false);
    }
  }, [inputCode]);

  // When signed in and invitation verified, accept invitation
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !invitation || flowStep !== "auth" || isAccepting) return;

    const accept = async () => {
      setIsAccepting(true);
      setFlowStep("accepting");
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

        // Now check if profile needs completion
        const profileData = await customFetch<EmployeeOnboardingProfile>(
          "/api/onboarding/employee-profile",
          { method: "GET" }
        );

        if (profileData.profileCompleted) {
          setFlowStep("done");
          setTimeout(() => { window.location.href = "/internal-home"; }, 1500);
        } else {
          setProfile(profileData);
          setProfileFirstName(profileData.firstName || invitation?.firstName || "");
          setProfileSurname(profileData.surname || invitation?.lastName || "");
          setFlowStep("complete-profile");
        }
      } catch (err: any) {
        setErrorMessage(
          err?.message || "Failed to accept invitation. Please ensure you are signed in with the invited email address."
        );
        setFlowStep("auth");
      } finally {
        setIsAccepting(false);
      }
    };

    accept();
  }, [isLoaded, isSignedIn, invitation, flowStep]);

  const handleSaveProfile = async () => {
    if (!profileFirstName.trim() || !profileSurname.trim()) {
      setErrorMessage("Please enter your first name and surname.");
      return;
    }
    if (!selectedDeptId) {
      setErrorMessage("Please select your department.");
      return;
    }
    if (!selectedTitleId) {
      setErrorMessage("Please select your job title.");
      return;
    }

    setIsSavingProfile(true);
    setErrorMessage(null);

    try {
      await customFetch("/api/onboarding/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: profileFirstName.trim(),
          surname: profileSurname.trim(),
          departmentId: Number(selectedDeptId),
          jobTitleId: Number(selectedTitleId),
        }),
      });

      setFlowStep("done");
      setTimeout(() => { window.location.href = "/internal-home"; }, 1500);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to save profile. Please try again.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-gradient-to-b from-emerald-50/60 via-background to-muted/30 dark:from-emerald-950/20 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Logo / Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
            <Building2 className="h-3.5 w-3.5" /> Corporate Learning Portal
          </div>
          <h1 className="text-2xl font-bold font-serif text-foreground">
            {flowStep === "complete-profile" ? "Complete Your Profile" : "Join Your Company"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {flowStep === "complete-profile"
              ? "Choose your department and job title to access your learning workspace."
              : "Activate your learning account with an invitation code."}
          </p>
        </div>

        {/* Step 1: Code Entry */}
        {flowStep === "code-entry" && (
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
              <Input
                id="invitation-code-input"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="e.g. ELH-XXXX-XXXX"
                className="font-mono text-base tracking-wider text-center"
                onKeyDown={(e) => { if (e.key === "Enter") handleValidate(); }}
              />
              {errorMessage && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2 pt-0">
              <Button
                id="validate-code-btn"
                onClick={() => handleValidate()}
                disabled={isValidating || !inputCode.trim()}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white"
              >
                {isValidating ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Validating...</>
                ) : (
                  <>Validate & Join <ArrowRight className="h-4 w-4 ml-1.5" /></>
                )}
              </Button>
              <div className="text-center text-xs text-muted-foreground mt-2">
                Registering a new company?{" "}
                <Link href="/sign-up" className="text-primary underline hover:text-primary/80">
                  Administrator sign up
                </Link>
              </div>
            </CardFooter>
          </Card>
        )}

        {/* Step 2: Auth + Invitation Preview */}
        {(flowStep === "auth") && invitation && (
          <Card className="shadow-md border-emerald-200 dark:border-emerald-800">
            <CardHeader className="bg-emerald-50/50 dark:bg-emerald-950/20 pb-4 border-b">
              <div className="flex items-center justify-between">
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 hover:bg-emerald-100 border-none text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Valid Invitation
                </Badge>
                <button
                  onClick={() => { setInvitation(null); setFlowStep("code-entry"); setErrorMessage(null); }}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  Change Code
                </button>
              </div>
              <CardTitle className="text-lg mt-2 text-foreground">Join {invitation.companyName}</CardTitle>
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

              {isSignedIn ? (
                <div className="text-center py-4 space-y-3">
                  <Loader2 className="h-8 w-8 text-emerald-600 animate-spin mx-auto" />
                  <p className="text-sm font-medium text-foreground">
                    Linking account for <strong>{user?.primaryEmailAddress?.emailAddress}</strong>…
                  </p>
                  <p className="text-xs text-muted-foreground">Please wait while your membership is activated.</p>
                </div>
              ) : authMode === "preview" ? (
                <div className="space-y-2 pt-2">
                  <Button
                    id="create-account-btn"
                    onClick={() => setAuthMode("signup")}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white"
                  >
                    Create Account to Join
                  </Button>
                  <Button variant="outline" onClick={() => setAuthMode("signin")} className="w-full">
                    I already have an account (Sign In)
                  </Button>
                </div>
              ) : authMode === "signup" ? (
                <div className="pt-2">
                  <div className="text-xs text-muted-foreground mb-3 text-center">
                    Sign up with your work email (<strong>{invitation.email}</strong>):
                  </div>
                  <SignUp
                    routing="hash"
                    forceRedirectUrl={`/join?code=${encodeURIComponent(inputCode)}`}
                  />
                </div>
              ) : (
                <div className="pt-2">
                  <div className="text-xs text-muted-foreground mb-3 text-center">
                    Sign in to link your account to {invitation.companyName}:
                  </div>
                  <SignIn
                    routing="hash"
                    forceRedirectUrl={`/join?code=${encodeURIComponent(inputCode)}`}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Accepting Spinner */}
        {flowStep === "accepting" && (
          <Card className="shadow-md border-border/80 text-center py-8">
            <CardContent className="space-y-4">
              <Loader2 className="h-10 w-10 text-emerald-600 animate-spin mx-auto" />
              <p className="text-sm font-medium text-foreground">Activating your membership…</p>
              <p className="text-xs text-muted-foreground">
                Creating your employee record and verifying access.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Profile Completion */}
        {flowStep === "complete-profile" && (
          <Card className="shadow-md border-emerald-200 dark:border-emerald-800">
            <CardHeader className="bg-emerald-50/50 dark:bg-emerald-950/20 border-b">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                  <UserCheck className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
                </div>
                <div>
                  <CardTitle className="text-base">Complete Your Profile</CardTitle>
                  <CardDescription className="text-xs">
                    Select your department and job title to access your training.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-5 space-y-4">
              {profile?.isConfigurationMissing && profile?.configurationWarning && (
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{profile.configurationWarning}</span>
                </div>
              )}

              {/* Email (read-only) */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Work Email (cannot be changed)</Label>
                <div className="px-3 py-2 rounded-md border bg-muted/60 text-sm font-medium text-foreground select-none">
                  {profile?.email || user?.primaryEmailAddress?.emailAddress || "—"}
                </div>
              </div>

              {/* First Name */}
              <div className="space-y-1">
                <Label htmlFor="profile-first-name" className="text-sm font-medium">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="profile-first-name"
                    value={profileFirstName}
                    onChange={(e) => setProfileFirstName(e.target.value)}
                    className="pl-9"
                    placeholder="Your first name"
                    autoComplete="given-name"
                  />
                </div>
              </div>

              {/* Surname */}
              <div className="space-y-1">
                <Label htmlFor="profile-surname" className="text-sm font-medium">
                  Surname <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="profile-surname"
                    value={profileSurname}
                    onChange={(e) => setProfileSurname(e.target.value)}
                    className="pl-9"
                    placeholder="Your surname"
                    autoComplete="family-name"
                  />
                </div>
              </div>

              {/* Department */}
              <div className="space-y-1">
                <Label htmlFor="profile-department" className="text-sm font-medium">
                  Department <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                  <Select value={selectedDeptId} onValueChange={setSelectedDeptId}>
                    <SelectTrigger id="profile-department" className="pl-9">
                      <SelectValue placeholder="Select your department…" />
                    </SelectTrigger>
                    <SelectContent>
                      {(profile?.activeDepartments || []).map((d) => (
                        <SelectItem key={d.id} value={String(d.id)}>
                          {d.name}
                        </SelectItem>
                      ))}
                      {(profile?.activeDepartments || []).length === 0 && (
                        <SelectItem value="__none__" disabled>
                          No departments configured yet
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Job Title */}
              <div className="space-y-1">
                <Label htmlFor="profile-job-title" className="text-sm font-medium">
                  Job Title <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                  <Select value={selectedTitleId} onValueChange={setSelectedTitleId}>
                    <SelectTrigger id="profile-job-title" className="pl-9">
                      <SelectValue placeholder="Select your job title…" />
                    </SelectTrigger>
                    <SelectContent>
                      {(profile?.activeJobTitles || []).map((t) => (
                        <SelectItem key={t.id} value={String(t.id)}>
                          {t.name}
                        </SelectItem>
                      ))}
                      {(profile?.activeJobTitles || []).length === 0 && (
                        <SelectItem value="__none__" disabled>
                          No job titles configured yet
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </CardContent>

            <CardFooter className="border-t pt-4">
              <Button
                id="complete-profile-btn"
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white"
                onClick={handleSaveProfile}
                disabled={
                  isSavingProfile ||
                  !profileFirstName.trim() ||
                  !profileSurname.trim() ||
                  !selectedDeptId ||
                  !selectedTitleId ||
                  profile?.isConfigurationMissing
                }
              >
                {isSavingProfile ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving Profile…</>
                ) : (
                  <>Save & Access My Training <ArrowRight className="h-4 w-4 ml-1.5" /></>
                )}
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Final: Done / Redirect */}
        {flowStep === "done" && (
          <Card className="shadow-md border-emerald-300 dark:border-emerald-800 text-center py-8">
            <CardContent className="space-y-4">
              <div className="h-14 w-14 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl text-emerald-900 dark:text-emerald-100">
                  Welcome to {invitation?.companyName || profile?.companyName || "ELEVIO Skills"}!
                </CardTitle>
                <CardDescription>
                  Your profile is complete. Redirecting to your learning workspace…
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
