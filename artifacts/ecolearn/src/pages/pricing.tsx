import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  FileText,
  Sparkles,
  ShieldCheck,
  Check,
  X,
  HelpCircle,
  ArrowRight,
  Layers,
  Award,
  Users,
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@clerk/react";
import { useState, useEffect, useMemo } from "react";
import { customFetch } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import {
  PER_EMPLOYEE_COST_MAP,
  INDICATIVE_CALCULATION_NOTE,
  calculateYearlyPricing,
  calculateDynamicPricing,
  BASE_PRICING_121_250,
  ADDITIONAL_BLOCK_PRICE_MONTHLY,
} from "@/config/pricing";
import { useLanguage } from "@/context/LanguageContext";

interface PlanData {
  id: number;
  code: "ESSENTIAL" | "PROFESSIONAL" | "COMPLETE";
  name: string;
  description: string;
  tagline: string | null;
  displayOrder: number;
  features: string[];
}

interface EmployeeBandData {
  id: number;
  code: string;
  label: string;
  minimumEmployees: number;
  maximumEmployees: number | null;
  requiresTailoredQuote: boolean;
}

interface PriceData {
  id: number;
  subscriptionPlanId: number;
  employeeBandId: number;
  planCode: string;
  bandCode: string;
  monthlyAmountMUR: number | null;
  yearlyAmountMUR?: number | null;
  yearlySavingsMUR?: number;
  yearlyEquivalentMonthlyMUR?: number | null;
  requiresTailoredQuote: boolean;
}

