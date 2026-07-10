export const RECYCLING_SERVICE_STATUSES = [
  "NOT_CLIENT",
  "ACTIVE_CLIENT",
  "PAUSED",
  "FORMER_CLIENT",
] as const;

export type RecyclingServiceStatus =
  (typeof RECYCLING_SERVICE_STATUSES)[number];

export const RECYCLING_MATERIAL_KEYS = [
  "paperCardboardKg",
  "plasticKg",
  "glassKg",
  "aluminiumMetalKg",
  "otherKg",
] as const;

export type RecyclingMaterialKey = (typeof RECYCLING_MATERIAL_KEYS)[number];

export const RECYCLING_MATERIAL_LABELS: Record<RecyclingMaterialKey, string> = {
  paperCardboardKg: "Paper/Cardboard",
  plasticKg: "Plastic",
  glassKg: "Glass",
  aluminiumMetalKg: "Aluminium/Metal",
  otherKg: "Other",
};

export const MATERIAL_TYPE_TO_KEY: Record<string, RecyclingMaterialKey | "total"> =
  {
    total: "total",
    paper: "paperCardboardKg",
    cardboard: "paperCardboardKg",
    paper_cardboard: "paperCardboardKg",
    plastic: "plasticKg",
    glass: "glassKg",
    aluminium: "aluminiumMetalKg",
    aluminum: "aluminiumMetalKg",
    metal: "aluminiumMetalKg",
    aluminium_metal: "aluminiumMetalKg",
    other: "otherKg",
  };

export type RecyclingMaterialInput = Partial<
  Record<RecyclingMaterialKey, unknown>
>;

export interface NormalizedRecyclingMaterials {
  values: Record<RecyclingMaterialKey, string>;
  grams: Record<RecyclingMaterialKey, number>;
  totalGrams: number;
  totalKg: string;
}

export interface RecyclingTotals {
  materialTotals: Record<RecyclingMaterialKey, number>;
  totalKg: number;
  collectionsCount: number;
}

export interface RecyclingCollectionLike {
  reportingMonth: string;
  collectionDate?: Date | string | null;
  totalKg: string | number;
  paperCardboardKg: string | number;
  plasticKg: string | number;
  glassKg: string | number;
  aluminiumMetalKg: string | number;
  otherKg: string | number;
}

export interface RecyclingConversionFactorLike {
  materialType: string;
  metricName: string;
  metricLabel: string;
  factorValue: string | number;
  factorUnit: string;
  sourceName: string;
  sourceReference?: string | null;
  effectiveDate: Date | string;
  isActive: boolean;
}

export interface EstimatedEquivalent {
  metricName: string;
  metricLabel: string;
  value: number;
  unit: string;
  materialType: string;
  sourceName: string;
  sourceReference: string | null;
  effectiveDate: string;
  note: string;
  estimated: true;
}

export class RecyclingValidationError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export function parseKgToGrams(value: unknown, field = "material"): number {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value !== "string" && typeof value !== "number") {
    throw new RecyclingValidationError(`${field} must be a number`);
  }

  const text = String(value).trim();
  if (!/^\d+(\.\d{1,3})?$/.test(text)) {
    throw new RecyclingValidationError(
      `${field} must be a non-negative number with up to 3 decimal places`,
    );
  }

  const [whole, fraction = ""] = text.split(".");
  const grams =
    Number(whole) * 1000 + Number(fraction.padEnd(3, "0").slice(0, 3));
  if (!Number.isSafeInteger(grams)) {
    throw new RecyclingValidationError(`${field} is too large`);
  }
  return grams;
}

export function formatKgFromGrams(grams: number): string {
  const whole = Math.trunc(grams / 1000);
  const fraction = String(grams % 1000).padStart(3, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : String(whole);
}

export function normalizeRecyclingMaterials(
  input: RecyclingMaterialInput,
): NormalizedRecyclingMaterials {
  const grams = {} as Record<RecyclingMaterialKey, number>;
  const values = {} as Record<RecyclingMaterialKey, string>;
  let totalGrams = 0;

  for (const key of RECYCLING_MATERIAL_KEYS) {
    const parsed = parseKgToGrams(input[key], RECYCLING_MATERIAL_LABELS[key]);
    grams[key] = parsed;
    values[key] = formatKgFromGrams(parsed);
    totalGrams += parsed;
  }

  if (totalGrams <= 0) {
    throw new RecyclingValidationError(
      "At least one material weight must be greater than 0 kg",
    );
  }

  return {
    values,
    grams,
    totalGrams,
    totalKg: formatKgFromGrams(totalGrams),
  };
}

export function parseReportingMonth(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const month = value.trim();
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    throw new RecyclingValidationError("Reporting month must use YYYY-MM");
  }
  return month;
}

