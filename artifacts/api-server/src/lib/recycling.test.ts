import assert from "node:assert/strict";
import test from "node:test";
import {
  buildEstimatedEquivalents,
  deriveReportingMonth,
  normalizeRecyclingMaterials,
  normalizeRecyclingStatus,
  RecyclingValidationError,
  summarizeRecyclingRecords,
} from "./recycling";

test("collection materials are decimal-safe and total Ferney June 2026 correctly", () => {
  const result = normalizeRecyclingMaterials({
    plasticKg: "5.6",
    glassKg: "116.9",
    paperCardboardKg: "36.7",
    aluminiumMetalKg: "0",
    otherKg: "0",
  });

  assert.equal(result.totalKg, "159.2");
  assert.equal(result.values.plasticKg, "5.6");
  assert.equal(result.values.glassKg, "116.9");
  assert.equal(result.values.paperCardboardKg, "36.7");
});

test("collection materials reject negative and all-zero entries", () => {
  assert.throws(
    () => normalizeRecyclingMaterials({ plasticKg: "-1" }),
    RecyclingValidationError,
  );
  assert.throws(
    () =>
      normalizeRecyclingMaterials({
        plasticKg: "0",
        glassKg: "0",
        paperCardboardKg: "0",
        aluminiumMetalKg: "0",
        otherKg: "0",
      }),
    /greater than 0 kg/,
  );
});

test("reporting month is derived from the collection date", () => {
  assert.equal(deriveReportingMonth("2026-06-15"), "2026-06");
  assert.equal(
    deriveReportingMonth(new Date("2026-07-04T08:00:00.000Z")),
    "2026-07",
  );
});

test("service status validation accepts only known Recyclean states", () => {
  assert.equal(normalizeRecyclingStatus("ACTIVE_CLIENT"), "ACTIVE_CLIENT");
  assert.throws(
    () => normalizeRecyclingStatus("ACTIVE"),
    /Invalid Recyclean service status/,
  );
});

test("summaries roll up material and collection totals", () => {
  const totals = summarizeRecyclingRecords([
    {
      reportingMonth: "2026-06",
      totalKg: "159.2",
      paperCardboardKg: "36.7",
      plasticKg: "5.6",
      glassKg: "116.9",
      aluminiumMetalKg: "0",
      otherKg: "0",
    },
    {
      reportingMonth: "2026-07",
      totalKg: "10",
      paperCardboardKg: "2",
      plasticKg: "3",
      glassKg: "4",
      aluminiumMetalKg: "1",
      otherKg: "0",
    },
  ]);

  assert.equal(totals.collectionsCount, 2);
  assert.equal(Number(totals.totalKg.toFixed(1)), 169.2);
  assert.equal(Number(totals.materialTotals.glassKg.toFixed(1)), 120.9);
});

test("equivalents stay hidden without active sourced factors and render as estimates when configured", () => {
  const totals = summarizeRecyclingRecords([
    {
      reportingMonth: "2026-06",
      totalKg: "100",
      paperCardboardKg: "100",
      plasticKg: "0",
      glassKg: "0",
      aluminiumMetalKg: "0",
      otherKg: "0",
    },
  ]);

  assert.deepEqual(buildEstimatedEquivalents(totals, []), []);
  assert.deepEqual(
    buildEstimatedEquivalents(totals, [
      {
        materialType: "total",
        metricName: "sample_metric",
        metricLabel: "Sample metric",
        factorValue: "2",
        factorUnit: "units",
        sourceName: "Example source",
        sourceReference: "Internal policy",
        effectiveDate: "2026-01-01T00:00:00.000Z",
        isActive: false,
      },
    ]),
    [],
  );

  const [equivalent] = buildEstimatedEquivalents(totals, [
    {
      materialType: "paper_cardboard",
      metricName: "sample_metric",
      metricLabel: "Sample metric",
      factorValue: "1.5",
      factorUnit: "units",
      sourceName: "Example source",
      sourceReference: "Internal policy",
      effectiveDate: "2026-01-01T00:00:00.000Z",
      isActive: true,
    },
  ]);

  assert.equal(equivalent?.estimated, true);
  assert.equal(equivalent?.value, 150);
  assert.match(equivalent?.note ?? "", /Estimated/);
});
