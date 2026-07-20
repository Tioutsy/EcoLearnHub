export interface PricingPlan {
  id: string;
  name: string;
  minEmployees: number;
  maxEmployees: number | null;
  monthlyPriceMUR: number | null;
  requiresCustomQuote: boolean;
  features: string[];
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "plan_25",
    name: "Up to 25 employees",
    minEmployees: 1,
    maxEmployees: 25,
    monthlyPriceMUR: 3000,
    requiresCustomQuote: false,
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
    features: [
      "One monthly company subscription, selected according to your total number of employees.",
      "Access to full sustainability training library.",
      "Advanced compliance and custom reporting.",
      "Dedicated account management support.",
      "Volume discounts available."
    ],
  },
];
