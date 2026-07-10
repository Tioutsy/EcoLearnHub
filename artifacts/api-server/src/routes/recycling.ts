import { Router, type Response } from "express";
import {
  and,
  asc,
  desc,
  eq,
  gte,
  ilike,
  lte,
  or,
} from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import {
  companiesTable,
  db,
  recyclingCollectionsTable,
  recyclingConversionFactorsTable,
  recyclingEnquiriesTable,
} from "@workspace/db";
import {
  buildEstimatedEquivalents,
  deriveReportingMonth,
  getMonthlyTrend,
  normalizeRecyclingMaterials,
  normalizeRecyclingStatus,
  parseCollectionDate,
  parseReportingMonth,
  RECYCLING_MATERIAL_KEYS,
  RecyclingValidationError,
  summarizeRecyclingRecords,
  type RecyclingMaterialInput,
} from "../lib/recycling";
import {
  HttpError,
  requireCompanyAdmin,
  requirePlatformAdmin,
  sendHttpError,
} from "../lib/access";

const router = Router();

interface RecyclingFilters {
  month?: string;
  fromMonth?: string;
  toMonth?: string;
  site?: string;
}

type CompanyUpdate = Partial<typeof companiesTable.$inferInsert>;
type CollectionRecord = typeof recyclingCollectionsTable.$inferSelect;

function readText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function hasOwn(body: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(body, key);
}

function parseId(value: string | undefined): number | null {
  if (!value || !/^\d+$/.test(value)) return null;
  const id = Number(value);
  return Number.isInteger(id) ? id : null;
}

function queryText(value: unknown): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === "string" && raw.trim() ? raw.trim() : undefined;
}

function parseFilters(query: Record<string, unknown>): RecyclingFilters {
  return {
    month: parseReportingMonth(queryText(query.month)) ?? undefined,
    fromMonth: parseReportingMonth(queryText(query.fromMonth)) ?? undefined,
    toMonth: parseReportingMonth(queryText(query.toMonth)) ?? undefined,
    site: queryText(query.site),
  };
}

function serializeCompany(
  company: typeof companiesTable.$inferSelect,
  includeInternalNotes = false,
) {
  return {
    id: company.id,
    name: company.name,
    slug: company.slug,
    industry: company.industry,
    recyclingServiceStatus: company.recyclingServiceStatus,
    recycleanCustomerRef: company.recycleanCustomerRef,
    recyclingServiceStartDate:
      company.recyclingServiceStartDate?.toISOString() ?? null,
    defaultCollectionSiteName: company.defaultCollectionSiteName,
    recyclingServiceFrequency: company.recyclingServiceFrequency,
    ...(includeInternalNotes
      ? { recyclingInternalNotes: company.recyclingInternalNotes }
      : {}),
  };
}