export function deriveReportingMonth(value: Date | string): string {
  if (typeof value === "string" && /^\d{4}-(0[1-9]|1[0-2])-\d{2}/.test(value)) {
    return value.slice(0, 7);
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new RecyclingValidationError("Collection date is invalid");
  }
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function parseCollectionDate(value: unknown): Date {
  if (typeof value !== "string" || !value.trim()) {
    throw new RecyclingValidationError("Collection date is required");
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new RecyclingValidationError("Collection date is invalid");
  }
  return date;
}

export function normalizeRecyclingStatus(
  value: unknown,
): RecyclingServiceStatus {
  if (
    typeof value === "string" &&
    RECYCLING_SERVICE_STATUSES.includes(value as RecyclingServiceStatus)
  ) {
    return value as RecyclingServiceStatus;
  }
  throw new RecyclingValidationError("Invalid Recyclean service status");
}

function numericKg(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === "") return 0;
  return Number(value);
}

export function summarizeRecyclingRecords(
  records: RecyclingCollectionLike[],
): RecyclingTotals {
  const materialTotals: Record<RecyclingMaterialKey, number> = {
    paperCardboardKg: 0,
    plasticKg: 0,
    glassKg: 0,
    aluminiumMetalKg: 0,
    otherKg: 0,
  };
  let totalKg = 0;

  for (const record of records) {
    totalKg += numericKg(record.totalKg);
    for (const key of RECYCLING_MATERIAL_KEYS) {
      materialTotals[key] += numericKg(record[key]);
    }
  }

  return {
    materialTotals,
    totalKg,
    collectionsCount: records.length,
  };
}

export function getMonthlyTrend(records: RecyclingCollectionLike[]) {
  const map = new Map<string, RecyclingTotals>();
  for (const record of records) {
    const current = map.get(record.reportingMonth) ?? {
      materialTotals: {
        paperCardboardKg: 0,
        plasticKg: 0,
        glassKg: 0,
        aluminiumMetalKg: 0,
        otherKg: 0,
      },
      totalKg: 0,
      collectionsCount: 0,
    };
    current.totalKg += numericKg(record.totalKg);
    current.collectionsCount += 1;
    for (const key of RECYCLING_MATERIAL_KEYS) {
      current.materialTotals[key] += numericKg(record[key]);
    }
    map.set(record.reportingMonth, current);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, totals]) => ({ month, ...totals }));
}

export function buildEstimatedEquivalents(
  totals: RecyclingTotals,
  factors: RecyclingConversionFactorLike[],
): EstimatedEquivalent[] {
  return factors
    .filter((factor) => factor.isActive)
    .map((factor) => {
      const sourceMaterial = MATERIAL_TYPE_TO_KEY[factor.materialType] ?? null;
      if (!sourceMaterial) return null;
      const sourceKg =
        sourceMaterial === "total"
          ? totals.totalKg
          : totals.materialTotals[sourceMaterial];
      if (sourceKg <= 0) return null;
      const factorValue = Number(factor.factorValue);
      if (!Number.isFinite(factorValue) || factorValue <= 0) return null;

      return {
        metricName: factor.metricName,
        metricLabel: factor.metricLabel,
        value: Number((sourceKg * factorValue).toFixed(2)),
        unit: factor.factorUnit,
        materialType: factor.materialType,
        sourceName: factor.sourceName,
        sourceReference: factor.sourceReference ?? null,
        effectiveDate:
          factor.effectiveDate instanceof Date
            ? factor.effectiveDate.toISOString()
            : new Date(factor.effectiveDate).toISOString(),
        note:
          "Estimated using an active Recyclean conversion factor. Verified primary data is the collected kg value.",
        estimated: true,
      } satisfies EstimatedEquivalent;
    })
    .filter((value): value is EstimatedEquivalent => Boolean(value));
}
