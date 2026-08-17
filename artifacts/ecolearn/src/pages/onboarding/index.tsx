import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { customFetch } from "@workspace/api-client-react";
import { useAuth, useUser } from "@clerk/react";
import {
  Building2,
  Users,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  BookOpen,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Clock,
} from "lucide-react";

export default function OnboardingPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const [, setLocation] = useLocation();

  const [step, setStep] = useState<number>(1);
  const [companyName, setCompanyName] = useState<string>("");
  const [employeeCount, setEmployeeCount] = useState<number>(15);
  const [selectedBandCode, setSelectedBandCode] = useState<string>("UP_TO_25");
  const [selectedPlanCode, setSelectedPlanCode] = useState<string>("ESSENTIAL");

  const [adminName, setAdminName] = useState<string>("");
  const [starterCourseCode, setStarterCourseCode] = useState<string>("ELH-01");
  const [billingInterval, setBillingInterval] = useState<"MONTHLY" | "YEARLY">("MONTHLY");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (user) {
      setAdminName(user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Company Administrator");
    }
  }, [user]);

  // Update band code based on employee count automatically
  useEffect(() => {
    if (employeeCount <= 25) setSelectedBandCode("UP_TO_25");
    else if (employeeCount <= 50) setSelectedBandCode("FROM_26_TO_50");
    else if (employeeCount <= 80) setSelectedBandCode("FROM_51_TO_80");
    else if (employeeCount <= 120) setSelectedBandCode("FROM_81_TO_120");
    else setSelectedBandCode("OVER_120");
  }, [employeeCount]);

  const getBandPrice = (code: string, interval: "MONTHLY" | "YEARLY" = billingInterval) => {
    let baseMonthly = 3000;
    let range = "1–25 employees";

    switch (code) {
      case "UP_TO_25":
        baseMonthly = 3000;
        range = "1–25 employees";
        break;
      case "FROM_26_TO_50":
        baseMonthly = 4500;
        range = "26–50 employees";
        break;
      case "FROM_51_TO_80":
        baseMonthly = 5000;
        range = "51–80 employees";
        break;
      case "FROM_81_TO_120":
        baseMonthly = 6250;
        range = "81–120 employees";
        break;
      case "OVER_120":
        return { price: "Tailored Quote", period: "", range: "120+ employees", savings: "" };
      default:
        baseMonthly = 3000;
        range = "1–25 employees";
    }

    if (interval === "YEARLY") {
      const yearlyTotal = baseMonthly * 12;
      const savings = Math.round(yearlyTotal * 0.10);
      const finalYearly = yearlyTotal - savings;
      const eqMonthly = Math.round((finalYearly / 12) * 100) / 100;

      return {
        price: `MUR ${finalYearly.toLocaleString()}`,
        period: "/ year (Billed yearly)",
        range,
        savings: `Save MUR ${savings.toLocaleString()} per year · Eq. MUR ${eqMonthly.toLocaleString()}/mo`,
      };
    }

    return {
      price: `MUR ${baseMonthly.toLocaleString()}`,
      period: "/ month",
      range,
      savings: "",
    };
  };

  const handleNextStep = () => {
    setErrorMessage(null);
    if (step === 1) {
      if (!companyName.trim()) {
        setErrorMessage("Please enter your company name.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (selectedBandCode === "OVER_120" || employeeCount > 120) {
        setStep(2.5); // Tailored contact step
        return;
      }
      setStep(3);
    } else if (step === 3) {
      handleCompleteCompanyOnboarding();
    }
  };

  const handleCompleteCompanyOnboarding = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await customFetch<any>("/api/onboarding/company", {
        method: "POST",
        body: JSON.stringify({
          companyName: companyName.trim(),
          adminName: adminName.trim() || "Company Admin",
          employeeCount,
          employeeBandCode: selectedBandCode,
          planCode: selectedPlanCode,
          billingInterval,
        }),
      });

      setResult(res);
      if (res.outcome === "tailored_contact_required") {
        setStep(2.5);
      } else {
        setStep(4);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create company workspace. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignStarterTraining = async () => {
    setIsLoading(true);
    try {
      await customFetch<any>("/api/onboarding/first-training", {
        method: "POST",
        body: JSON.stringify({
          courseCode: starterCourseCode,
          dueDateDays: 30,
        }),
      });
      setStep(5);
    } catch (err: any) {
      // Proceed to step 5 even if training assignment skipped or already present
      setStep(5);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoaded && !isSignedIn) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center max-w-md">
          <Building2 className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold font-serif mb-2">Sign in to Onboard Your Company</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Please sign in to your ELEVIO account to set up your corporate workspace.
          </p>
          <Button asChild size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700">
            <Link href="/sign-in">Sign In to Continue</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const bandInfo = getBandPrice(selectedBandCode);

  return (
    <Layout>
      <div className="bg-gradient-to-r from-emerald-950/10 via-teal-900/5 to-background py-8 border-b">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
            <Sparkles className="h-4 w-4" /> Autonomous Company Activation
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-serif tracking-tight">
            Activate Your ELEVIO SKILLS Workspace
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Empower your workforce with Mauritius-tailored ESG & Sustainability training in under 2 minutes.
          </p>

          {/* Step Progress Bar */}
          <div className="flex items-center gap-2 mt-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-all ${
                  step >= i ? "bg-emerald-600" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 flex items-center gap-3 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Your Organisation */}
        {step === 1 && (
          <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-600">Step 1 of 5</span>
              <h2 className="text-xl font-bold font-serif mt-1">Tell us about your organisation</h2>
              <p className="text-muted-foreground text-sm">Set up your company profile for workspace training access.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="font-semibold">Company / Organisation Name *</Label>
                <Input
                  id="companyName"
                  placeholder="e.g. EcoLearn Mauritius Ltd"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeCount" className="font-semibold">Number of Employees in Organisation</Label>
                <Input
                  id="employeeCount"
                  type="number"
                  min={1}
                  max={500}
                  value={employeeCount}
                  onChange={(e) => setEmployeeCount(parseInt(e.target.value, 10) || 1)}
                  className="rounded-xl h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Used to automatically select your transparent pricing tier.
                </p>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button onClick={handleNextStep} size="lg" className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                <span>Continue to Subscription Tier</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Your Plan & Pricing */}
        {step === 2 && (
          <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-600">Step 2 of 5</span>
              <h2 className="text-xl font-bold font-serif mt-1">Review transparent subscription pricing</h2>
              <p className="text-muted-foreground text-sm">Derived server-side from your organisation size.</p>
            </div>

            {/* Billing Interval Toggle */}
            <div className="space-y-2">
              <Label className="font-semibold text-xs uppercase tracking-wider">Billing Interval</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setBillingInterval("MONTHLY")}
                  className={`p-3 rounded-xl border text-sm font-semibold transition-all text-center ${
                    billingInterval === "MONTHLY"
                      ? "border-emerald-600 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      : "border-border text-muted-foreground hover:bg-muted/40"
                  }`}
                >
                  Monthly Billing
                </button>
                <button
                  type="button"
                  onClick={() => setBillingInterval("YEARLY")}
                  className={`p-3 rounded-xl border text-sm font-semibold transition-all text-center flex items-center justify-center gap-1.5 ${
                    billingInterval === "YEARLY"
                      ? "border-emerald-600 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      : "border-border text-muted-foreground hover:bg-muted/40"
                  }`}
                >
                  <span>Yearly Billing</span>
                  <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded-md">Save 10%</span>
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {billingInterval === "YEARLY"
                  ? "Pay yearly and save 10% on the equivalent 12-month total. One payment covers 12 months."
                  : "Choose monthly billing for standard monthly flexibility."}
              </p>
            </div>

            <div className="border rounded-xl p-5 bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-950/20 dark:to-transparent border-emerald-200 dark:border-emerald-800 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-300 font-mono text-xs">
                  {selectedBandCode}
                </Badge>
                <span className="text-xs font-medium text-muted-foreground">{bandInfo.range}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-serif text-emerald-700 dark:text-emerald-400">
                  {bandInfo.price}
                </span>
                <span className="text-sm text-muted-foreground">{bandInfo.period}</span>
              </div>
              {bandInfo.savings && (
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 block">
                  {bandInfo.savings}
                </span>
              )}
              <p className="text-xs text-muted-foreground">
                Includes full access to 34 interactive ESG courses, workplace micro-challenges, core certification, and company compliance tracking.
              </p>
            </div>

            <div className="space-y-3">
              <Label className="font-semibold">Select Employee Band</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { code: "UP_TO_25", label: "Up to 25 employees", price: "MUR 3,000/mo" },
                  { code: "FROM_26_TO_50", label: "26–50 employees", price: "MUR 4,500/mo" },
                  { code: "FROM_51_TO_80", label: "51–80 employees", price: "MUR 5,000/mo" },
                  { code: "FROM_81_TO_120", label: "81–120 employees", price: "MUR 6,250/mo" },
                  { code: "OVER_120", label: "120+ employees", price: "Tailored Quote" },
                ].map((b) => (
                  <button
                    key={b.code}
                    type="button"
                    onClick={() => {
                      setSelectedBandCode(b.code);
                      if (b.code === "UP_TO_25") setEmployeeCount(15);
                      else if (b.code === "FROM_26_TO_50") setEmployeeCount(35);
                      else if (b.code === "FROM_51_TO_80") setEmployeeCount(65);
                      else if (b.code === "FROM_81_TO_120") setEmployeeCount(100);
                      else setEmployeeCount(150);
                    }}
                    className={`p-3.5 rounded-xl border text-left text-sm transition-all flex justify-between items-center ${
                      selectedBandCode === b.code
                        ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 font-semibold"
                        : "hover:bg-muted/50 border-border"
                    }`}
                  >
                    <div>
                      <div className="font-medium">{b.label}</div>
                      <div className="text-xs text-muted-foreground">{b.price}</div>
                    </div>
                    {selectedBandCode === b.code && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <Button onClick={() => setStep(1)} variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button onClick={handleNextStep} size="lg" className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                <span>Continue to Administrator Setup</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2.5: Tailored Contact Path (>120 employees) */}
        {step === 2.5 && (
          <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm space-y-6 text-center">
            <div className="h-12 w-12 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-2">
              <HelpCircle className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold font-serif">Tailored Enterprise Quote Required</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Organisations with more than 120 employees receive custom multi-department deployment, dedicated account management, and tailored ESG reporting integrations.
            </p>
            <div className="p-4 bg-muted/40 rounded-xl text-xs text-left max-w-md mx-auto space-y-2 border">
              <div className="font-semibold text-foreground">Included in Enterprise Plans:</div>
              <div>• Custom SSO & HRIS integration</div>
              <div>• Custom sector-specific course modules</div>
              <div>• Dedicated Mauritius ESG Advisor</div>
            </div>
            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
              <Button onClick={() => setStep(2)} variant="outline">
                Back to Band Selection
              </Button>
              <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                <a href="mailto:contact@recyclean.life?subject=ELEVIO%20Enterprise%20Quote%20Request">
                  Contact Sales for Enterprise Quote
                </a>
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Administrator Linkage Confirmation */}
        {step === 3 && (
          <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-600">Step 3 of 5</span>
              <h2 className="text-xl font-bold font-serif mt-1">First Administrator Linkage</h2>
              <p className="text-muted-foreground text-sm">
                You will be explicitly registered as the primary Company Administrator in trusted server records.
              </p>
            </div>

            <div className="border rounded-xl p-5 space-y-3 bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">{companyName}</div>
                  <div className="text-xs text-muted-foreground">{employeeCount} Employees · Tier {selectedBandCode}</div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Label htmlFor="adminName" className="font-semibold text-xs">Administrator Display Name</Label>
                <Input
                  id="adminName"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="rounded-xl h-10 text-sm"
                />
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <div>✓ Grants complete access to `/company` management area</div>
              <div>✓ Allows inviting employees and managers</div>
              <div>✓ Enables assigning training and reviewing employee workplace action records</div>
            </div>

            <div className="pt-4 flex justify-between">
              <Button onClick={() => setStep(2)} variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                onClick={handleCompleteCompanyOnboarding}
                disabled={isLoading}
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 gap-2"
              >
                {isLoading ? (
                  <span>Activating Workspace...</span>
                ) : (
                  <>
                    <span>Confirm & Activate Company Workspace</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: Team Invitation (Optional) */}
        {step === 4 && (
          <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-600">Step 4 of 5</span>
              <h2 className="text-xl font-bold font-serif mt-1">Invite Your Team</h2>
              <p className="text-muted-foreground text-sm">
                Your workspace for <strong className="text-foreground">{companyName}</strong> is active! You can invite your team now or later from your Company Dashboard.
              </p>
            </div>

            <div className="border rounded-xl p-5 bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 text-sm space-y-2">
              <div className="flex items-center gap-2 font-semibold text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Workspace Created Successfully
              </div>
              <p className="text-xs text-muted-foreground">
                You are registered as company administrator. Employees invited will receive tenant-isolated access to assigned training.
              </p>
            </div>

            <div className="pt-4 flex justify-between items-center">
              <Button onClick={() => setStep(5)} variant="ghost" className="text-muted-foreground">
                Skip for now
              </Button>
              <Button onClick={handleAssignStarterTraining} size="lg" className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                <span>Continue to Starter Training</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 5: Starter Training Assignment (Optional) */}
        {step === 5 && (
          <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-600">Step 5 of 5</span>
              <h2 className="text-xl font-bold font-serif mt-1">Assign Starter Training</h2>
              <p className="text-muted-foreground text-sm">
                We recommend assigning <strong className="text-foreground">ELH-01: Sustainability Foundations</strong> as initial core training.
              </p>
            </div>

            <div className="border rounded-xl p-5 bg-muted/20 flex items-start gap-4">
              <div className="h-12 w-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center shrink-0">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 mb-1">
                  ELH-01 Core Module
                </Badge>
                <h3 className="font-bold text-base">Sustainability & ESG Foundations</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Essential ESG concepts tailored for Mauritian workplace workflows.
                </p>
              </div>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Your ELEVIO SKILLS workspace is ready.
              </div>
              <p>Employees can log in and begin learning immediately.</p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="flex-1 bg-emerald-600 hover:bg-emerald-700 gap-2">
                <Link href="/company">
                  <span>Open Company Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="flex-1 gap-2">
                <Link href="/courses">
                  <BookOpen className="h-4 w-4" />
                  <span>Explore Courses</span>
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
