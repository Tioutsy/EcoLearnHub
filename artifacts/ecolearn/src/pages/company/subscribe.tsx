import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Building2, ShieldCheck, CheckCircle2, ArrowLeft, Loader2, Sparkles, Award } from "lucide-react";
import { customFetch } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface PublicPlansResponse {
  plans: Array<{ id: number; code: string; name: string; description: string; tagline: string | null }>;
  employeeBands: Array<{ id: number; code: string; label: string; minimumEmployees: number; maximumEmployees: number | null; requiresTailoredQuote: boolean }>;
  prices: Array<{ planCode: string; bandCode: string; monthlyAmountMUR: number | null; requiresTailoredQuote: boolean }>;
}

export default function Subscribe() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const urlParams = new URLSearchParams(window.location.search);
  const initialPlanCode = urlParams.get("planCode") || "PROFESSIONAL";
  const initialBandCode = urlParams.get("bandCode") || "UP_TO_25";
  const initialInterval = (urlParams.get("billingInterval") || "MONTHLY").toUpperCase() === "YEARLY" ? "YEARLY" : "MONTHLY";

  const [selectedPlanCode, setSelectedPlanCode] = useState<string>(initialPlanCode);
  const [selectedBandCode, setSelectedBandCode] = useState<string>(initialBandCode);
  const [billingInterval, setBillingInterval] = useState<"MONTHLY" | "YEARLY">(initialInterval);
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");

  const [pricingData, setPricingData] = useState<PublicPlansResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    customFetch<PublicPlansResponse>("/api/subscriptions/public-plans")
      .then((res) => {
        if (res) setPricingData(res);
      })
      .catch(() => {});
  }, []);

  const activePlan = pricingData?.plans.find(p => p.code === selectedPlanCode) || {
    code: selectedPlanCode,
    name: selectedPlanCode === "ESSENTIAL" ? "Essential" : selectedPlanCode === "COMPLETE" ? "Complete" : "Professional",
    description: "Sustainability corporate learning package",
    tagline: null,
  };

  const activeBand = pricingData?.employeeBands.find(b => b.code === selectedBandCode) || {
    code: selectedBandCode,
    label: selectedBandCode === "UP_TO_25" ? "Up to 25 employees" : "Corporate team",
    requiresTailoredQuote: selectedBandCode === "OVER_120",
  };

  const priceRecord = pricingData?.prices.find(p => p.planCode === selectedPlanCode && p.bandCode === selectedBandCode);
  const isTailored = activeBand.requiresTailoredQuote || (priceRecord?.requiresTailoredQuote ?? selectedBandCode === "OVER_120");
  const baseMonthlyMUR = priceRecord?.monthlyAmountMUR || (selectedBandCode === "UP_TO_25" ? 3000 : 4500);

  const yearlyUndiscounted = baseMonthlyMUR * 12;
  const yearlySavingsMUR = Math.round(yearlyUndiscounted * 0.10);
  const yearlyFinalMUR = yearlyUndiscounted - yearlySavingsMUR;
  const yearlyEquivalentMonthlyMUR = Math.round((yearlyFinalMUR / 12) * 100) / 100;

  const handleSubscribeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      toast({
        title: "Company name required",
        description: "Please enter your organization's name to set up your subscription.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await customFetch<{ message: string }>("/api/subscriptions/onboard", {
        method: "POST",
        body: JSON.stringify({
          planCode: selectedPlanCode,
          employeeBandCode: selectedBandCode,
          billingInterval: billingInterval,
          companyName: companyName,
          industry: industry,
          employeeCount: activeBand.code === "UP_TO_25" ? 25 : 50,
        }),
      });

      setIsSuccess(true);
      setSuccessMessage(res?.message || "Your Elevio subscription request has been received.");
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions/company"] });

      toast({
        title: "Subscription Request Received",
        description: "Your selected plan, employee category, and billing interval have been registered.",
      });

      setTimeout(() => {
        setLocation("/company");
      }, 3500);
    } catch (err: any) {
      toast({
        title: "Subscription Request Failed",
        description: err.message || "An error occurred while submitting your subscription request.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] bg-background py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-8">
            <Link href="/pricing" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Pricing
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold font-serif text-foreground">
              Confirm Your Company Subscription
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Select your organization details to activate corporate sustainability learning access.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Form Section */}
            <div className="lg:col-span-7">
              {isSuccess ? (
                <Card className="border-emerald-500/30 bg-emerald-500/5 text-center p-8 backdrop-blur-md">
                  <CardHeader className="flex flex-col items-center">
                    <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600 mb-4 animate-pulse">
                      <Sparkles className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-foreground font-serif">
                      Subscription Request Received!
                    </CardTitle>
                    <CardDescription className="text-muted-foreground text-base max-w-md mt-2">
                      {successMessage}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center mt-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Opening your company dashboard...
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <form onSubmit={handleSubscribeSubmit}>
                  <Card className="shadow-sm border-border/80">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        Company & Organization Details
                      </CardTitle>
                      <CardDescription>
                        Set up your organization account for Elevio training tracking.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Organization / Company Name</Label>
                        <Input
                          id="companyName"
                          placeholder="e.g. Rogers Group Ltd"
                          required
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="industry">Industry Sector (Optional)</Label>
                        <Input
                          id="industry"
                          placeholder="e.g. Hospitality, Logistics, Financial Services"
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                        />
                      </div>

                      {/* Billing Interval Selection */}
                      <div className="space-y-2 pt-2 border-t">
                        <Label>Billing Frequency</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setBillingInterval("MONTHLY")}
                            className={`p-3 rounded-xl border text-sm font-semibold transition-all flex flex-col items-start ${
                              billingInterval === "MONTHLY"
                                ? "border-emerald-600 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                : "border-border text-muted-foreground hover:bg-muted/40"
                            }`}
                          >
                            <span>Monthly Billing</span>
                            <span className="text-[11px] font-normal opacity-80">Flexible monthly payments</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setBillingInterval("YEARLY")}
                            className={`p-3 rounded-xl border text-sm font-semibold transition-all flex flex-col items-start relative ${
                              billingInterval === "YEARLY"
                                ? "border-emerald-600 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                : "border-border text-muted-foreground hover:bg-muted/40"
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              Yearly Billing
                              <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded-md">Save 10%</span>
                            </span>
                            <span className="text-[11px] font-normal opacity-80">Paid once per year</span>
                          </button>
                        </div>
                      </div>

                      {/* Selected Plan Summary Bar */}
                      <div className="bg-muted/50 border rounded-xl p-4 space-y-2">
                        <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <span>Selected Commercial Plan</span>
                          <span className="text-primary">{activePlan.name}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <span>Employee Band</span>
                          <span className="text-foreground">{activeBand.label}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <span>Billing Interval</span>
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold">{billingInterval === "YEARLY" ? "Yearly (10% Off)" : "Monthly"}</span>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="flex-col gap-4 border-t pt-6 bg-muted/30">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground w-full">
                        <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>Corporate training records and company compliance metrics included.</span>
                      </div>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-12 text-md font-semibold bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center gap-2 rounded-xl shadow-md"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Submitting subscription request...
                          </>
                        ) : isTailored ? (
                          "Request Corporate Proposal"
                        ) : billingInterval === "YEARLY" ? (
                          `Confirm Subscription — MUR ${yearlyFinalMUR.toLocaleString()}/year`
                        ) : (
                          `Confirm Subscription — MUR ${baseMonthlyMUR.toLocaleString()}/mo`
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </form>
              )}
            </div>

            {/* Order Summary Section */}
            <div className="lg:col-span-5">
              <Card className="border-emerald-500/20 bg-emerald-500/5">
                <CardHeader>
                  <CardTitle className="text-xl font-serif">Subscription Summary</CardTitle>
                  <CardDescription>Review your selected access and pricing level.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex justify-between items-start pb-4 border-b">
                    <div>
                      <h3 className="font-bold text-lg text-foreground">{activePlan.name} Plan</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{activeBand.label}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-lg text-emerald-700 dark:text-emerald-400 block">
                        {!isTailored ? (
                          billingInterval === "YEARLY" ? `MUR ${yearlyFinalMUR.toLocaleString()}/year` : `MUR ${baseMonthlyMUR.toLocaleString()}/mo`
                        ) : "Tailored Quote"}
                      </span>
                      {!isTailored && billingInterval === "YEARLY" && (
                        <div className="space-y-0.5 text-right mt-1">
                          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold block">
                            Save MUR {yearlySavingsMUR.toLocaleString()} per year
                          </span>
                          <span className="text-[10px] text-muted-foreground block">
                            Equivalent to MUR {yearlyEquivalentMonthlyMUR.toLocaleString()}/month
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Included Learning Access</p>
                    <ul className="space-y-2 text-xs text-muted-foreground">
                      <li className="flex gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>ELH-01 to ELH-12 Core Sustainability Certificate</span>
                      </li>
                      {(selectedPlanCode === "PROFESSIONAL" || selectedPlanCode === "COMPLETE") && (
                        <>
                          <li className="flex gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>Sustainability in Action courses (ELH-13 to ELH-23)</span>
                          </li>
                          <li className="flex gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>Departmental courses (HR, Finance, Ops, Facilities, Sales)</span>
                          </li>
                        </>
                      )}
                      {selectedPlanCode === "COMPLETE" && (
                        <li className="flex gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>Leadership courses & advanced organisational reporting</span>
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="pt-4 border-t space-y-2 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>{billingInterval === "YEARLY" ? "Yearly Subscription" : "Monthly Subscription"}</span>
                      <span className="font-semibold text-foreground">
                        {!isTailored ? (billingInterval === "YEARLY" ? `MUR ${yearlyFinalMUR.toLocaleString()}` : `MUR ${baseMonthlyMUR.toLocaleString()}`) : "Tailored"}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Currency</span>
                      <span className="font-semibold text-foreground">MUR (Mauritian Rupee)</span>
                    </div>
                    <div className="flex justify-between pt-4 border-t text-base font-bold text-foreground">
                      <span>{billingInterval === "YEARLY" ? "Yearly Total" : "Monthly Total"}</span>
                      <span className="text-emerald-700 dark:text-emerald-400">
                        {!isTailored ? (billingInterval === "YEARLY" ? `MUR ${yearlyFinalMUR.toLocaleString()}/year` : `MUR ${baseMonthlyMUR.toLocaleString()}/mo`) : "Tailored Quote"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
