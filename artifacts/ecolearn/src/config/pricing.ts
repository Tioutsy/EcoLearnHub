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

export type PlanCode = "ESSENTIAL" | "PROFESSIONAL" | "COMPLETE";
export type BillingInterval = "MONTHLY" | "YEARLY";

export const BASE_PRICING_121_250: Record<PlanCode, number> = {
  ESSENTIAL: 7500,
  PROFESSIONAL: 9500,
  COMPLETE: 12500,
};

export const ADDITIONAL_BLOCK_PRICE_MONTHLY: Record<PlanCode, number> = {
  ESSENTIAL: 1000,
  PROFESSIONAL: 1250,
  COMPLETE: 1500,
};

export const PER_EMPLOYEE_COST_MAP: Record<string, string> = {
  UP_TO_25: "From MUR 120 per employee/month",
  FROM_26_TO_50: "From MUR 90 per employee/month",
  FROM_51_TO_80: "From MUR 62.50 per employee/month",
  FROM_81_TO_120: "From MUR 52.08 per employee/month",
  OVER_120: "From MUR 30 per employee/month",
};

export const INDICATIVE_CALCULATION_NOTE =
  "Indicative per-employee amounts are calculated using the maximum number of employees included in each tier. Your company subscription is billed as a transparent fixed fee based on your employee count.";

export interface CalculatedPricing {
  baseMonthly: number;
  additionalBlocks: number;
  additionalMonthly: number;
  finalMonthly: number;
  undiscountedYearly: number;
  yearlyDiscount: number;
  finalYearly: number;
  equivalentMonthlyYearly: number;
  includedCapacity: number;
}

export function calculateDynamicPricing(
  planCode: PlanCode,
  employeeCount: number,
  standardBaseMonthly?: number
): CalculatedPricing {
  const count = Math.max(1, Math.round(employeeCount));

  if (count <= 120 && standardBaseMonthly) {
    const baseMonthly = standardBaseMonthly;
    const undiscountedYearly = baseMonthly * 12;
    const yearlyDiscount = Math.round(undiscountedYearly * 0.10);
    const finalYearly = undiscountedYearly - yearlyDiscount;
    const equivalentMonthlyYearly = Math.round((finalYearly / 12) * 100) / 100;
    const includedCapacity = count <= 25 ? 25 : count <= 50 ? 50 : count <= 80 ? 80 : 120;

    return {
      baseMonthly,
      additionalBlocks: 0,
      additionalMonthly: 0,
      finalMonthly: baseMonthly,
      undiscountedYearly,
      yearlyDiscount,
      finalYearly,
      equivalentMonthlyYearly,
      includedCapacity,
    };
  }

  // 121+ employees: Base covers up to 250
  const baseMonthly = BASE_PRICING_121_250[planCode];
  const blockPrice = ADDITIONAL_BLOCK_PRICE_MONTHLY[planCode];
  let additionalBlocks = 0;

  if (count > 250) {
    additionalBlocks = Math.ceil((count - 250) / 50);
  }

  const additionalMonthly = additionalBlocks * blockPrice;
  const finalMonthly = baseMonthly + additionalMonthly;
  const undiscountedYearly = finalMonthly * 12;
  const yearlyDiscount = Math.round(undiscountedYearly * 0.10);
  const finalYearly = undiscountedYearly - yearlyDiscount;
  const equivalentMonthlyYearly = Math.round((finalYearly / 12) * 100) / 100;
  const includedCapacity = count <= 250 ? 250 : 250 + additionalBlocks * 50;

  return {
    baseMonthly,
    additionalBlocks,
    additionalMonthly,
    finalMonthly,
    undiscountedYearly,
    yearlyDiscount,
    finalYearly,
    equivalentMonthlyYearly,
    includedCapacity,
  };
}

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