export default function Pricing() {
  const { t } = useLanguage();
  const { isSignedIn } = useAuth();
  const [selectedBandCode, setSelectedBandCode] = useState<string>("UP_TO_25");
  const [largeCompanyHeadcount, setLargeCompanyHeadcount] = useState<number>(150);
  const [billingInterval, setBillingInterval] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [bands, setBands] = useState<EmployeeBandData[]>([]);
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    customFetch<{ plans: PlanData[]; employeeBands: EmployeeBandData[]; prices: PriceData[] }>("/api/subscriptions/public-plans")
      .then((res) => {
        if (isMounted && res) {
          setPlans(res.plans || []);
          setBands(res.employeeBands || []);
          setPrices(res.prices || []);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const comparisonRows = [
    { name: "Core Sustainability Certificate (ELH-01 to ELH-12)", essential: true, professional: true, complete: true },
    { name: "Sustainability Foundations & Environmental Compliance", essential: true, professional: true, complete: true },
    { name: "Standard Certificates & Digital Badges", essential: true, professional: true, complete: true },
    { name: "Learner Progress & Completion Tracking", essential: true, professional: true, complete: true },
    { name: "Exportable Training & Compliance Records", essential: true, professional: true, complete: true },
    { name: "Sustainability in Action Courses (ELH-13 to ELH-23)", essential: false, professional: true, complete: true },
    { name: "Sustainability by Department Courses (ELH-24 to ELH-29)", essential: false, professional: true, complete: true },
    { name: "Department-Level Progress Views & Recommendations", essential: false, professional: true, complete: true },
    { name: "Enhanced Assignment & Engagement Reporting", essential: false, professional: true, complete: true },
    { name: "Leadership and Sustainability Management Courses", essential: false, professional: false, complete: true },
    { name: "Advanced ESG Organisational Reporting Pathways", essential: false, professional: false, complete: true },
    { name: "Full Standard Catalogue Access & Future Additions", essential: false, professional: false, complete: true },
  ];

  // Map prices by planCode and bandCode
  const priceMap = useMemo(() => {
    const map = new Map<string, PriceData>();
    for (const p of prices) {
      map.set(`${p.planCode}_${p.bandCode}`, p);
    }
    return map;
  }, [prices]);

  const activeBand = bands.find(b => b.code === selectedBandCode);
  const isOver120 = selectedBandCode === "OVER_120";

  // Compute pricing for plan card
  const getCardPricing = (planCode: "ESSENTIAL" | "PROFESSIONAL" | "COMPLETE", fallbackMonthly: number) => {
    if (!isOver120) {
      const pData = priceMap.get(`${planCode}_${selectedBandCode}`);
      const baseMonthly = pData?.monthlyAmountMUR || fallbackMonthly;
      const yearlyCalc = calculateYearlyPricing(baseMonthly);

      return {
        isLargeCompany: false,
        monthlyAmount: baseMonthly,
        yearlyAmount: yearlyCalc.yearlyPriceMUR || baseMonthly * 12,
        annualSavings: yearlyCalc.savingsMUR,
        equivalentMonthly: yearlyCalc.equivalentMonthlyMUR || baseMonthly,
        additionalBlocks: 0,
        includedCapacity: selectedBandCode === "UP_TO_25" ? 25 : selectedBandCode === "FROM_26_TO_50" ? 50 : selectedBandCode === "FROM_51_TO_80" ? 80 : 120,
      };
    }

    const dynamic = calculateDynamicPricing(planCode, largeCompanyHeadcount, fallbackMonthly);
    return {
      isLargeCompany: true,
      monthlyAmount: dynamic.finalMonthly,
      yearlyAmount: dynamic.finalYearly,
      annualSavings: dynamic.yearlyDiscount,
      equivalentMonthly: dynamic.equivalentMonthlyYearly,
      additionalBlocks: dynamic.additionalBlocks,
      includedCapacity: dynamic.includedCapacity,
    };
  };

  const essentialPricing = getCardPricing("ESSENTIAL", 3000);
  const professionalPricing = getCardPricing("PROFESSIONAL", 4500);
  const completePricing = getCardPricing("COMPLETE", 6000);

  const getCheckoutUrl = (planCode: string) => {
    const countParam = isOver120 ? `&employeeCount=${largeCompanyHeadcount}` : "";
    const targetUrl = `/company/subscribe?planCode=${planCode}&bandCode=${selectedBandCode}&billingInterval=${billingInterval}${countParam}`;
    return isSignedIn ? targetUrl : `/sign-up?redirect_url=${encodeURIComponent(targetUrl)}`;
  };

  return (
    <Layout>
      {/* Header Banner */}
      <div className="bg-gradient-to-b from-emerald-900/10 via-background to-background pt-16 md:pt-24 pb-12 border-b">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-full mb-4">
            <Sparkles className="h-3.5 w-3.5" /> Elevio Commercial Plans
          </span>
          <h1 className="text-3xl md:text-5xl font-bold font-serif mb-4 text-foreground tracking-tight">
            {t("pricing.title")}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t("pricing.subtitle")}
          </p>
          <p className="text-xs text-muted-foreground mt-3 font-medium">
            All prices are shown in Mauritian Rupees (MUR). Transparent self-service pricing for teams of 1 to 10,000+ employees.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Billing Interval & Employee Band Selector */}
        <div className="max-w-3xl mx-auto space-y-6 text-center">
          {/* Monthly / Yearly Billing Toggle */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
              Billing Interval
            </label>
            <div className="inline-flex items-center bg-muted p-1.5 rounded-2xl border gap-1">
              <button
                type="button"
                onClick={() => setBillingInterval("MONTHLY")}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2",
                  billingInterval === "MONTHLY"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingInterval("YEARLY")}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2",
                  billingInterval === "YEARLY"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span>Yearly</span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-500/30">
                  Save 10%
                </span>
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Choose monthly billing for flexibility, or pay yearly and save 10% on the equivalent 12-month price.
              {billingInterval === "YEARLY" && (
                <span className="block text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
                  One annual payment covers 12 full months of access.
                </span>
              )}
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-foreground uppercase tracking-wider block">
              {t("pricing.step1")}
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 bg-muted/60 p-2 rounded-2xl border">
              {(bands.length > 0 ? bands : [
                { code: "UP_TO_25", label: "Up to 25" },
                { code: "FROM_26_TO_50", label: "26–50" },
                { code: "FROM_51_TO_80", label: "51–80" },
                { code: "FROM_81_TO_120", label: "81–120" },
                { code: "OVER_120", label: "121+ employees" },
              ]).map((b) => {
                const isSelected = selectedBandCode === b.code;
                return (
                  <button
                    key={b.code}
                    onClick={() => setSelectedBandCode(b.code)}
                    className={cn(
                      "px-3 py-3 rounded-xl text-sm font-semibold transition-all text-center flex flex-col items-center justify-center gap-0.5 border",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-md"
                        : "bg-card hover:bg-card/80 text-muted-foreground border-transparent hover:border-border"
                    )}
                  >
                    <span>{b.label}</span>
                    <span className={cn("text-[10px] font-mono opacity-80", isSelected ? "text-primary-foreground" : "text-muted-foreground")}>
                      {b.code === "OVER_120" ? "Enterprise" : "employees"}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Headcount Slider/Input for >120 employees */}
            {isOver120 && (
              <div className="bg-card border-2 border-emerald-600/30 rounded-2xl p-5 mt-4 space-y-4 text-left shadow-sm animate-in fade-in slide-in-from-top-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-400 tracking-wider flex items-center gap-1.5">
                      <Users className="h-4 w-4" /> Specify Your Exact Headcount
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Base rate includes up to 250 seats. Additional seats scale in blocks of 50.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={121}
                      max={10000}
                      step={1}
                      value={largeCompanyHeadcount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) setLargeCompanyHeadcount(Math.max(121, val));
                      }}
                      className="w-28 text-center font-bold text-base h-10 border-emerald-500/50"
                    />
                    <span className="text-xs font-semibold text-muted-foreground">employees</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={121}
                    max={1000}
                    step={10}
                    value={largeCompanyHeadcount > 1000 ? 1000 : largeCompanyHeadcount}
                    onChange={(e) => setLargeCompanyHeadcount(parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
                  <span>Included Capacity: <strong className="text-foreground">{largeCompanyHeadcount <= 250 ? "Up to 250 employees" : `Up to ${250 + Math.ceil((largeCompanyHeadcount - 250) / 50) * 50} employees`}</strong></span>
                  {largeCompanyHeadcount > 250 && (
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                      +{Math.ceil((largeCompanyHeadcount - 250) / 50)} additional 50-employee block{Math.ceil((largeCompanyHeadcount - 250) / 50) > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3 Plan Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {/* ESSENTIAL PLAN */}
          <div className="bg-card border rounded-3xl p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all relative">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Plan 1</span>
                <h3 className="text-2xl font-bold font-serif mt-1">Essential</h3>
                <p className="text-xs text-muted-foreground mt-1">Core sustainability learning for every employee.</p>
              </div>

              <div className="pt-2 border-t border-b py-4">
                {billingInterval === "YEARLY" ? (
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold font-serif">
                        MUR {essentialPricing.yearlyAmount.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">/ year</span>
                    </div>
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold block mt-0.5">Billed yearly</span>
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 block mt-1">
                      Save MUR {essentialPricing.annualSavings.toLocaleString()} per year
                    </span>
                    <span className="text-xs text-muted-foreground block mt-0.5">
                      Equivalent to MUR {essentialPricing.equivalentMonthly.toLocaleString()}/month
                    </span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold font-serif">
                        MUR {essentialPricing.monthlyAmount.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">/ month</span>
                    </div>
                    <span className="text-xs text-muted-foreground block mt-0.5">
                      {isOver120 ? `Fixed monthly for up to ${essentialPricing.includedCapacity} employees` : `Billed monthly for ${activeBand?.label || "your team"}`}
                    </span>
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 block mt-1.5">
                      {isOver120 ? `MUR ${(essentialPricing.monthlyAmount / (isOver120 ? largeCompanyHeadcount : 25)).toFixed(2)} per employee/month` : (PER_EMPLOYEE_COST_MAP[selectedBandCode] || "From MUR 120 per employee/month")}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-3 text-sm">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider block">Course Access Included:</span>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>ELH-01 to ELH-12</strong> (Core Sustainability Certificate)</span>
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Waste sorting, energy, water, green office & compliance</span>
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Learner progress tracking & printable certificates</span>
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Exportable compliance training records</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8">
              <Button asChild size="lg" className="w-full font-semibold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-md">
                <Link href={getCheckoutUrl("ESSENTIAL")}>
                  Get Started — Essential
                </Link>
              </Button>
            </div>
          </div>

          {/* PROFESSIONAL PLAN (Recommended) */}
          <div className="bg-card border-2 border-emerald-600 dark:border-emerald-500 rounded-3xl p-8 flex flex-col justify-between shadow-xl relative scale-[1.02]">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" /> Recommended
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Plan 2</span>
                <h3 className="text-2xl font-bold font-serif mt-1">Professional</h3>
                <p className="text-xs text-muted-foreground mt-1">Practical learning for workplace action and departments.</p>
              </div>

              <div className="pt-2 border-t border-b py-4">
                {billingInterval === "YEARLY" ? (
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold font-serif text-emerald-700 dark:text-emerald-400">
                        MUR {professionalPricing.yearlyAmount.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">/ year</span>
                    </div>
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold block mt-0.5">Billed yearly</span>
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 block mt-1">
                      Save MUR {professionalPricing.annualSavings.toLocaleString()} per year
                    </span>
                    <span className="text-xs text-muted-foreground block mt-0.5">
                      Equivalent to MUR {professionalPricing.equivalentMonthly.toLocaleString()}/month
                    </span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold font-serif text-emerald-700 dark:text-emerald-400">
                        MUR {professionalPricing.monthlyAmount.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">/ month</span>
                    </div>
                    <span className="text-xs text-muted-foreground block mt-0.5">
                      {isOver120 ? `Fixed monthly for up to ${professionalPricing.includedCapacity} employees` : `Billed monthly for ${activeBand?.label || "your team"}`}
                    </span>
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 block mt-1.5">
                      {isOver120 ? `MUR ${(professionalPricing.monthlyAmount / (isOver120 ? largeCompanyHeadcount : 50)).toFixed(2)} per employee/month` : (PER_EMPLOYEE_COST_MAP[selectedBandCode] || "From MUR 90 per employee/month")}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-3 text-sm">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider block">Includes Everything in Essential, plus:</span>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2 text-foreground font-medium">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Sustainability in Action</strong> courses (ELH-13 to ELH-23)</span>
                  </li>
                  <li className="flex items-start gap-2 text-foreground font-medium">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Departmental Courses</strong> (HR, Finance, Ops, Facilities, Sales)</span>
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Department-level progress views & recommendations</span>
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Enhanced assignment & engagement reporting</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8">
              <Button asChild size="lg" className="w-full font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
                <Link href={getCheckoutUrl("PROFESSIONAL")}>
                  Get Started — Professional
                </Link>
              </Button>
            </div>
          </div>

          {/* COMPLETE PLAN */}
          <div className="bg-card border rounded-3xl p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all relative">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Plan 3</span>
                <h3 className="text-2xl font-bold font-serif mt-1">Complete</h3>
                <p className="text-xs text-muted-foreground mt-1">Full learning access for sustainability leadership and reporting.</p>
              </div>

              <div className="pt-2 border-t border-b py-4">
                {billingInterval === "YEARLY" ? (
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold font-serif">
                        MUR {completePricing.yearlyAmount.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">/ year</span>
                    </div>
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold block mt-0.5">Billed yearly</span>
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 block mt-1">
                      Save MUR {completePricing.annualSavings.toLocaleString()} per year
                    </span>
                    <span className="text-xs text-muted-foreground block mt-0.5">
                      Equivalent to MUR {completePricing.equivalentMonthly.toLocaleString()}/month
                    </span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold font-serif">
                        MUR {completePricing.monthlyAmount.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">/ month</span>
                    </div>
                    <span className="text-xs text-muted-foreground block mt-0.5">
                      {isOver120 ? `Fixed monthly for up to ${completePricing.includedCapacity} employees` : `Billed monthly for ${activeBand?.label || "your team"}`}
                    </span>
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 block mt-1.5">
                      {isOver120 ? `MUR ${(completePricing.monthlyAmount / (isOver120 ? largeCompanyHeadcount : 80)).toFixed(2)} per employee/month` : (PER_EMPLOYEE_COST_MAP[selectedBandCode] || "From MUR 62.50 per employee/month")}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-3 text-sm">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider block">Includes Everything in Professional, plus:</span>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2 text-foreground font-medium">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Leadership & Management</strong> learning pathways</span>
                  </li>
                  <li className="flex items-start gap-2 text-foreground font-medium">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Full Standard Catalogue</strong> access & future additions</span>
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Advanced organisational reporting & executive summaries</span>
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Management-level completion & ESG evidence exports</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8">
              <Button asChild size="lg" className="w-full font-semibold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-md">
                <Link href={getCheckoutUrl("COMPLETE")}>
                  Get Started — Complete
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Calculation Note */}
        <div className="max-w-3xl mx-auto text-center pt-2">
          <p className="text-xs text-muted-foreground leading-relaxed bg-muted/40 p-4 rounded-xl border">
            {INDICATIVE_CALCULATION_NOTE}
          </p>
        </div>

        {/* Plan Comparison Matrix */}
        <div className="max-w-5xl mx-auto space-y-6 pt-8 border-t">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold font-serif">Compare Plan Entitlements & Features</h2>
            <p className="text-muted-foreground text-sm">Review full course coverage and administrative capabilities across plans.</p>
          </div>

          <div className="border rounded-2xl overflow-x-auto bg-card shadow-sm">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b bg-muted/50 text-xs font-bold text-foreground uppercase tracking-wider">
                  <th className="py-4 px-6">Capability / Course Coverage</th>
                  <th className="py-4 px-4 text-center w-32">Essential</th>
                  <th className="py-4 px-4 text-center w-32 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400">Professional</th>
                  <th className="py-4 px-4 text-center w-32">Complete</th>
                </tr>
              </thead>
              <tbody className="divide-y text-muted-foreground">
                {comparisonRows.map((row, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-6 font-medium text-foreground text-sm">{row.name}</td>
                    <td className="py-3.5 px-4 text-center">
                      {row.essential ? <Check className="h-5 w-5 text-emerald-600 mx-auto" /> : <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />}
                    </td>
                    <td className="py-3.5 px-4 text-center bg-emerald-500/5">
                      {row.professional ? <Check className="h-5 w-5 text-emerald-600 mx-auto" /> : <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {row.complete ? <Check className="h-5 w-5 text-emerald-600 mx-auto" /> : <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}