function serializeCollection(record: CollectionRecord) {
  return {
    id: record.id,
    companyId: record.companyId,
    siteName: record.siteName,
    collectionDate: record.collectionDate.toISOString(),
    reportingMonth: record.reportingMonth,
    paperCardboardKg: Number(record.paperCardboardKg),
    plasticKg: Number(record.plasticKg),
    glassKg: Number(record.glassKg),
    aluminiumMetalKg: Number(record.aluminiumMetalKg),
    otherKg: Number(record.otherKg),
    totalKg: Number(record.totalKg),
    internalComment: record.internalComment,
    createdByUserId: record.createdByUserId,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function sendValidationError(res: Response, err: unknown): boolean {
  if (err instanceof RecyclingValidationError) {
    res.status(400).json({ error: err.message });
    return true;
  }
  return false;
}

async function getCompany(companyId: number) {
  const [company] = await db
    .select()
    .from(companiesTable)
    .where(eq(companiesTable.id, companyId))
    .limit(1);
  return company ?? null;
}

function buildRecordWhere(companyId: number, filters: RecyclingFilters) {
  const clauses: SQL[] = [eq(recyclingCollectionsTable.companyId, companyId)];
  if (filters.month) {
    clauses.push(eq(recyclingCollectionsTable.reportingMonth, filters.month));
  }
  if (filters.fromMonth) {
    clauses.push(gte(recyclingCollectionsTable.reportingMonth, filters.fromMonth));
  }
  if (filters.toMonth) {
    clauses.push(lte(recyclingCollectionsTable.reportingMonth, filters.toMonth));
  }
  if (filters.site) {
    clauses.push(ilike(recyclingCollectionsTable.siteName, `%${filters.site}%`));
  }
  return and(...clauses);
}

async function getRecords(
  companyId: number,
  filters: RecyclingFilters,
  limit = 500,
  sort: "asc" | "desc" = "desc",
) {
  return db
    .select()
    .from(recyclingCollectionsTable)
    .where(buildRecordWhere(companyId, filters))
    .orderBy(
      sort === "asc"
        ? asc(recyclingCollectionsTable.collectionDate)
        : desc(recyclingCollectionsTable.collectionDate),
    )
    .limit(limit);
}

async function buildCompanySummary(
  companyId: number,
  filters: RecyclingFilters = {},
) {
  const company = await getCompany(companyId);
  if (!company) {
    throw new HttpError(404, "Company not found");
  }

  const [periodRecords, allRecords, factors] = await Promise.all([
    getRecords(companyId, filters, 1000, "desc"),
    getRecords(companyId, {}, 2000, "desc"),
    db
      .select()
      .from(recyclingConversionFactorsTable)
      .where(eq(recyclingConversionFactorsTable.isActive, true)),
  ]);

  const currentMonth = deriveReportingMonth(new Date());
  const currentRecords = allRecords.filter(
    (record) => record.reportingMonth === currentMonth,
  );
  const periodTotals = summarizeRecyclingRecords(periodRecords);
  const cumulativeTotals = summarizeRecyclingRecords(allRecords);

  return {
    profile: serializeCompany(company),
    filters,
    generatedAt: new Date().toISOString(),
    currentMonth: {
      month: currentMonth,
      latestCollectionDate:
        currentRecords[0]?.collectionDate.toISOString() ?? null,
      ...summarizeRecyclingRecords(currentRecords),
    },
    cumulative: {
      latestCollectionDate:
        allRecords[0]?.collectionDate.toISOString() ?? null,
      ...cumulativeTotals,
    },
    period: {
      latestCollectionDate:
        periodRecords[0]?.collectionDate.toISOString() ?? null,
      ...periodTotals,
    },
    monthlyTrend: getMonthlyTrend(periodRecords.length ? periodRecords : allRecords),
    recentCollections: allRecords.slice(0, 8).map(serializeCollection),
    records: periodRecords.map(serializeCollection),
    equivalents: buildEstimatedEquivalents(cumulativeTotals, factors),
    equivalentsNote:
      factors.length === 0
        ? "No active verified conversion factors are configured. Only collected kg values are shown."
        : "Estimated equivalents use configured active conversion factors and are separate from verified collection weights.",
  };
}

function collectionValuesFromBody(
  body: unknown,
  companyId: number,
  userId: string,
  existing?: CollectionRecord,
) {
  const raw = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const siteName = readText(raw.siteName) ?? existing?.siteName ?? null;
  if (!siteName) {
    throw new RecyclingValidationError("Collection site is required");
  }

  const collectionDate = hasOwn(raw, "collectionDate")
    ? parseCollectionDate(raw.collectionDate)
    : existing?.collectionDate;
  if (!collectionDate) {
    throw new RecyclingValidationError("Collection date is required");
  }

  const materialInput: RecyclingMaterialInput = {};
  for (const key of RECYCLING_MATERIAL_KEYS) {
    materialInput[key] = hasOwn(raw, key) ? raw[key] : existing?.[key];
  }
  const normalized = normalizeRecyclingMaterials(materialInput);
  const reportingMonth =
    parseReportingMonth(raw.reportingMonth) ?? deriveReportingMonth(collectionDate);

  return {
    companyId,
    siteName,
    collectionDate,
    reportingMonth,
    ...normalized.values,
    totalKg: normalized.totalKg,
    internalComment: hasOwn(raw, "internalComment")
      ? readText(raw.internalComment)
      : existing?.internalComment ?? null,
    createdByUserId: existing?.createdByUserId ?? userId,
  };
}

router.get("/company/summary", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    res.json(await buildCompanySummary(access.companyId, parseFilters(req.query)));
  } catch (err) {
    if (!sendValidationError(res, err) && !sendHttpError(res, err)) {
      req.log?.error({ err }, "Failed to load recycling summary");
      res.status(500).json({ error: "Failed to load recycling summary" });
    }
  }
});

router.get("/company/report", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    res.json(await buildCompanySummary(access.companyId, parseFilters(req.query)));
  } catch (err) {
    if (!sendValidationError(res, err) && !sendHttpError(res, err)) {
      req.log?.error({ err }, "Failed to load recycling report");
      res.status(500).json({ error: "Failed to load recycling report" });
    }
  }
});

