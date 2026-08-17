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
  Sparkles,
  AlertCircle,
  Clock,
  FileText,
  CreditCard,
  PhoneCall,
  Loader2,
} from "lucide-react";
import { PlanCode } from "@/config/pricing";

interface OnboardingStatusResponse {
  stage: "NO_COMPANY" | "PLAN_REQUIRED" | "PAYMENT_PENDING" | "CUSTOM_QUOTE_REQUIRED" | "COMPLETED";
  hasCompany: boolean;
  role?: string;
  company?: {
    id: number;
    name: string;
    industry?: string;
    employeeCount?: number;
  };
  subscription?: {
    id: number;
    status: string;
    planCode: string;
    planName: string;
    bandCode: string;
    bandLabel: string;
    agreedMonthlyAmount: string;
    billingInterval: string;
    minEmployees: number;
    maxEmployees: number;
  };
  nextStepUrl: string;
}

const APPROVED_BANDS = [
  { code: "UP_TO_25", label: "Up to 25 employees", maxCount: 25, defaultCount: 15, monthlyPrice: 3000 },
  { code: "FROM_26_TO_50", label: "26–50 employees", maxCount: 50, defaultCount: 35, monthlyPrice: 4500 },
  { code: "FROM_51_TO_80", label: "51–80 employees", maxCount: 80, defaultCount: 65, monthlyPrice: 5000 },
  { code: "FROM_81_TO_120", label: "81–120 employees", maxCount: 120, defaultCount: 100, monthlyPrice: 6250 },
  { code: "OVER_120", label: "Over 120 employees", maxCount: null, defaultCount: 150, monthlyPrice: null, isQuote: true },
];

const APPROVED_PLANS = [
  {
    code: "ESSENTIAL" as PlanCode,
    name: "Essential ESG",
    tagline: "Foundational compliance & ESG readiness",
    features: [
      "Access to core ESG compliance modules",
      "Standard employee progress tracking",
      "Verifiable completion certificates",
      "Automated compliance audit reports",
    ],
  },
  {
    code: "PROFESSIONAL" as PlanCode,
    name: "Professional Growth",
    tagline: "Comprehensive learning & workplace action",
    badge: "Recommended",
    features: [
      "Complete 12-course sustainability library",
      "Workplace micro-action tracking & review",
      "Department-level compliance filters",
      "Automated manager reminder workflows",
      "Priority customer support",
    ],
  },
  {
    code: "COMPLETE" as PlanCode,
    name: "Complete Enterprise",
    tagline: "Full platform scale & bespoke alignment",
    features: [
      "All current & future ELEVIO SKILLS courses",
      "Executive ESG board scorecards & metrics",
      "Dedicated account success manager",
      "HRIS / SSO single-sign-on integration",
      "Custom challenge builder",
    ],
  },
];

