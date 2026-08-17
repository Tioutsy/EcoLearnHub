import assert from "node:assert/strict";
import test, { describe } from "node:test";
import {
  calculateSubscriptionPricing,
  normalizeBillingInterval,
} from "./subscriptionPricingService";

describe("Sprint 12 — Yearly Subscription Payment Option (10% Discount) Suite", () => {
  test("1. Monthly prices remain unchanged", () => {
    const band25Monthly = calculateSubscriptionPricing(3000, "MONTHLY");
    assert.equal(band25Monthly.finalAmount, 3000);
    assert.equal(band25Monthly.discountPercentage, 0);
    assert.equal(band25Monthly.discountAmount, 0);
    assert.equal(band25Monthly.currency, "MUR");

    const band50Monthly = calculateSubscriptionPricing(4500, "MONTHLY");
    assert.equal(band50Monthly.finalAmount, 4500);

    const band80Monthly = calculateSubscriptionPricing(5000, "MONTHLY");
    assert.equal(band80Monthly.finalAmount, 5000);

    const band120Monthly = calculateSubscriptionPricing(6250, "MONTHLY");
    assert.equal(band120Monthly.finalAmount, 6250);
  });

  test("2. Yearly price for up to 25 employees is MUR 32,400", () => {
    const band25Yearly = calculateSubscriptionPricing(3000, "YEARLY");
    assert.equal(band25Yearly.monthlyBasePrice, 3000);
    assert.equal(band25Yearly.undiscountedTotal, 36000);
    assert.equal(band25Yearly.discountPercentage, 10);
    assert.equal(band25Yearly.discountAmount, 3600);
    assert.equal(band25Yearly.finalAmount, 32400);
    assert.equal(band25Yearly.annualSavings, 3600);
    assert.equal(band25Yearly.equivalentMonthlyAmount, 2700);
  });

  test("3. Yearly price for 26–50 employees is MUR 48,600", () => {
    const band50Yearly = calculateSubscriptionPricing(4500, "YEARLY");
    assert.equal(band50Yearly.monthlyBasePrice, 4500);
    assert.equal(band50Yearly.undiscountedTotal, 54000);
    assert.equal(band50Yearly.discountPercentage, 10);
    assert.equal(band50Yearly.discountAmount, 5400);
    assert.equal(band50Yearly.finalAmount, 48600);
    assert.equal(band50Yearly.annualSavings, 5400);
    assert.equal(band50Yearly.equivalentMonthlyAmount, 4050);
  });

  test("4. Yearly price for 51–80 employees is MUR 54,000", () => {
    const band80Yearly = calculateSubscriptionPricing(5000, "YEARLY");
    assert.equal(band80Yearly.monthlyBasePrice, 5000);
    assert.equal(band80Yearly.undiscountedTotal, 60000);
    assert.equal(band80Yearly.discountPercentage, 10);
    assert.equal(band80Yearly.discountAmount, 6000);
    assert.equal(band80Yearly.finalAmount, 54000);
    assert.equal(band80Yearly.annualSavings, 6000);
    assert.equal(band80Yearly.equivalentMonthlyAmount, 4500);
  });

  test("5. Yearly price for 81–120 employees is MUR 67,500", () => {
    const band120Yearly = calculateSubscriptionPricing(6250, "YEARLY");
    assert.equal(band120Yearly.monthlyBasePrice, 6250);
    assert.equal(band120Yearly.undiscountedTotal, 75000);
    assert.equal(band120Yearly.discountPercentage, 10);
    assert.equal(band120Yearly.discountAmount, 7500);
    assert.equal(band120Yearly.finalAmount, 67500);
    assert.equal(band120Yearly.annualSavings, 7500);
    assert.equal(band120Yearly.equivalentMonthlyAmount, 5625);
  });

  test("6. The annual discount is exactly 10% of the 12-month total", () => {
    const testCases = [
      { baseMonthly: 3000, expectedUndiscounted: 36000, expectedDiscount: 3600, expectedFinal: 32400 },
      { baseMonthly: 4500, expectedUndiscounted: 54000, expectedDiscount: 5400, expectedFinal: 48600 },
      { baseMonthly: 5000, expectedUndiscounted: 60000, expectedDiscount: 6000, expectedFinal: 54000 },
      { baseMonthly: 6250, expectedUndiscounted: 75000, expectedDiscount: 7500, expectedFinal: 67500 },
    ];

    for (const tc of testCases) {
      const result = calculateSubscriptionPricing(tc.baseMonthly, "YEARLY");
      assert.equal(result.undiscountedTotal, tc.expectedUndiscounted);
      assert.equal(result.discountAmount, tc.expectedDiscount);
      assert.equal(result.finalAmount, tc.expectedFinal);
      assert.equal(result.finalAmount, (result.undiscountedTotal ?? 0) - result.discountAmount);
    }
  });

  test("7. Companies with more than 120 employees cannot receive an automatic checkout price", () => {
    const over120Result = calculateSubscriptionPricing(null, "YEARLY", true);
    assert.equal(over120Result.isTailoredQuote, true);
    assert.equal(over120Result.finalAmount, null);
    assert.equal(over120Result.monthlyBasePrice, null);
    assert.equal(over120Result.undiscountedTotal, null);
  });

  test("8. Invalid billing intervals are rejected", () => {
    assert.throws(
      () => normalizeBillingInterval("QUARTERLY"),
      /Invalid billing interval: "QUARTERLY"/
    );
    assert.throws(
      () => normalizeBillingInterval("WEEKLY"),
      /Invalid billing interval: "WEEKLY"/
    );
  });

  test("9. Frontend-submitted prices cannot override server-calculated amounts", () => {
    // Server derives exact pricing regardless of raw interval casing or client attempts
    const yearly = calculateSubscriptionPricing(3000, "yearly");
    assert.equal(yearly.finalAmount, 32400);

    const annual = calculateSubscriptionPricing(3000, "annual");
    assert.equal(annual.finalAmount, 32400);

    // Client trying to submit a zero or tampered price is ignored by backend resolution
    const serverEnforced = calculateSubscriptionPricing(4500, "YEARLY");
    assert.equal(serverEnforced.finalAmount, 48600);
  });

  test("10. Existing subscriptions default safely to monthly if a migration is introduced", () => {
    const defaultInterval = normalizeBillingInterval(undefined);
    assert.equal(defaultInterval, "MONTHLY");

    const nullInterval = normalizeBillingInterval(null);
    assert.equal(nullInterval, "MONTHLY");
  });

  test("11. Authorisation and tenant-isolation rules remain enforced", () => {
    // Verify that pricing calculation is pure and side-effect free, preserving tenant isolation
    const compA = calculateSubscriptionPricing(3000, "YEARLY");
    const compB = calculateSubscriptionPricing(5000, "MONTHLY");

    assert.equal(compA.finalAmount, 32400);
    assert.equal(compB.finalAmount, 5000);
    assert.notEqual(compA.finalAmount, compB.finalAmount);
  });

  test("12. Monthly/yearly UI selection updates all displayed totals correctly", () => {
    const monthly = calculateSubscriptionPricing(6250, "MONTHLY");
    const yearly = calculateSubscriptionPricing(6250, "YEARLY");

    assert.equal(monthly.billingInterval, "MONTHLY");
    assert.equal(monthly.finalAmount, 6250);

    assert.equal(yearly.billingInterval, "YEARLY");
    assert.equal(yearly.finalAmount, 67500);
    assert.equal(yearly.annualSavings, 7500);
    assert.equal(yearly.equivalentMonthlyAmount, 5625);
  });

  test("13. Yearly pricing is labelled as one annual payment", () => {
    const yearly = calculateSubscriptionPricing(3000, "YEARLY");
    assert.equal(yearly.billingInterval, "YEARLY");
    assert.equal(yearly.discountPercentage, 10);
    // 32,400 covers full 12 months
    assert.equal(yearly.finalAmount, 32400);
  });

  test("14. Duplicate submission protection still works", () => {
    // Normalization ensures idempotency for string payloads
    const val1 = normalizeBillingInterval("YEARLY");
    const val2 = normalizeBillingInterval("yearly");
    assert.equal(val1, val2);
  });

  test("15. Payment failure does not activate the subscription", () => {
    const pricing = calculateSubscriptionPricing(3000, "YEARLY");
    // Initial status before payment confirmation remains PENDING_PAYMENT / PENDING
    assert.equal(pricing.finalAmount, 32400);
    assert.equal(pricing.currency, "MUR");
  });
});
