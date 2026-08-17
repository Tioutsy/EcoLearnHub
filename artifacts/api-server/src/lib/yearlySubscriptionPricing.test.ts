import assert from "node:assert/strict";
import test, { describe } from "node:test";
import {
  calculateSubscriptionPricing,
  calculateEnterprisePricing,
  calculateAuthoritativePricing,
  normalizeBillingInterval,
  normalizePlanCode,
} from "./subscriptionPricingService";

describe("Sprint 12 & Enterprise — Subscription Payment Option & Dynamic Large-Company Pricing Suite", () => {
  describe("1. Standard Bands (1–120 Employees) Preservation", () => {
    test("Monthly prices remain unchanged for 1–120 employees", () => {
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

    test("Yearly prices for 1–120 employees are preserved with exact 10% discount", () => {
      // 1-25: 3,000 * 12 = 36,000 - 3,600 = 32,400
      const b25 = calculateSubscriptionPricing(3000, "YEARLY");
      assert.equal(b25.finalAmount, 32400);
      assert.equal(b25.annualSavings, 3600);

      // 26-50: 4,500 * 12 = 54,000 - 5,400 = 48,600
      const b50 = calculateSubscriptionPricing(4500, "YEARLY");
      assert.equal(b50.finalAmount, 48600);
      assert.equal(b50.annualSavings, 5400);

      // 51-80: 5,000 * 12 = 60,000 - 6,000 = 54,000
      const b80 = calculateSubscriptionPricing(5000, "YEARLY");
      assert.equal(b80.finalAmount, 54000);
      assert.equal(b80.annualSavings, 6000);

      // 81-120: 6,250 * 12 = 75,000 - 7,500 = 67,500
      const b120 = calculateSubscriptionPricing(6250, "YEARLY");
      assert.equal(b120.finalAmount, 67500);
      assert.equal(b120.annualSavings, 7500);
    });
  });

  describe("2. Transparent Large-Company Pricing (121 to 1,000+ Employees)", () => {
    test("Essential Package — 121 to 1,000 employees test cases", () => {
      // 120 employees: standard band (MUR 6,250/mo | MUR 67,500/yr)
      const e120 = calculateAuthoritativePricing({ planCode: "ESSENTIAL", employeeCount: 120, billingInterval: "MONTHLY" });
      assert.equal(e120.finalMonthlyAmount, 6250);
      const e120y = calculateAuthoritativePricing({ planCode: "ESSENTIAL", employeeCount: 120, billingInterval: "YEARLY" });
      assert.equal(e120y.finalYearlyAmount, 67500);

      // 121 employees: base tier (MUR 7,500/mo | MUR 81,000/yr)
      const e121m = calculateEnterprisePricing({ planCode: "ESSENTIAL", employeeCount: 121, billingInterval: "MONTHLY" });
      assert.equal(e121m.finalMonthlyAmount, 7500);
      assert.equal(e121m.additionalBlocks, 0);
      const e121y = calculateEnterprisePricing({ planCode: "ESSENTIAL", employeeCount: 121, billingInterval: "YEARLY" });
      assert.equal(e121y.finalYearlyAmount, 81000);
      assert.equal(e121y.annualSavings, 9000);

      // 250 employees: base tier limit (MUR 7,500/mo | MUR 81,000/yr)
      const e250m = calculateEnterprisePricing({ planCode: "ESSENTIAL", employeeCount: 250, billingInterval: "MONTHLY" });
      assert.equal(e250m.finalMonthlyAmount, 7500);
      assert.equal(e250m.additionalBlocks, 0);
      const e250y = calculateEnterprisePricing({ planCode: "ESSENTIAL", employeeCount: 250, billingInterval: "YEARLY" });
      assert.equal(e250y.finalYearlyAmount, 81000);

      // 251 employees: 1 additional block (+1,000) -> MUR 8,500/mo | MUR 91,800/yr
      const e251m = calculateEnterprisePricing({ planCode: "ESSENTIAL", employeeCount: 251, billingInterval: "MONTHLY" });
      assert.equal(e251m.additionalBlocks, 1);
      assert.equal(e251m.finalMonthlyAmount, 8500);
      const e251y = calculateEnterprisePricing({ planCode: "ESSENTIAL", employeeCount: 251, billingInterval: "YEARLY" });
      assert.equal(e251y.finalYearlyAmount, 91800); // (8500 * 12) = 102000 - 10200 = 91800
      assert.equal(e251y.includedMaxEmployees, 300);

      // 275 employees: 1 additional block (+1,000) -> MUR 8,500/mo | MUR 91,800/yr
      const e275m = calculateEnterprisePricing({ planCode: "ESSENTIAL", employeeCount: 275, billingInterval: "MONTHLY" });
      assert.equal(e275m.additionalBlocks, 1);
      assert.equal(e275m.finalMonthlyAmount, 8500);
      const e275y = calculateEnterprisePricing({ planCode: "ESSENTIAL", employeeCount: 275, billingInterval: "YEARLY" });
      assert.equal(e275y.finalYearlyAmount, 91800);

      // 300 employees: 1 additional block (+1,000) -> MUR 8,500/mo | MUR 91,800/yr
      const e300m = calculateEnterprisePricing({ planCode: "ESSENTIAL", employeeCount: 300, billingInterval: "MONTHLY" });
      assert.equal(e300m.additionalBlocks, 1);
      assert.equal(e300m.finalMonthlyAmount, 8500);
      const e300y = calculateEnterprisePricing({ planCode: "ESSENTIAL", employeeCount: 300, billingInterval: "YEARLY" });
      assert.equal(e300y.finalYearlyAmount, 91800);

      // 301 employees: 2 additional blocks (+2,000) -> MUR 9,500/mo | MUR 102,600/yr
      const e301m = calculateEnterprisePricing({ planCode: "ESSENTIAL", employeeCount: 301, billingInterval: "MONTHLY" });
      assert.equal(e301m.additionalBlocks, 2);
      assert.equal(e301m.finalMonthlyAmount, 9500);
      const e301y = calculateEnterprisePricing({ planCode: "ESSENTIAL", employeeCount: 301, billingInterval: "YEARLY" });
      assert.equal(e301y.finalYearlyAmount, 102600);
      assert.equal(e301y.includedMaxEmployees, 350);

      // 351 employees: 3 additional blocks (+3,000) -> MUR 10,500/mo | MUR 113,400/yr
      const e351m = calculateEnterprisePricing({ planCode: "ESSENTIAL", employeeCount: 351, billingInterval: "MONTHLY" });
      assert.equal(e351m.additionalBlocks, 3);
      assert.equal(e351m.finalMonthlyAmount, 10500);
      const e351y = calculateEnterprisePricing({ planCode: "ESSENTIAL", employeeCount: 351, billingInterval: "YEARLY" });
      assert.equal(e351y.finalYearlyAmount, 113400);

      // 500 employees: 5 additional blocks (+5,000) -> MUR 12,500/mo | MUR 135,000/yr
      const e500m = calculateEnterprisePricing({ planCode: "ESSENTIAL", employeeCount: 500, billingInterval: "MONTHLY" });
      assert.equal(e500m.additionalBlocks, 5);
      assert.equal(e500m.finalMonthlyAmount, 12500);
      const e500y = calculateEnterprisePricing({ planCode: "ESSENTIAL", employeeCount: 500, billingInterval: "YEARLY" });
      assert.equal(e500y.finalYearlyAmount, 135000);

      // 1,000 employees: 15 additional blocks (+15,000) -> MUR 22,500/mo | MUR 243,000/yr
      const e1000m = calculateEnterprisePricing({ planCode: "ESSENTIAL", employeeCount: 1000, billingInterval: "MONTHLY" });
      assert.equal(e1000m.additionalBlocks, 15);
      assert.equal(e1000m.finalMonthlyAmount, 22500);
      const e1000y = calculateEnterprisePricing({ planCode: "ESSENTIAL", employeeCount: 1000, billingInterval: "YEARLY" });
      assert.equal(e1000y.finalYearlyAmount, 243000); // 22500*12 = 270000 - 27000 = 243000
    });

    test("Professional Package — 121 to 1,000 employees test cases", () => {
      // 121 employees: base tier (MUR 9,500/mo | MUR 102,600/yr)
      const p121m = calculateEnterprisePricing({ planCode: "PROFESSIONAL", employeeCount: 121, billingInterval: "MONTHLY" });
      assert.equal(p121m.finalMonthlyAmount, 9500);
      const p121y = calculateEnterprisePricing({ planCode: "PROFESSIONAL", employeeCount: 121, billingInterval: "YEARLY" });
      assert.equal(p121y.finalYearlyAmount, 102600); // 114,000 - 11,400

      // 250 employees: base tier (MUR 9,500/mo | MUR 102,600/yr)
      const p250y = calculateEnterprisePricing({ planCode: "PROFESSIONAL", employeeCount: 250, billingInterval: "YEARLY" });
      assert.equal(p250y.finalYearlyAmount, 102600);

      // 251 employees: 1 additional block (+1,250) -> MUR 10,750/mo | MUR 116,100/yr
      const p251m = calculateEnterprisePricing({ planCode: "PROFESSIONAL", employeeCount: 251, billingInterval: "MONTHLY" });
      assert.equal(p251m.additionalBlocks, 1);
      assert.equal(p251m.finalMonthlyAmount, 10750);
      const p251y = calculateEnterprisePricing({ planCode: "PROFESSIONAL", employeeCount: 251, billingInterval: "YEARLY" });
      assert.equal(p251y.finalYearlyAmount, 116100); // 10750*12 = 129000 - 12900 = 116100

      // 275 employees: 1 additional block (+1,250) -> MUR 10,750/mo | MUR 116,100/yr
      const p275y = calculateEnterprisePricing({ planCode: "PROFESSIONAL", employeeCount: 275, billingInterval: "YEARLY" });
      assert.equal(p275y.finalYearlyAmount, 116100);

      // 301 employees: 2 additional blocks (+2,500) -> MUR 12,000/mo | MUR 129,600/yr
      const p301m = calculateEnterprisePricing({ planCode: "PROFESSIONAL", employeeCount: 301, billingInterval: "MONTHLY" });
      assert.equal(p301m.additionalBlocks, 2);
      assert.equal(p301m.finalMonthlyAmount, 12000);
      const p301y = calculateEnterprisePricing({ planCode: "PROFESSIONAL", employeeCount: 301, billingInterval: "YEARLY" });
      assert.equal(p301y.finalYearlyAmount, 129600); // 12000*12 = 144000 - 14400 = 129600

      // 351 employees: 3 additional blocks (+3,750) -> MUR 13,250/mo | MUR 143,100/yr
      const p351y = calculateEnterprisePricing({ planCode: "PROFESSIONAL", employeeCount: 351, billingInterval: "YEARLY" });
      assert.equal(p351y.finalYearlyAmount, 143100); // 13250*12 = 159000 - 15900 = 143100

      // 500 employees: 5 additional blocks (+6,250) -> MUR 15,750/mo | MUR 170,100/yr
      const p500y = calculateEnterprisePricing({ planCode: "PROFESSIONAL", employeeCount: 500, billingInterval: "YEARLY" });
      assert.equal(p500y.finalYearlyAmount, 170100); // 15750*12 = 189000 - 18900 = 170100

      // 1,000 employees: 15 additional blocks (+18,750) -> MUR 28,250/mo | MUR 305,100/yr
      const p1000m = calculateEnterprisePricing({ planCode: "PROFESSIONAL", employeeCount: 1000, billingInterval: "MONTHLY" });
      assert.equal(p1000m.finalMonthlyAmount, 28250);
      const p1000y = calculateEnterprisePricing({ planCode: "PROFESSIONAL", employeeCount: 1000, billingInterval: "YEARLY" });
      assert.equal(p1000y.finalYearlyAmount, 305100); // 28250*12 = 339000 - 33900 = 305100
    });

    test("Complete Package — 121 to 1,000 employees test cases", () => {
      // 121 employees: base tier (MUR 12,500/mo | MUR 135,000/yr)
      const c121m = calculateEnterprisePricing({ planCode: "COMPLETE", employeeCount: 121, billingInterval: "MONTHLY" });
      assert.equal(c121m.finalMonthlyAmount, 12500);
      const c121y = calculateEnterprisePricing({ planCode: "COMPLETE", employeeCount: 121, billingInterval: "YEARLY" });
      assert.equal(c121y.finalYearlyAmount, 135000); // 150,000 - 15,000 = 135,000

      // 250 employees: base tier (MUR 12,500/mo | MUR 135,000/yr)
      const c250y = calculateEnterprisePricing({ planCode: "COMPLETE", employeeCount: 250, billingInterval: "YEARLY" });
      assert.equal(c250y.finalYearlyAmount, 135000);

      // 251 employees: 1 additional block (+1,500) -> MUR 14,000/mo | MUR 151,200/yr
      const c251m = calculateEnterprisePricing({ planCode: "COMPLETE", employeeCount: 251, billingInterval: "MONTHLY" });
      assert.equal(c251m.additionalBlocks, 1);
      assert.equal(c251m.finalMonthlyAmount, 14000);
      const c251y = calculateEnterprisePricing({ planCode: "COMPLETE", employeeCount: 251, billingInterval: "YEARLY" });
      assert.equal(c251y.finalYearlyAmount, 151200); // 14000*12 = 168000 - 16800 = 151200

      // 275 employees: 1 additional block (+1,500) -> MUR 14,000/mo | MUR 151,200/yr
      const c275y = calculateEnterprisePricing({ planCode: "COMPLETE", employeeCount: 275, billingInterval: "YEARLY" });
      assert.equal(c275y.finalYearlyAmount, 151200);

      // 301 employees: 2 additional blocks (+3,000) -> MUR 15,500/mo | MUR 167,400/yr
      const c301m = calculateEnterprisePricing({ planCode: "COMPLETE", employeeCount: 301, billingInterval: "MONTHLY" });
      assert.equal(c301m.additionalBlocks, 2);
      assert.equal(c301m.finalMonthlyAmount, 15500);
      const c301y = calculateEnterprisePricing({ planCode: "COMPLETE", employeeCount: 301, billingInterval: "YEARLY" });
      assert.equal(c301y.finalYearlyAmount, 167400); // 15500*12 = 186000 - 18600 = 167400

      // 351 employees: 3 additional blocks (+4,500) -> MUR 17,000/mo | MUR 183,600/yr
      const c351y = calculateEnterprisePricing({ planCode: "COMPLETE", employeeCount: 351, billingInterval: "YEARLY" });
      assert.equal(c351y.finalYearlyAmount, 183600); // 17000*12 = 204000 - 20400 = 183600

      // 500 employees: 5 additional blocks (+7,500) -> MUR 20,000/mo | MUR 216,000/yr
      const c500y = calculateEnterprisePricing({ planCode: "COMPLETE", employeeCount: 500, billingInterval: "YEARLY" });
      assert.equal(c500y.finalYearlyAmount, 216000); // 20000*12 = 240000 - 24000 = 216000

      // 1,000 employees: 15 additional blocks (+22,500) -> MUR 35,000/mo | MUR 378,000/yr
      const c1000m = calculateEnterprisePricing({ planCode: "COMPLETE", employeeCount: 1000, billingInterval: "MONTHLY" });
      assert.equal(c1000m.finalMonthlyAmount, 35000);
      const c1000y = calculateEnterprisePricing({ planCode: "COMPLETE", employeeCount: 1000, billingInterval: "YEARLY" });
      assert.equal(c1000y.finalYearlyAmount, 378000); // 35000*12 = 420000 - 42000 = 378000
    });
  });

  describe("3. Input Validation & Error Handling", () => {
    test("Rejects non-integer, zero, negative, or invalid headcount", () => {
      assert.throws(() => calculateEnterprisePricing({ planCode: "ESSENTIAL", employeeCount: 0 }), /greater than zero/);
      assert.throws(() => calculateEnterprisePricing({ planCode: "ESSENTIAL", employeeCount: -10 }), /greater than zero/);
      assert.throws(() => calculateEnterprisePricing({ planCode: "ESSENTIAL", employeeCount: 125.5 }), /must be an integer/);
      assert.throws(() => calculateEnterprisePricing({ planCode: "ESSENTIAL", employeeCount: NaN }), /Missing or invalid employee count/);
    });

    test("Rejects unsupported plan codes or billing intervals", () => {
      assert.throws(() => normalizePlanCode("CUSTOM_ENTERPRISE"), /Unsupported package/);
      assert.throws(() => normalizeBillingInterval("QUARTERLY"), /Invalid billing interval/);
    });
  });
});
