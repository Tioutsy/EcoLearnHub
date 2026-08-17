export type BillingInterval = "MONTHLY" | "YEARLY";
export type PlanCode = "ESSENTIAL" | "PROFESSIONAL" | "COMPLETE";

export interface EnterprisePricingInput {
  planCode: string;
  employeeCount: number;
  billingInterval?: string | null;
}

export interface EnterprisePricingBreakdown {
  packageIdentifier: PlanCode;
  employeeCount: number;
  baseEmployeeCapacity: number;
  additionalEmployeeCount: number;
  additionalBlockSize: number;
  additionalBlocks: number;
  baseMonthlyPrice: number;
  pricePerAdditionalBlock: number;
  additionalMonthlyAmount: number;
  finalMonthlyAmount: number;
  undiscountedAnnualTotal: number;
  discountPercentage: number;
  discountAmount: number;
  finalYearlyAmount: number;
  billingInterval: BillingInterval;
  finalAmountDue: number;
  currency: string;
  includedMaxEmployees: number;
  annualSavings: number;
  equivalentMonthlyAmount: number;
}

export interface PricingCalculationResult {
  monthlyBasePrice: number | null;
  billingInterval: BillingInterval;
  undiscountedTotal: number | null;
  discountPercentage: number;
  discountAmount: number;
  finalAmount: number | null;
  annualSavings: number;
  equivalentMonthlyAmount: number | null;
  currency: string;
  isTailoredQuote: boolean;
  includedMaxEmployees?: number;
}

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

export const STANDARD_BAND_PRICING: Record<PlanCode, Record<string, number>> = {
  ESSENTIAL: {
    UP_TO_25: 3000,
    FROM_26_TO_50: 4500,
    FROM_51_TO_80: 5000,
    FROM_81_TO_120: 6250,
  },
  PROFESSIONAL: {
    UP_TO_25: 4500,
    FROM_26_TO_50: 6500,
    FROM_51_TO_80: 7500,
    FROM_81_TO_120: 9000,
  },
  COMPLETE: {
    UP_TO_25: 6000,
    FROM_26_TO_50: 9000,
    FROM_51_TO_80: 11000,
    FROM_81_TO_120: 13500,
  },
};

export const BAND_CAPACITY_LIMITS: Record<string, number> = {
  UP_TO_25: 25,
  FROM_26_TO_50: 50,
  FROM_51_TO_80: 80,
  FROM_81_TO_120: 120,
};

export function normalizeBillingInterval(rawInterval?: string | null): BillingInterval {
  if (!rawInterval) return "MONTHLY";
  const normalized = rawInterval.trim().toUpperCase();
  if (normalized === "MONTHLY" || normalized === "MONTH") {
    return "MONTHLY";
  }
  if (normalized === "YEARLY" || normalized === "ANNUAL" || normalized === "YEAR") {
    return "YEARLY";
  }
  throw new Error(`Invalid billing interval: "${rawInterval}". Supported values are "MONTHLY" and "YEARLY".`);
}

export function normalizePlanCode(rawPlanCode?: string | null): PlanCode {
  if (!rawPlanCode) throw new Error("Plan code is required.");
  const normalized = rawPlanCode.trim().toUpperCase() as PlanCode;
  if (normalized === "ESSENTIAL" || normalized === "PROFESSIONAL" || normalized === "COMPLETE") {
    return normalized;
  }
  throw new Error(`Unsupported package: "${rawPlanCode}". Supported values are "ESSENTIAL", "PROFESSIONAL", and "COMPLETE".`);
}

/**
 * Authoritative Server-Side Pricing Engine for Companies with >120 Employees.
 * Base capacity: 121–250 employees.
 * Additional blocks: +50 employees per started block above 250.
 * Yearly billing: Exactly 10% discount on total annual amount.
 */