router.get("/company/records", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const records = await getRecords(access.companyId, parseFilters(req.query));
    res.json(records.map(serializeCollection));
  } catch (err) {
    if (!sendValidationError(res, err) && !sendHttpError(res, err)) {
      req.log?.error({ err }, "Failed to load recycling records");
      res.status(500).json({ error: "Failed to load recycling records" });
    }
  }
});

router.post("/company/enquiries", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const company = await getCompany(access.companyId);
    if (!company) {
      res.status(404).json({ error: "Company not found" });
      return;
    }

    const raw = req.body && typeof req.body === "object" ? (req.body as Record<string, unknown>) : {};
    const contactName = readText(raw.contactName);
    const email = readText(raw.email) ?? access.email;
    if (!contactName || !email) {
      res.status(400).json({ error: "Contact name and email are required" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: "Enter a valid email address" });
      return;
    }

    const [enquiry] = await db
      .insert(recyclingEnquiriesTable)
      .values({
        companyId: company.id,
        companyName: company.name,
        contactName,
        email,
        phone: readText(raw.phone),
        siteLocation: readText(raw.siteLocation),
        currentArrangement: readText(raw.currentArrangement),
        message: readText(raw.message),
        createdByUserId: access.userId,
      })
      .returning();

    res.status(201).json(enquiry);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      req.log?.error({ err }, "Failed to submit recycling enquiry");
      res.status(500).json({ error: "Failed to submit recycling enquiry" });
    }
  }
});

router.get("/admin/companies", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const search = queryText(req.query.search);
    const where = search
      ? or(
          ilike(companiesTable.name, `%${search}%`),
          ilike(companiesTable.slug, `%${search}%`),
          ilike(companiesTable.recycleanCustomerRef, `%${search}%`),
        )
      : undefined;
    const companies = where
      ? await db
          .select()
          .from(companiesTable)
          .where(where)
          .orderBy(asc(companiesTable.name))
          .limit(100)
      : await db
          .select()
          .from(companiesTable)
          .orderBy(asc(companiesTable.name))
          .limit(100);
    res.json(companies.map((company) => serializeCompany(company, true)));
  } catch (err) {
    if (!sendHttpError(res, err)) {
      req.log?.error({ err }, "Failed to list recycling companies");
      res.status(500).json({ error: "Failed to list companies" });
    }
  }
});

router.patch("/admin/companies/:companyId/service", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const companyId = parseId(req.params.companyId);
    if (!companyId) {
      res.status(400).json({ error: "Invalid company id" });
      return;
    }
    const raw = req.body && typeof req.body === "object" ? (req.body as Record<string, unknown>) : {};
    const update: CompanyUpdate = {};

    if (hasOwn(raw, "recyclingServiceStatus")) {
      update.recyclingServiceStatus = normalizeRecyclingStatus(
        raw.recyclingServiceStatus,
      );
    }
    if (hasOwn(raw, "recycleanCustomerRef")) {
      update.recycleanCustomerRef = readText(raw.recycleanCustomerRef);
    }
    if (hasOwn(raw, "defaultCollectionSiteName")) {
      update.defaultCollectionSiteName = readText(raw.defaultCollectionSiteName);
    }
    if (hasOwn(raw, "recyclingServiceFrequency")) {
      update.recyclingServiceFrequency = readText(raw.recyclingServiceFrequency);
    }
    if (hasOwn(raw, "recyclingInternalNotes")) {
      update.recyclingInternalNotes = readText(raw.recyclingInternalNotes);
    }
    if (hasOwn(raw, "recyclingServiceStartDate")) {
      const text = readText(raw.recyclingServiceStartDate);
      if (!text) {
        update.recyclingServiceStartDate = null;
      } else {
        const date = new Date(text);
        if (Number.isNaN(date.getTime())) {
          res.status(400).json({ error: "Invalid service start date" });
          return;
        }
        update.recyclingServiceStartDate = date;
      }
    }

    const [company] = await db
      .update(companiesTable)
      .set(update)
      .where(eq(companiesTable.id, companyId))
      .returning();
    if (!company) {
      res.status(404).json({ error: "Company not found" });
      return;
    }
    res.json(serializeCompany(company, true));
  } catch (err) {
    if (!sendValidationError(res, err) && !sendHttpError(res, err)) {
      req.log?.error({ err }, "Failed to update recycling service");
      res.status(500).json({ error: "Failed to update recycling service" });
    }
  }
});

