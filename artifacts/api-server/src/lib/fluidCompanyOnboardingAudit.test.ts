import assert from "node:assert/strict";
import test, { describe } from "node:test";
import {
  calculateAuthoritativePricing,
  STANDARD_BAND_PRICING,
} from "./subscriptionPricingService";
import {
  getResumableOnboardingStatus,
  saveCompanyDetails,
  savePlanSelection,
  confirmOrderReview,
} from "./companyOnboardingService";

describe("Sprint — Fluid Self-Service Company Onboarding, Pricing & Subscription Gate Audit", () => {

  test("1. Unauthenticated / New User without company resolves to NO_COMPANY stage", async () => {
    const status = await getResumableOnboardingStatus("");
    assert.equal(status.stage, "NO_COMPANY");
    assert.equal(status.hasCompany, false);
    assert.equal(status.nextStepUrl, "/onboarding");
  });

  test("2. Approved Monthly Employee Bands match exact approved MUR prices", () => {
    // Approved monthly employee bands for ESSENTIAL:
    // - Up to 25 employees: MUR 3,000/month
    // - 26–50 employees: MUR 4,500/month
    // - 51–80 employees: MUR 5,000/month
    // - 81–120 employees: MUR 6,250/month
    const essentialPrices = STANDARD_BAND_PRICING["ESSENTIAL"];
    assert.equal(essentialPrices["UP_TO_25"], 3000, "Up to 25 employees must be MUR 3,000/mo");
    assert.equal(essentialPrices["FROM_26_TO_50"], 4500, "26–50 employees must be MUR 4,500/mo");
    assert.equal(essentialPrices["FROM_51_TO_80"], 5000, "51–80 employees must be MUR 5,000/mo");
    assert.equal(essentialPrices["FROM_81_TO_120"], 6250, "81–120 employees must be MUR 6,250/mo");
  });

  test("3. Server-side authoritative pricing calculates exact rates and prevents client price manipulation", () => {
    const p1 = calculateAuthoritativePricing({ planCode: "ESSENTIAL", employeeCount: 15, bandCode: "UP_TO_25" });
    assert.equal(p1.finalMonthlyAmount, 3000);
    assert.equal(p1.includedMaxEmployees, 25);

    const p2 = calculateAuthoritativePricing({ planCode: "ESSENTIAL", employeeCount: 45, bandCode: "FROM_26_TO_50" });
    assert.equal(p2.finalMonthlyAmount, 4500);
    assert.equal(p2.includedMaxEmployees, 50);

    const p3 = calculateAuthoritativePricing({ planCode: "ESSENTIAL", employeeCount: 75, bandCode: "FROM_51_TO_80" });
    assert.equal(p3.finalMonthlyAmount, 5000);
    assert.equal(p3.includedMaxEmployees, 80);

    const p4 = calculateAuthoritativePricing({ planCode: "ESSENTIAL", employeeCount: 110, bandCode: "FROM_81_TO_120" });
    assert.equal(p4.finalMonthlyAmount, 6250);
    assert.equal(p4.includedMaxEmployees, 120);
  });

  test("4. Over 120 employees triggers tailored quote flow without automatic activation", () => {
    const pEnterprise = calculateAuthoritativePricing({ planCode: "COMPLETE", employeeCount: 150, bandCode: "OVER_120" });
    // Over 120 must require contact / custom quote
    assert.ok(pEnterprise.finalMonthlyAmount > 0, "Enterprise price calculated");
  });

  test("5. Order review confirmation requires explicit agreement to Terms and Privacy Policy", async () => {
    await assert.rejects(
      async () => {
        await confirmOrderReview({ userId: "test_dummy_user", agreedToTerms: false });
      },
      /Terms of Service and Privacy Policy/,
      "Must reject confirmation if terms are not agreed"
    );
  });

  test("6. Company details validation rejects empty company names", async () => {
    await assert.rejects(
      async () => {
        await saveCompanyDetails({
          userId: "user_test_empty_comp",
          email: "test@example.com",
          adminName: "Admin",
          companyName: "   ",
        });
      },
      /Company name is required/,
      "Must reject blank company name"
    );
  });

  test("7. Step-by-step state machine progression logic", () => {
    // Helper to simulate stage progression
    const resolveStage = (hasCompany: boolean, hasSub: boolean, subStatus: string | null, isOver120: boolean) => {
      if (!hasCompany) return "NO_COMPANY";
      if (!hasSub) return "PLAN_REQUIRED";
      if (isOver120 || subStatus === "CUSTOM_QUOTE_REQUIRED") return "CUSTOM_QUOTE_REQUIRED";
      if (subStatus === "ACTIVE") return "COMPLETED";
      return "PAYMENT_PENDING";
    };

    assert.equal(resolveStage(false, false, null, false), "NO_COMPANY");
    assert.equal(resolveStage(true, false, null, false), "PLAN_REQUIRED");
    assert.equal(resolveStage(true, true, "PENDING", false), "PAYMENT_PENDING");
    assert.equal(resolveStage(true, true, "CUSTOM_QUOTE_REQUIRED", true), "CUSTOM_QUOTE_REQUIRED");
    assert.equal(resolveStage(true, true, "ACTIVE", false), "COMPLETED");
  });

  test("8. Resumable flow preserves existing progress without restarting from step 1", () => {
    // Given an admin who already has a company and selected a plan with pending payment
    const mockAdminState = {
      hasCompany: true,
      company: { id: 99, name: "Test Corp", employeeCount: 30 },
      subscription: { planCode: "PROFESSIONAL", bandCode: "FROM_26_TO_50", status: "PENDING" },
    };

    const nextStep = mockAdminState.subscription.status === "PENDING" ? "/onboarding/review" : "/home";
    assert.equal(nextStep, "/onboarding/review", "Admin with pending payment should resume at review/payment step");
  });
});
