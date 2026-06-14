import { Router } from "express";
import { db } from "@workspace/db";
import { certificatesTable, coursesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/verify/:code", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.code) ? req.params.code[0] : req.params.code;

  const [cert] = await db
    .select({
      id: certificatesTable.id,
      userId: certificatesTable.userId,
      employeeName: certificatesTable.employeeName,
      companyName: certificatesTable.companyName,
      courseId: certificatesTable.courseId,
      courseName: coursesTable.title,
      uniqueCode: certificatesTable.uniqueCode,
      pdfUrl: certificatesTable.pdfUrl,
      issuedAt: certificatesTable.issuedAt,
    })
    .from(certificatesTable)
    .leftJoin(coursesTable, eq(certificatesTable.courseId, coursesTable.id))
    .where(eq(certificatesTable.uniqueCode, raw));

  if (!cert) {
    res.status(404).json({ error: "Certificate not found" });
    return;
  }
  res.json(cert);
});

router.get("/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [cert] = await db
    .select({
      id: certificatesTable.id,
      userId: certificatesTable.userId,
      employeeName: certificatesTable.employeeName,
      companyName: certificatesTable.companyName,
      courseId: certificatesTable.courseId,
      courseName: coursesTable.title,
      uniqueCode: certificatesTable.uniqueCode,
      pdfUrl: certificatesTable.pdfUrl,
      issuedAt: certificatesTable.issuedAt,
    })
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
    .select({
      id: certificatesTable.id,
      userId: certificatesTable.userId,
      employeeName: certificatesTable.employeeName,
      companyName: certificatesTable.companyName,
      courseId: certificatesTable.courseId,
      courseName: coursesTable.title,
      uniqueCode: certificatesTable.uniqueCode,
      pdfUrl: certificatesTable.pdfUrl,
      issuedAt: certificatesTable.issuedAt,
    })
    .from(certificatesTable)
    .leftJoin(coursesTable, eq(certificatesTable.courseId, coursesTable.id))
    .where(eq(certificatesTable.userId, userId));

  res.json(certs);
});

export default router;
