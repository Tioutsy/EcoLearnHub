export type BillingInterval = "MONTHLY" | "YEARLY";

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
}

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