export default function OnboardingPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const [, setLocation] = useLocation();

  // Local Form State
  const [step, setStep] = useState<number>(1);
  const [companyName, setCompanyName] = useState<string>("");
  const [industry, setIndustry] = useState<string>("");
  const [employeeCount, setEmployeeCount] = useState<number>(15);
  const [selectedBandCode, setSelectedBandCode] = useState<string>("UP_TO_25");
  const [selectedPlanCode, setSelectedPlanCode] = useState<PlanCode>("ESSENTIAL");
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);

  // Status & Async State
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<OnboardingStatusResponse | null>(null);

  // Load resumable onboarding state from server on mount
  useEffect(() => {
    async function loadStatus() {
      if (!isLoaded || !isSignedIn) {
        setIsInitializing(false);
        return;
      }

      try {
        const res = await customFetch<OnboardingStatusResponse>("/api/onboarding/status");
        setServerStatus(res);

        if (res.company?.name) {
          setCompanyName(res.company.name);
          if (res.company.industry) setIndustry(res.company.industry);
          if (res.company.employeeCount) setEmployeeCount(res.company.employeeCount);
        }

        if (res.subscription?.planCode) {
          setSelectedPlanCode(res.subscription.planCode as PlanCode);
        }
        if (res.subscription?.bandCode) {
          setSelectedBandCode(res.subscription.bandCode);
        }

        // Determine step from server-authoritative stage
        if (res.stage === "COMPLETED") {
          setLocation("/home");
        } else if (res.stage === "CUSTOM_QUOTE_REQUIRED") {
          setStep(4);
        } else if (res.stage === "PAYMENT_PENDING") {
          setStep(3);
        } else if (res.stage === "PLAN_REQUIRED") {
          setStep(2);
        } else {
          setStep(1);
        }
      } catch (err) {
        console.error("Failed to load onboarding status:", err);
      } finally {
        setIsInitializing(false);
      }
    }

    loadStatus();
  }, [isLoaded, isSignedIn, setLocation]);

  // Sync band code when employee count changes
  useEffect(() => {
    if (employeeCount <= 25) setSelectedBandCode("UP_TO_25");
    else if (employeeCount <= 50) setSelectedBandCode("FROM_26_TO_50");
    else if (employeeCount <= 80) setSelectedBandCode("FROM_51_TO_80");
    else if (employeeCount <= 120) setSelectedBandCode("FROM_81_TO_120");
    else setSelectedBandCode("OVER_120");
  }, [employeeCount]);

  const currentBand = APPROVED_BANDS.find((b) => b.code === selectedBandCode) || APPROVED_BANDS[0];
  const selectedPlan = APPROVED_PLANS.find((p) => p.code === selectedPlanCode) || APPROVED_PLANS[0];

  // STEP 1 Submission: Save Company Details
  const handleSaveCompanyDetails = async () => {
    if (!companyName.trim()) {
      setErrorMessage("Please enter your company or organisation name.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await customFetch("/api/onboarding/company-details", {
        method: "POST",
        body: JSON.stringify({
          companyName: companyName.trim(),
          industry: industry.trim() || undefined,
          employeeCount,
          adminName: user?.fullName || user?.firstName || "Company Administrator",
        }),
      });

      setStep(2);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save company details. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 2 Submission: Select Plan & Band
  const handleSelectPlanAndBand = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await customFetch<{ outcome: string; stage: string }>("/api/onboarding/select-plan", {
        method: "POST",
        body: JSON.stringify({
          planCode: selectedPlanCode,
          employeeBandCode: selectedBandCode,
          employeeCount,
          billingInterval: "MONTHLY",
        }),
      });

      if (res.outcome === "tailored_quote_required" || selectedBandCode === "OVER_120") {
        setStep(4);
      } else {
        setStep(3);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to select subscription plan. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 3 Submission: Confirm Order & Proceed
  const handleConfirmOrder = async () => {
    if (!agreedToTerms) {
      setErrorMessage("Please agree to the Terms of Service and Privacy Policy to proceed.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await customFetch("/api/onboarding/confirm-order", {
        method: "POST",
        body: JSON.stringify({ agreedToTerms: true }),
      });

      // Move to payment finalisation state
      setStep(5);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to confirm subscription order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoaded && !isSignedIn) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center max-w-md">
          <Building2 className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold font-serif mb-2">Sign in to Set Up Your Company</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Create your administrator account to set up your company, choose your plan and invite your team.
          </p>
          <Button asChild size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700">
            <Link href={`/sign-up?redirect_url=${encodeURIComponent("/onboarding")}`}>
              Get Started as Administrator
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  if (isInitializing) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
          <Loader2 className="h-8 w-8 text-emerald-600 animate-spin mb-4" />
          <p className="text-sm font-medium text-muted-foreground">Loading your company onboarding status...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        {/* Onboarding Progress Header */}
        <div className="mb-8 text-center space-y-2">
          <Badge variant="outline" className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-800 border-emerald-200">
            Company Administrator Setup
          </Badge>
          <h1 className="text-2xl md:text-3xl font-bold font-serif text-foreground">
            {step === 1 && "Set Up Your Company"}
            {step === 2 && "Choose Your Subscription Plan"}
            {step === 3 && "Review Order & Confirm Plan"}
            {step === 4 && "Tailored Enterprise Quote"}
            {step === 5 && "Subscription Order Placed"}
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            {step === 1 && "Enter your company details to create your secure corporate workspace."}
            {step === 2 && "Select the plan and employee tier tailored for your organisation."}
            {step === 3 && "Review the exact monthly price before proceeding."}
            {step === 4 && "Our team will reach out to tailor a custom plan for your organisation size."}
            {step === 5 && "Your subscription order has been recorded."}
          </p>

          {/* Progress Step Bar */}
          <div className="flex justify-center items-center gap-2 pt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  step === s
                    ? "w-10 bg-emerald-600"
                    : step > s
                    ? "w-5 bg-emerald-400 dark:bg-emerald-700"
                    : "w-5 bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-sm flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Company Profile */}
        {step === 1 && (
          <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="border-b pb-4">
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-600">Step 1 of 3</span>
              <h2 className="text-xl font-bold font-serif mt-1">Company Profile</h2>
              <p className="text-sm text-muted-foreground">Register your organisation details.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="font-semibold text-sm">
                  Company / Organisation Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="companyName"
                  placeholder="e.g. LUX Resorts & Hotels, Phoenix Beverages, MCB Group"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="rounded-xl h-11"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry" className="font-semibold text-sm">Industry / Sector</Label>
                  <Input
                    id="industry"
                    placeholder="e.g. Hospitality, Financial Services, Manufacturing"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="rounded-xl h-11"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employeeCount" className="font-semibold text-sm">Expected Number of Employees</Label>
                  <Input
                    id="employeeCount"
                    type="number"
                    min={1}
                    max={10000}
                    value={employeeCount}
                    onChange={(e) => setEmployeeCount(parseInt(e.target.value, 10) || 1)}
                    className="rounded-xl h-11"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                onClick={handleSaveCompanyDetails}
                disabled={isSubmitting || !companyName.trim()}
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 gap-2 min-w-[200px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Plan Selection</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Choose Plan & Employee Band */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Employee Band Selection */}
            <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm space-y-5">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-emerald-600">Step 2 of 3</span>
                <h2 className="text-xl font-bold font-serif mt-1">Select Employee Band</h2>
                <p className="text-sm text-muted-foreground">
                  Pricing is calculated strictly per company, per month based on your team size.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {APPROVED_BANDS.map((band) => (
                  <button
                    key={band.code}
                    type="button"
                    onClick={() => {
                      setSelectedBandCode(band.code);
                      setEmployeeCount(band.defaultCount);
                    }}
                    className={`p-4 rounded-xl border text-left transition-all relative ${
                      selectedBandCode === band.code
                        ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-600/20"
                        : "hover:bg-muted/40 border-border"
                    }`}
                  >
                    <div className="font-semibold text-sm">{band.label}</div>
                    <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                      {band.monthlyPrice ? `MUR ${band.monthlyPrice.toLocaleString()}/mo` : "Contact us"}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">Per company, per month</div>
                    {selectedBandCode === band.code && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 absolute top-3 right-3" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Plan Packages */}
            <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm space-y-5">
              <div>
                <h2 className="text-xl font-bold font-serif">Select Package</h2>
                <p className="text-sm text-muted-foreground">Choose the curriculum depth for your team.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {APPROVED_PLANS.map((plan) => {
                  const isSelected = selectedPlanCode === plan.code;
                  return (
                    <div
                      key={plan.code}
                      onClick={() => setSelectedPlanCode(plan.code)}
                      className={`cursor-pointer border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-md ring-2 ring-emerald-600/20"
                          : "hover:bg-muted/30 border-border"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-base">{plan.name}</h3>
                          {plan.badge && (
                            <Badge className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.5">
                              {plan.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-4">{plan.tagline}</p>
                        <ul className="space-y-2 text-xs text-muted-foreground">
                          {plan.features.map((f, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-5 mt-4 border-t">
                        <Button
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          className={`w-full text-xs font-semibold ${isSelected ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}
                        >
                          {isSelected ? "Selected" : "Select Plan"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Calculated Monthly Price Banner */}
            <div className="border rounded-2xl p-5 bg-gradient-to-br from-emerald-50/70 to-emerald-100/30 dark:from-emerald-950/40 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  {selectedPlan.name} · {currentBand.label}
                </div>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-2xl md:text-3xl font-bold font-serif text-emerald-900 dark:text-emerald-200">
                    {currentBand.monthlyPrice ? `MUR ${currentBand.monthlyPrice.toLocaleString()}` : "Tailored Quote"}
                  </span>
                  {currentBand.monthlyPrice && (
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">/ month (per company)</span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <Button onClick={() => setStep(1)} variant="outline" className="flex-1 sm:flex-initial gap-1.5">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button
                  onClick={handleSelectPlanAndBand}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 gap-1.5"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <span>{currentBand.isQuote ? "Request Quote" : "Review Order"}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Review Order Summary */}
        {step === 3 && (
          <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="border-b pb-4">
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-600">Step 3 of 3</span>
              <h2 className="text-xl font-bold font-serif mt-1">Order Summary & Confirmation</h2>
              <p className="text-sm text-muted-foreground">
                Review your subscription details before continuing to payment.
              </p>
            </div>

            {/* Breakdown Table */}
            <div className="border rounded-xl divide-y bg-muted/20">
              <div className="p-4 flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Company Name</span>
                <span className="font-semibold text-foreground">{companyName}</span>
              </div>
              <div className="p-4 flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Selected Package</span>
                <span className="font-semibold text-foreground">{selectedPlan.name}</span>
              </div>
              <div className="p-4 flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Employee Band</span>
                <span className="font-semibold text-foreground">{currentBand.label}</span>
              </div>
              <div className="p-4 flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Billing Frequency</span>
                <span className="font-semibold text-foreground">Monthly Billing</span>
              </div>
              <div className="p-4 flex justify-between items-center text-sm bg-emerald-50/50 dark:bg-emerald-950/30">
                <span className="font-bold text-foreground">Monthly Total</span>
                <span className="text-lg font-bold font-serif text-emerald-700 dark:text-emerald-300">
                  MUR {currentBand.monthlyPrice?.toLocaleString() || "0"} / month
                </span>
              </div>
            </div>

            {/* Terms Agreement Checkbox */}
            <div className="p-4 rounded-xl border bg-muted/10 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span>
                  I confirm the company subscription details above and agree to the{" "}
                  <Link href="/terms" target="_blank" className="text-emerald-600 underline font-medium">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" target="_blank" className="text-emerald-600 underline font-medium">
                    Privacy Policy
                  </Link>.
                </span>
              </label>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <Button onClick={() => setStep(2)} variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Plans
              </Button>
              <Button
                onClick={handleConfirmOrder}
                disabled={isSubmitting || !agreedToTerms}
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 gap-2 min-w-[200px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Confirming Order...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    <span>Continue to Payment</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: Tailored Quote Confirmation (> 120 Employees) */}
        {step === 4 && (
          <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm space-y-6 text-center">
            <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto">
              <PhoneCall className="h-7 w-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-serif text-foreground">Tailored Enterprise Quote Requested</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Thank you for selecting ELEVIO SKILLS for <strong className="text-foreground">{companyName}</strong>. Because your organisation has more than 120 employees, an enterprise specialist will contact you with a bespoke volume package.
              </p>
            </div>

            <div className="border rounded-xl p-4 bg-muted/20 text-xs text-muted-foreground max-w-md mx-auto space-y-1 text-left">
              <div>• <strong>Company:</strong> {companyName}</div>
              <div>• <strong>Selected Plan:</strong> {selectedPlan.name}</div>
              <div>• <strong>Headcount:</strong> Over 120 employees</div>
              <div>• <strong>Status:</strong> Under Enterprise Review</div>
            </div>

            <div className="pt-4 flex justify-center gap-3">
              <Button asChild variant="outline">
                <Link href="/courses">Explore Course Catalog</Link>
              </Button>
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          </div>
        )}

        {/* STEP 5: Payment Finalising State */}
        {step === 5 && (
          <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm space-y-6 text-center">
            <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto">
              <Clock className="h-7 w-7" />
            </div>

            <div className="space-y-2">
              <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 text-xs font-semibold">
                Order Recorded · Payment Pending
              </Badge>
              <h2 className="text-2xl font-bold font-serif text-foreground">Online Payment is Being Finalised</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Your subscription order for <strong className="text-foreground">{companyName}</strong> (MUR {currentBand.monthlyPrice?.toLocaleString()}/month) has been securely recorded in our server records.
              </p>
            </div>

            <div className="border rounded-xl p-5 bg-muted/20 text-left max-w-md mx-auto space-y-2 text-xs">
              <div className="font-semibold text-foreground">Next Steps:</div>
              <div className="text-muted-foreground">• Our billing department will verify commercial activation and send the invoice.</div>
              <div className="text-muted-foreground">• Once confirmed, your full company administrator dashboard will activate automatically.</div>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <Button asChild variant="outline">
                <Link href="/pricing">View All Plans</Link>
              </Button>
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                <Link href="/">Back to Homepage</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