router.get("/admin/companies/:companyId/summary", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const companyId = parseId(req.params.companyId);
    if (!companyId) {
      res.status(400).json({ error: "Invalid company id" });
      return;
    }
    res.json(await buildCompanySummary(companyId, parseFilters(req.query)));
  } catch (err) {
    if (!sendValidationError(res, err) && !sendHttpError(res, err)) {
      req.log?.error({ err }, "Failed to load admin recycling summary");
      res.status(500).json({ error: "Failed to load recycling summary" });
    }
  }
});

router.get("/admin/companies/:companyId/records", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const companyId = parseId(req.params.companyId);
    if (!companyId) {
      res.status(400).json({ error: "Invalid company id" });
      return;
    }
    const records = await getRecords(companyId, parseFilters(req.query));
    res.json(records.map(serializeCollection));
  } catch (err) {
    if (!sendValidationError(res, err) && !sendHttpError(res, err)) {
      req.log?.error({ err }, "Failed to load admin recycling records");
      res.status(500).json({ error: "Failed to load recycling records" });
    }
  }
});

router.post("/admin/companies/:companyId/records", async (req, res): Promise<void> => {
  try {
    const access = await requirePlatformAdmin(req);
    const companyId = parseId(req.params.companyId);
    if (!companyId) {
      res.status(400).json({ error: "Invalid company id" });
      return;
    }
    const company = await getCompany(companyId);
    if (!company) {
      res.status(404).json({ error: "Company not found" });
      return;
    }
    const values = collectionValuesFromBody(req.body, companyId, access.userId);
    const [record] = await db
      .insert(recyclingCollectionsTable)
      .values(values)
      .returning();
    res.status(201).json(serializeCollection(record));
  } catch (err) {
    if (!sendValidationError(res, err) && !sendHttpError(res, err)) {
      req.log?.error({ err }, "Failed to create recycling record");
      res.status(500).json({ error: "Failed to create recycling record" });
    }
  }
});

router.patch("/admin/records/:recordId", async (req, res): Promise<void> => {
  try {
    const access = await requirePlatformAdmin(req);
    const recordId = parseId(req.params.recordId);
    if (!recordId) {
      res.status(400).json({ error: "Invalid record id" });
      return;
    }
    const [existing] = await db
      .select()
      .from(recyclingCollectionsTable)
      .where(eq(recyclingCollectionsTable.id, recordId))
      .limit(1);
    if (!existing) {
      res.status(404).json({ error: "Collection record not found" });
      return;
    }
    const values = collectionValuesFromBody(
      req.body,
      existing.companyId,
      access.userId,
      existing,
    );
    const [record] = await db
      .update(recyclingCollectionsTable)
      .set(values)
      .where(eq(recyclingCollectionsTable.id, recordId))
      .returning();
    res.json(serializeCollection(record));
  } catch (err) {
    if (!sendValidationError(res, err) && !sendHttpError(res, err)) {
      req.log?.error({ err }, "Failed to update recycling record");
      res.status(500).json({ error: "Failed to update recycling record" });
    }
  }
});

router.delete("/admin/records/:recordId", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const recordId = parseId(req.params.recordId);
    if (!recordId) {
      res.status(400).json({ error: "Invalid record id" });
      return;
    }
    const [deleted] = await db
      .delete(recyclingCollectionsTable)
      .where(eq(recyclingCollectionsTable.id, recordId))
      .returning();
    if (!deleted) {
      res.status(404).json({ error: "Collection record not found" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    if (!sendHttpError(res, err)) {
      req.log?.error({ err }, "Failed to delete recycling record");
      res.status(500).json({ error: "Failed to delete recycling record" });
    }
  }
});

router.get("/admin/enquiries", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const enquiries = await db
      .select()
      .from(recyclingEnquiriesTable)
      .orderBy(desc(recyclingEnquiriesTable.createdAt))
      .limit(100);
    res.json(enquiries);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      req.log?.error({ err }, "Failed to list recycling enquiries");
      res.status(500).json({ error: "Failed to list recycling enquiries" });
    }
  }
});

router.get("/admin/conversion-factors", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const factors = await db
      .select()
      .from(recyclingConversionFactorsTable)
      .orderBy(desc(recyclingConversionFactorsTable.effectiveDate));
    res.json(factors);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      req.log?.error({ err }, "Failed to list recycling conversion factors");
      res.status(500).json({ error: "Failed to list conversion factors" });
    }
  }
});

