export interface PricingPlan {
  id: string;
  name: string;
  minEmployees: number;
  maxEmployees: number | null;
  monthlyPriceMUR: number | null;
  requiresCustomQuote: boolean;
  indicativePerEmployeeCopy: string;
  features: string[];
}

export const PER_EMPLOYEE_COST_MAP: Record<string, string> = {
  UP_TO_25: "From MUR 120 per employee/month",
  FROM_26_TO_50: "From MUR 90 per employee/month",
  FROM_51_TO_80: "From MUR 62.50 per employee/month",
  FROM_81_TO_120: "From MUR 52.08 per employee/month",
  OVER_120: "Per-employee cost calculated with your quote",
};

export const INDICATIVE_CALCULATION_NOTE =
  "Indicative per-employee amounts are calculated using the maximum number of employees included in each band. Your company subscription remains a fixed monthly fee based on your employee category.";

export function calculateYearlyPricing(monthlyPriceMUR: number | null): {
  yearlyPriceMUR: number | null;
  undiscountedTotalMUR: number | null;
  savingsMUR: number;
  equivalentMonthlyMUR: number | null;
} {
  if (!monthlyPriceMUR || monthlyPriceMUR <= 0) {
    return { yearlyPriceMUR: null, undiscountedTotalMUR: null, savingsMUR: 0, equivalentMonthlyMUR: null };
  }
  const undiscounted = monthlyPriceMUR * 12;
  const savings = Math.round(undiscounted * 0.10);
  const yearlyPrice = undiscounted - savings;
  const equivalentMonthly = Math.round((yearlyPrice / 12) * 100) / 100;
  return {
    yearlyPriceMUR: yearlyPrice,
    undiscountedTotalMUR: undiscounted,
    savingsMUR: savings,
    equivalentMonthlyMUR: equivalentMonthly,
  };
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "plan_25",
    name: "Up to 25 employees",
    minEmployees: 1,
    maxEmployees: 25,
    monthlyPriceMUR: 3000,
    requiresCustomQuote: false,
    indicativePerEmployeeCopy: "From MUR 120 per employee/month",
    features: [
      "One monthly company subscription, selected according to your total number of employees.",
      "Access to full sustainability training library.",
      "Company dashboard for tracking engagement.",
      "Printable certificates for all learners.",
      "Basic compliance reporting."
    ],
  },
  {
    id: "plan_50",
    name: "26–50 employees",
    minEmployees: 26,
    maxEmployees: 50,
    monthlyPriceMUR: 4500,
    requiresCustomQuote: false,
    indicativePerEmployeeCopy: "From MUR 90 per employee/month",
    features: [
      "One monthly company subscription, selected according to your total number of employees.",
      "Access to full sustainability training library.",
      "Company dashboard for tracking engagement.",
      "Printable certificates for all learners.",
      "Basic compliance reporting."
    ],
  },
  {
    id: "plan_80",
    name: "51–80 employees",
    minEmployees: 51,
    maxEmployees: 80,
    monthlyPriceMUR: 5000,
    requiresCustomQuote: false,
    indicativePerEmployeeCopy: "From MUR 62.50 per employee/month",
    features: [
      "One monthly company subscription, selected according to your total number of employees.",
      "Access to full sustainability training library.",
      "Company dashboard for tracking engagement.",
      "Printable certificates for all learners.",
      "Basic compliance reporting."
    ],
  },
  {
    id: "plan_120",
    name: "81–120 employees",
    minEmployees: 81,
    maxEmployees: 120,
    monthlyPriceMUR: 6250,
    requiresCustomQuote: false,
    indicativePerEmployeeCopy: "From MUR 52.08 per employee/month",
    features: [
      "One monthly company subscription, selected according to your total number of employees.",
      "Access to full sustainability training library.",
      "Company dashboard for tracking engagement.",
      "Printable certificates for all learners.",
      "Basic compliance reporting."
    ],
  },
  {
    id: "plan_custom",
    name: "Over 120 employees",
    minEmployees: 121,
    maxEmployees: null,
    monthlyPriceMUR: null,
    requiresCustomQuote: true,
    indicativePerEmployeeCopy: "Per-employee cost calculated with your quote",
    features: [
      "One monthly company subscription, selected according to your total number of employees.",
      "Access to full sustainability training library.",
      "Advanced compliance and custom reporting.",
      "Dedicated account management support.",
      "Volume discounts available."
    ],
  },
];
