import { Router } from "express";
import { db } from "@workspace/db";
import { certificatesTable, coursesTable, companiesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  generateCertificatePdf,
  generateBulkCertificatesPdf,
  type CertificateData,
} from "../lib/certificatePdf";

const router = Router();

const certSelect = {
  id: certificatesTable.id,
  userId: certificatesTable.userId,
  employeeName: certificatesTable.employeeName,
  companyName: certificatesTable.companyName,
  courseId: certificatesTable.courseId,
  courseName: coursesTable.title,
  uniqueCode: certificatesTable.uniqueCode,
  pdfUrl: certificatesTable.pdfUrl,
  issuedAt: certificatesTable.issuedAt,
};

function toCertificateData(row: {
  employeeName: string | null;
  companyName: string | null;
  courseName: string | null;
  uniqueCode: string;
  issuedAt: Date;
}): CertificateData {
  return {
    employeeName: row.employeeName ?? "EcoLearn Learner",
    companyName: row.companyName ?? "EcoLearn Mauritius",
    courseName: row.courseName ?? "Sustainability Course",
    uniqueCode: row.uniqueCode,
    issuedAt: new Date(row.issuedAt),
  };
}

function safeFileName(value: string): string {
  return value.replace(/[^a-z0-9-_]+/gi, "_").replace(/_+/g, "_");
}

// Guardrail: bulk export builds the whole PDF in memory, so cap how many
// certificates a single export can include to avoid latency/OOM at scale.
const MAX_BULK_EXPORT = 500;

router.get("/verify/:code", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.code) ? req.params.code[0] : req.params.code;

  const [cert] = await db
    .select(certSelect)
    .from(certificatesTable)
    .leftJoin(coursesTable, eq(certificatesTable.courseId, coursesTable.id))
    .where(eq(certificatesTable.uniqueCode, raw));

  if (!cert) {
    res.status(404).json({ error: "Certificate not found" });
    return;
  }
  res.json(cert);
});

// Company-wide list of all issued certificates (for HR / company admins).
router.get("/company/list", async (_req, res): Promise<void> => {
  const certs = await db
    .select(certSelect)
    .from(certificatesTable)
    .leftJoin(coursesTable, eq(certificatesTable.courseId, coursesTable.id))
    .orderBy(certificatesTable.issuedAt);

  res.json(certs);
});

// Bulk export every company certificate as a single multi-page PDF.
router.get("/company/export", async (req, res): Promise<void> => {
  const certs = await db
    .select(certSelect)
    .from(certificatesTable)
    .leftJoin(coursesTable, eq(certificatesTable.courseId, coursesTable.id))
    .orderBy(certificatesTable.issuedAt);

  if (certs.length === 0) {
    res.status(404).json({ error: "No certificates to export" });
    return;
  }

  if (certs.length > MAX_BULK_EXPORT) {
    res.status(413).json({
      error: `Too many certificates to export at once (${certs.length}). Maximum is ${MAX_BULK_EXPORT}.`,
    });
    return;
  }

  const [company] = await db.select().from(companiesTable).limit(1);
  const label = safeFileName(company?.name ?? "EcoLearn");

  try {
    const pdfBytes = await generateBulkCertificatesPdf(certs.map(toCertificateData));
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${label}_certificates.pdf"`,
    );
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    req.log?.error({ err }, "Failed to generate bulk certificate PDF");
    res.status(500).json({ error: "Failed to generate certificate export" });
  }
});

// Download a single certificate as a branded PDF (employee or company).
router.get("/:id/pdf", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [cert] = await db
    .select(certSelect)
    .from(certificatesTable)
    .leftJoin(coursesTable, eq(certificatesTable.courseId, coursesTable.id))
    .where(eq(certificatesTable.id, id));

  if (!cert) {
    res.status(404).json({ error: "Certificate not found" });
    return;
  }

  try {
    const pdfBytes = await generateCertificatePdf(toCertificateData(cert));
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="EcoLearn_Certificate_${safeFileName(cert.uniqueCode)}.pdf"`,
    );
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    req.log?.error({ err }, "Failed to generate certificate PDF");
    res.status(500).json({ error: "Failed to generate certificate" });
  }
});

router.get("/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [cert] = await db
    .select(certSelect)
    .from(certificatesTable)
    .leftJoin(coursesTable, eq(certificatesTable.courseId, coursesTable.id))
    .where(eq(certificatesTable.id, id));

  if (!cert) {
    res.status(404).json({ error: "Certificate not found" });
    return;
  }
  res.json(cert);
});

router.get("/", async (req, res): Promise<void> => {
  const userId = (req as any).auth?.userId ?? "demo-user";

  const certs = await db
    .select(certSelect)
    .from(certificatesTable)
    .leftJoin(coursesTable, eq(certificatesTable.courseId, coursesTable.id))
    .where(eq(certificatesTable.userId, userId));

  res.json(certs);
});

export default router;