router.post("/admin/conversion-factors", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const raw = req.body && typeof req.body === "object" ? (req.body as Record<string, unknown>) : {};
    const metricName = readText(raw.metricName);
    const metricLabel = readText(raw.metricLabel);
    const factorUnit = readText(raw.factorUnit);
    const sourceName = readText(raw.sourceName);
    const factorValue = readText(raw.factorValue) ?? raw.factorValue;
    const effectiveDateText = readText(raw.effectiveDate);
    if (!metricName || !metricLabel || !factorUnit || !sourceName || !effectiveDateText) {
      res.status(400).json({ error: "Metric, unit, source and effective date are required" });
      return;
    }
    const factorNumber = Number(factorValue);
    const effectiveDate = new Date(effectiveDateText);
    if (!Number.isFinite(factorNumber) || factorNumber <= 0 || Number.isNaN(effectiveDate.getTime())) {
      res.status(400).json({ error: "Enter a valid positive factor and effective date" });
      return;
    }
    const [factor] = await db
      .insert(recyclingConversionFactorsTable)
      .values({
        materialType: readText(raw.materialType) ?? "total",
        metricName,
        metricLabel,
        factorValue: String(factorNumber),
        factorUnit,
        sourceName,
        sourceReference: readText(raw.sourceReference),
        effectiveDate,
        isActive: raw.isActive !== false,
        internalNotes: readText(raw.internalNotes),
      })
      .returning();
    res.status(201).json(factor);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      req.log?.error({ err }, "Failed to create recycling conversion factor");
      res.status(500).json({ error: "Failed to create conversion factor" });
    }
  }
});

router.patch("/admin/conversion-factors/:id", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const id = parseId(req.params.id);
    if (!id) {
      res.status(400).json({ error: "Invalid factor id" });
      return;
    }
    const raw = req.body && typeof req.body === "object" ? (req.body as Record<string, unknown>) : {};
    const update: Partial<typeof recyclingConversionFactorsTable.$inferInsert> = {};
    if (hasOwn(raw, "materialType")) {
      update.materialType = readText(raw.materialType) ?? "total";
    }
    if (hasOwn(raw, "metricName")) {
      const value = readText(raw.metricName);
      if (!value) {
        res.status(400).json({ error: "Metric name is required" });
        return;
      }
      update.metricName = value;
    }
    if (hasOwn(raw, "metricLabel")) {
      const value = readText(raw.metricLabel);
      if (!value) {
        res.status(400).json({ error: "Metric label is required" });
        return;
      }
      update.metricLabel = value;
    }
    if (hasOwn(raw, "factorUnit")) {
      const value = readText(raw.factorUnit);
      if (!value) {
        res.status(400).json({ error: "Factor unit is required" });
        return;
      }
      update.factorUnit = value;
    }
    if (hasOwn(raw, "sourceName")) {
      const value = readText(raw.sourceName);
      if (!value) {
        res.status(400).json({ error: "Source name is required" });
        return;
      }
      update.sourceName = value;
    }
    if (hasOwn(raw, "sourceReference")) {
      update.sourceReference = readText(raw.sourceReference);
    }
    if (hasOwn(raw, "internalNotes")) {
      update.internalNotes = readText(raw.internalNotes);
    }
    if (hasOwn(raw, "factorValue")) {
      const factorNumber = Number(raw.factorValue);
      if (!Number.isFinite(factorNumber) || factorNumber <= 0) {
        res.status(400).json({ error: "Factor value must be positive" });
        return;
      }
      update.factorValue = String(factorNumber);
    }
    if (hasOwn(raw, "effectiveDate")) {
      const effectiveDate = new Date(String(raw.effectiveDate));
      if (Number.isNaN(effectiveDate.getTime())) {
        res.status(400).json({ error: "Invalid effective date" });
        return;
      }
      update.effectiveDate = effectiveDate;
    }
    if (hasOwn(raw, "isActive")) update.isActive = raw.isActive === true;

    const [factor] = await db
      .update(recyclingConversionFactorsTable)
      .set(update)
      .where(eq(recyclingConversionFactorsTable.id, id))
      .returning();
    if (!factor) {
      res.status(404).json({ error: "Conversion factor not found" });
      return;
    }
    res.json(factor);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      req.log?.error({ err }, "Failed to update recycling conversion factor");
      res.status(500).json({ error: "Failed to update conversion factor" });
    }
  }
});

export default router;