export function calculateEnterprisePricing(input: EnterprisePricingInput): EnterprisePricingBreakdown {
  const planCode = normalizePlanCode(input.planCode);
  const billingInterval = normalizeBillingInterval(input.billingInterval);

  const count = input.employeeCount;
  if (count === undefined || count === null || typeof count !== "number" || isNaN(count)) {
    throw new Error("Missing or invalid employee count.");
  }
  if (!Number.isInteger(count)) {
    throw new Error("Employee count must be an integer.");
  }
  if (count <= 0) {
    throw new Error("Employee count must be greater than zero.");
  }
  if (count > 100000) {
    throw new Error("Employee count exceeds maximum supported organization size.");
  }

  const baseMonthlyPrice = BASE_PRICING_121_250[planCode];
  const pricePerAdditionalBlock = ADDITIONAL_BLOCK_PRICE_MONTHLY[planCode];
  const baseEmployeeCapacity = 250;
  const additionalBlockSize = 50;

  let additionalEmployeeCount = 0;
  let additionalBlocks = 0;

  if (count > 250) {
    additionalEmployeeCount = count - 250;
    additionalBlocks = Math.ceil(additionalEmployeeCount / additionalBlockSize);
  }

  const additionalMonthlyAmount = additionalBlocks * pricePerAdditionalBlock;
  const finalMonthlyAmount = baseMonthlyPrice + additionalMonthlyAmount;

  const undiscountedAnnualTotal = finalMonthlyAmount * 12;
  const discountPercentage = 10;
  const discountAmount = Math.round(undiscountedAnnualTotal * 0.10);
  const finalYearlyAmount = undiscountedAnnualTotal - discountAmount;
  const annualSavings = discountAmount;
  const equivalentMonthlyAmount = Math.round((finalYearlyAmount / 12) * 100) / 100;

  const finalAmountDue = billingInterval === "YEARLY" ? finalYearlyAmount : finalMonthlyAmount;
  const includedMaxEmployees = count <= 250 ? 250 : 250 + additionalBlocks * additionalBlockSize;

  return {
    packageIdentifier: planCode,
    employeeCount: count,
    baseEmployeeCapacity,
    additionalEmployeeCount,
    additionalBlockSize,
    additionalBlocks,
    baseMonthlyPrice,
    pricePerAdditionalBlock,
    additionalMonthlyAmount,
    finalMonthlyAmount,
    undiscountedAnnualTotal,
    discountPercentage: billingInterval === "YEARLY" ? discountPercentage : 0,
    discountAmount: billingInterval === "YEARLY" ? discountAmount : 0,
    finalYearlyAmount,
    billingInterval,
    finalAmountDue,
    currency: "MUR",
    includedMaxEmployees,
    annualSavings,
    equivalentMonthlyAmount,
  };
}

/**
 * Universal Authoritative Pricing Resolver for Any Headcount & Band.
 */
