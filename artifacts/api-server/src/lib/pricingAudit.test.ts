import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { resolveBandCodeFromEmployeeCount } from "./ensureHybridSubscriptions";
import { PER_EMPLOYEE_COST_MAP } from "./pricingConstants";

describe("Sprint 9S — Pricing Band Mapping & Per-Employee Calculation Tests", () => {
  describe("Workstream C — Boundary Mapping Tests", () => {
    test("1 employee maps to UP_TO_25", () => {
      assert.equal(resolveBandCodeFromEmployeeCount(1), "UP_TO_25");
    });

    test("25 employees maps to UP_TO_25", () => {
      assert.equal(resolveBandCodeFromEmployeeCount(25), "UP_TO_25");
    });

    test("26 employees maps to FROM_26_TO_50", () => {
      assert.equal(resolveBandCodeFromEmployeeCount(26), "FROM_26_TO_50");
    });

    test("50 employees maps to FROM_26_TO_50", () => {
      assert.equal(resolveBandCodeFromEmployeeCount(50), "FROM_26_TO_50");
    });

    test("51 employees maps to FROM_51_TO_80", () => {
      assert.equal(resolveBandCodeFromEmployeeCount(51), "FROM_51_TO_80");
    });

    test("80 employees maps to FROM_51_TO_80", () => {
      assert.equal(resolveBandCodeFromEmployeeCount(80), "FROM_51_TO_80");
    });

    test("81 employees maps to FROM_81_TO_120", () => {
      assert.equal(resolveBandCodeFromEmployeeCount(81), "FROM_81_TO_120");
    });

    test("120 employees maps to FROM_81_TO_120", () => {
      assert.equal(resolveBandCodeFromEmployeeCount(120), "FROM_81_TO_120");
    });

    test("121 employees maps to OVER_120 (Tailored quote)", () => {
      assert.equal(resolveBandCodeFromEmployeeCount(121), "OVER_120");
    });

    test("0 or negative values fallback safely to UP_TO_25", () => {
      assert.equal(resolveBandCodeFromEmployeeCount(0), "UP_TO_25");
      assert.equal(resolveBandCodeFromEmployeeCount(-5), "UP_TO_25");
    });
  });

  describe("Workstream B — Per-Employee Calculations & Display Rounding", () => {
    test("Band 1: 3,000 / 25 = 120", () => {
      const calc = 3000 / 25;
      assert.equal(calc, 120);
      assert.equal(PER_EMPLOYEE_COST_MAP["UP_TO_25"], "From MUR 120 per employee/month");
    });

    test("Band 2: 4,500 / 50 = 90", () => {
      const calc = 4500 / 50;
      assert.equal(calc, 90);
      assert.equal(PER_EMPLOYEE_COST_MAP["FROM_26_TO_50"], "From MUR 90 per employee/month");
    });

    test("Band 3: 5,000 / 80 = 62.50", () => {
      const calc = (5000 / 80).toFixed(2);
      assert.equal(calc, "62.50");
      assert.equal(PER_EMPLOYEE_COST_MAP["FROM_51_TO_80"], "From MUR 62.50 per employee/month");
    });

    test("Band 4: 6,250 / 120 = 52.0833... -> 52.08 after display rounding", () => {
      const raw = 6250 / 120;
      const rounded = raw.toFixed(2);
      assert.equal(rounded, "52.08");
      assert.equal(PER_EMPLOYEE_COST_MAP["FROM_81_TO_120"], "From MUR 52.08 per employee/month");
    });

    test("Actual headcount calculation: 4,500 / 38 = 118.42 after display rounding", () => {
      const raw = 4500 / 38;
      const rounded = raw.toFixed(2);
      assert.equal(rounded, "118.42");
    });

    test("More than 120 employees shows transparent per-employee copy", () => {
      assert.equal(
        PER_EMPLOYEE_COST_MAP["OVER_120"],
        "From MUR 30 per employee/month"
      );
    });
  });
});
