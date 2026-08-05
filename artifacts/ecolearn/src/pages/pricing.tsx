import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Building2,
  FileText,
  Sparkles,
  ShieldCheck,
  Check,
  X,
  HelpCircle,
  ArrowRight,
  Layers,
  Award,
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@clerk/react";
import { LeadCaptureDialog } from "@/components/lead-capture-dialog";
import { useState, useEffect, useMemo } from "react";
import { customFetch } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import { PER_EMPLOYEE_COST_MAP, INDICATIVE_CALCULATION_NOTE } from "@/config/pricing";

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
  requiresTailoredQuote: boolean;
}

export default function Pricing() {
  const { isSignedIn } = useAuth();
  const [selectedBandCode, setSelectedBandCode] = useState<string>("UP_TO_25");
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

  // Map prices by planCode and bandCode
  const priceMap = useMemo(() => {
    const map = new Map<string, PriceData>();
    for (const p of prices) {
      map.set(`${p.planCode}_${p.bandCode}`, p);
    }
    return map;
  }, [prices]);

  const activeBand = bands.find(b => b.code === selectedBandCode);
  const isOver120 = selectedBandCode === "OVER_120" || activeBand?.requiresTailoredQuote;

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

  return (
    <Layout>
      {/* Header Banner */}
      <div className="bg-gradient-to-b from-emerald-900/10 via-background to-background pt-16 md:pt-24 pb-12 border-b">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-full mb-4">
            <Sparkles className="h-3.5 w-3.5" /> Elevio Hybrid Commercial Plans
          </span>
          <h1 className="text-3xl md:text-5xl font-bold font-serif mb-4 text-foreground tracking-tight">
            Choose the level of sustainability learning your organisation needs
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Select a commercial plan for your required course coverage, with transparent monthly pricing based on your total employee category.
          </p>
          <p className="text-xs text-muted-foreground mt-3 font-medium">
            All prices are shown in Mauritian Rupees (MUR) per month. Higher plans include all lower-plan course content.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Employee Band Selector */}
        <div className="max-w-3xl mx-auto space-y-4 text-center">
          <label className="text-sm font-bold text-foreground uppercase tracking-wider block">
            Step 1: Select your total employee category
          </label>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 bg-muted/60 p-2 rounded-2xl border">
            {(bands.length > 0 ? bands : [
              { code: "UP_TO_25", label: "Up to 25" },
              { code: "FROM_26_TO_50", label: "26–50" },
              { code: "FROM_51_TO_80", label: "51–80" },
              { code: "FROM_81_TO_120", label: "81–120" },
              { code: "OVER_120", label: "Over 120" },
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
                    {b.code === "OVER_120" ? "Tailored quote" : "employees"}
                  </span>
                </button>
              );
            })}
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
                {!isOver120 ? (
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold font-serif">
                        MUR {(priceMap.get(`ESSENTIAL_${selectedBandCode}`)?.monthlyAmountMUR || 3000).toLocaleString()}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground block">per month · billed for {activeBand?.label || "your team"}</span>
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 block mt-1.5">
                      {PER_EMPLOYEE_COST_MAP[selectedBandCode] || "From MUR 120 per employee/month"}
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="text-xl font-bold text-foreground">Contact us for a quote</span>
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium block mt-1">Per-employee cost calculated with your quote</span>
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
              {!isOver120 ? (
                <Button asChild size="lg" className="w-full font-semibold rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  <Link href={isSignedIn ? `/company/subscribe?planCode=ESSENTIAL&bandCode=${selectedBandCode}` : `/sign-up?redirect_url=/company/subscribe?planCode=ESSENTIAL&bandCode=${selectedBandCode}`}>
                    Choose Essential
                  </Link>
                </Button>
              ) : (
                <LeadCaptureDialog
                  interest="proposal"
                  trigger={<Button variant="outline" size="lg" className="w-full font-semibold rounded-xl">Contact us</Button>}
                />
              )}
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
                {!isOver120 ? (
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold font-serif text-emerald-700 dark:text-emerald-400">
                        MUR {(priceMap.get(`PROFESSIONAL_${selectedBandCode}`)?.monthlyAmountMUR || 4500).toLocaleString()}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground block">per month · billed for {activeBand?.label || "your team"}</span>
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 block mt-1.5">
                      {PER_EMPLOYEE_COST_MAP[selectedBandCode] || "From MUR 90 per employee/month"}
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="text-xl font-bold text-foreground">Contact us for a quote</span>
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium block mt-1">Per-employee cost calculated with your quote</span>
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
              {!isOver120 ? (
                <Button asChild size="lg" className="w-full font-semibold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-md">
                  <Link href={isSignedIn ? `/company/subscribe?planCode=PROFESSIONAL&bandCode=${selectedBandCode}` : `/sign-up?redirect_url=/company/subscribe?planCode=PROFESSIONAL&bandCode=${selectedBandCode}`}>
                    Choose Professional
                  </Link>
                </Button>
              ) : (
                <LeadCaptureDialog
                  interest="proposal"
                  trigger={<Button variant="outline" size="lg" className="w-full font-semibold rounded-xl">Contact us</Button>}
                />
              )}
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
                {!isOver120 ? (
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold font-serif">
                        MUR {(priceMap.get(`COMPLETE_${selectedBandCode}`)?.monthlyAmountMUR || 6000).toLocaleString()}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground block">per month · billed for {activeBand?.label || "your team"}</span>
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 block mt-1.5">
                      {PER_EMPLOYEE_COST_MAP[selectedBandCode] || "From MUR 62.50 per employee/month"}
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="text-xl font-bold text-foreground">Contact us for a quote</span>
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium block mt-1">Per-employee cost calculated with your quote</span>
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
              {!isOver120 ? (
                <Button asChild size="lg" className="w-full font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link href={isSignedIn ? `/company/subscribe?planCode=COMPLETE&bandCode=${selectedBandCode}` : `/sign-up?redirect_url=/company/subscribe?planCode=COMPLETE&bandCode=${selectedBandCode}`}>
                    Choose Complete
                  </Link>
                </Button>
              ) : (
                <LeadCaptureDialog
                  interest="proposal"
                  trigger={<Button variant="outline" size="lg" className="w-full font-semibold rounded-xl">Contact us</Button>}
                />
              )}
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

        {/* Corporate Proposal Callout for >120 employees */}
        <div className="max-w-4xl mx-auto border rounded-3xl p-8 bg-gradient-to-r from-muted/50 to-card shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
              <Building2 className="h-4 w-4" /> Enterprise & Large Organisations
            </div>
            <h3 className="text-xl font-bold font-serif">More than 120 employees?</h3>
            <p className="text-sm text-muted-foreground">
              We offer tailored corporate agreements, custom departmental rollouts, and volume pricing for large workforces across Mauritius.
            </p>
          </div>

          <LeadCaptureDialog
            interest="proposal"
            trigger={
              <Button size="lg" variant="outline" className="shrink-0 font-semibold rounded-xl gap-2">
                <span>Request Corporate Proposal</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            }
          />
        </div>
      </div>
    </Layout>
  );
}