export function calculateAuthoritativePricing(opts: {
  planCode: string;
  employeeCount?: number;
  bandCode?: string;
  billingInterval?: string | null;
}): EnterprisePricingBreakdown {
  const planCode = normalizePlanCode(opts.planCode);
  const billingInterval = normalizeBillingInterval(opts.billingInterval);
  let count = opts.employeeCount;

  if (count === undefined || count === null || isNaN(count)) {
    // Derive headcount from bandCode if count not provided
    if (opts.bandCode === "UP_TO_25") count = 25;
    else if (opts.bandCode === "FROM_26_TO_50") count = 50;
    else if (opts.bandCode === "FROM_51_TO_80") count = 80;
    else if (opts.bandCode === "FROM_81_TO_120") count = 120;
    else if (opts.bandCode === "OVER_120") count = 121;
    else count = 25;
  }

  if (count <= 120) {
    let standardMonthly = 3000;
    let includedMax = 25;

    if (count <= 25) {
      standardMonthly = STANDARD_BAND_PRICING[planCode].UP_TO_25;
      includedMax = 25;
    } else if (count <= 50) {
      standardMonthly = STANDARD_BAND_PRICING[planCode].FROM_26_TO_50;
      includedMax = 50;
    } else if (count <= 80) {
      standardMonthly = STANDARD_BAND_PRICING[planCode].FROM_51_TO_80;
      includedMax = 80;
    } else {
      standardMonthly = STANDARD_BAND_PRICING[planCode].FROM_81_TO_120;
      includedMax = 120;
    }

    const undiscountedAnnualTotal = standardMonthly * 12;
    const discountAmount = Math.round(undiscountedAnnualTotal * 0.10);
    const finalYearlyAmount = undiscountedAnnualTotal - discountAmount;
    const finalAmountDue = billingInterval === "YEARLY" ? finalYearlyAmount : standardMonthly;

    return {
      packageIdentifier: planCode,
      employeeCount: count,
      baseEmployeeCapacity: includedMax,
      additionalEmployeeCount: 0,
      additionalBlockSize: 50,
      additionalBlocks: 0,
      baseMonthlyPrice: standardMonthly,
      pricePerAdditionalBlock: ADDITIONAL_BLOCK_PRICE_MONTHLY[planCode],
      additionalMonthlyAmount: 0,
      finalMonthlyAmount: standardMonthly,
      undiscountedAnnualTotal,
      discountPercentage: billingInterval === "YEARLY" ? 10 : 0,
      discountAmount: billingInterval === "YEARLY" ? discountAmount : 0,
      finalYearlyAmount,
      billingInterval,
      finalAmountDue,
      currency: "MUR",
      includedMaxEmployees: includedMax,
      annualSavings: discountAmount,
      equivalentMonthlyAmount: Math.round((finalYearlyAmount / 12) * 100) / 100,
    };
  }

  return calculateEnterprisePricing({
    planCode,
    employeeCount: count,
    billingInterval,
  });
}

/**
 * Standard legacy wrapper for fixed base amounts.
 */
export function calculateSubscriptionPricing(
  monthlyBasePrice: number | null | undefined,
  rawInterval?: string | null,
  requiresTailoredQuote: boolean = false
): PricingCalculationResult {
  const billingInterval = normalizeBillingInterval(rawInterval);

  if (requiresTailoredQuote || monthlyBasePrice === null || monthlyBasePrice === undefined || monthlyBasePrice <= 0) {
    return {
      monthlyBasePrice: null,
      billingInterval,
      undiscountedTotal: null,
      discountPercentage: 0,
      discountAmount: 0,
      finalAmount: null,
      annualSavings: 0,
      equivalentMonthlyAmount: null,
      currency: "MUR",
      isTailoredQuote: true,
    };
  }

  const basePrice = Math.round(monthlyBasePrice);

  if (billingInterval === "MONTHLY") {
    return {
      monthlyBasePrice: basePrice,
      billingInterval: "MONTHLY",
      undiscountedTotal: basePrice,
      discountPercentage: 0,
      discountAmount: 0,
      finalAmount: basePrice,
      annualSavings: 0,
      equivalentMonthlyAmount: basePrice,
      currency: "MUR",
      isTailoredQuote: false,
    };
  }

  // YEARLY billing: 10% discount on equivalent 12-month total
  const undiscountedTotal = basePrice * 12;
  const discountPercentage = 10;
  const discountAmount = Math.round(undiscountedTotal * 0.10);
  const finalAmount = undiscountedTotal - discountAmount;
  const annualSavings = discountAmount;
  const equivalentMonthlyAmount = Math.round((finalAmount / 12) * 100) / 100;

  return {
    monthlyBasePrice: basePrice,
    billingInterval: "YEARLY",
    undiscountedTotal,
    discountPercentage,
    discountAmount,
    finalAmount,
    annualSavings,
    equivalentMonthlyAmount,
    currency: "MUR",
    isTailoredQuote: false,
  };
}
