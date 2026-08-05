import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont } from "pdf-lib";
import { randomUUID } from "crypto";
import { getCompanyTrainingRecords, getCompany } from "./trainingReportingService";

const GREEN = rgb(0.13, 0.43, 0.27);
const GREEN_SOFT = rgb(0.9, 0.95, 0.92);
const GOLD = rgb(0.79, 0.62, 0.23);
const DARK = rgb(0.11, 0.15, 0.13);
const MUTED = rgb(0.42, 0.46, 0.44);
const LIGHT = rgb(0.96, 0.97, 0.96);
const BORDER = rgb(0.85, 0.87, 0.86);
const WHITE = rgb(1, 1, 1);

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 48;
const CONTENT_W = PAGE_W - MARGIN * 2;

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function generateTrainingEvidencePackPdf(companyId: number): Promise<Uint8Array> {
  const recordsData = await getCompanyTrainingRecords({ companyId });
  const company = await getCompany(companyId);
  const companyName = company?.name ?? "Elevio Corporate Member";

  const pdf = await PDFDocument.create();
  const fontRegular = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await pdf.embedFont(StandardFonts.HelveticaOblique);

  const packRef = `ELEVIO-EVID-${randomUUID().slice(0, 8).toUpperCase()}`;
  const now = new Date();
  const dateStr = formatDate(now);

  // --- PAGE 1: COVER PAGE & EXECUTIVE SUMMARY ---
  const page1 = pdf.addPage([PAGE_W, PAGE_H]);

  // Decorative header band
  page1.drawRectangle({
    x: 0,
    y: PAGE_H - 120,
    width: PAGE_W,
    height: 120,
    color: GREEN,
  });

  page1.drawText("Elevio", {
    x: MARGIN,
    y: PAGE_H - 50,
    size: 24,
    font: fontBold,
    color: WHITE,
  });

  page1.drawText("Official Company Training Evidence Pack", {
    x: MARGIN,
    y: PAGE_H - 78,
    size: 14,
    font: fontRegular,
    color: GOLD,
  });

  // Meta box
  page1.drawRectangle({
    x: MARGIN,
    y: PAGE_H - 240,
    width: CONTENT_W,
    height: 95,
    color: GREEN_SOFT,
    borderColor: GREEN,
    borderWidth: 1,
  });

  page1.drawText(`Organization: ${companyName}`, {
    x: MARGIN + 16,
    y: PAGE_H - 170,
    size: 13,
    font: fontBold,
    color: DARK,
  });

  page1.drawText(`Evidence Pack Reference: ${packRef}`, {
    x: MARGIN + 16,
    y: PAGE_H - 192,
    size: 11,
    font: fontRegular,
    color: DARK,
  });

  page1.drawText(`Generated Date: ${dateStr}`, {
    x: MARGIN + 16,
    y: PAGE_H - 214,
    size: 11,
    font: fontRegular,
    color: DARK,
  });

  page1.drawText(`Reporting Period: All-Time Active Enrolments`, {
    x: MARGIN + 16,
    y: PAGE_H - 232,
    size: 11,
    font: fontRegular,
    color: DARK,
  });

  // Executive Summary Grid
  page1.drawText("Executive Training Summary", {
    x: MARGIN,
    y: PAGE_H - 280,
    size: 16,
    font: fontBold,
    color: GREEN,
  });

  const overview = recordsData.overview;
  const metrics = [
    { label: "Total Active Learners", value: String(overview.totalEmployees) },
    { label: "Completed Core Courses", value: String(overview.completedCoreCount) },
    { label: "Total Course Completions", value: String(overview.totalCourseCompletions) },
    { label: "In-Progress Core Courses", value: String(overview.inProgressCoreCount) },
    { label: "Core Completion Rate", value: `${overview.overallCoreCompletionRate}%` },
    { label: "Certificates Issued", value: String(overview.certifiedCount) },
  ];

  const colW = (CONTENT_W - 20) / 3;
  const rowH = 55;
  metrics.forEach((m, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const x = MARGIN + col * (colW + 10);
    const y = PAGE_H - 360 - row * (rowH + 10);

    page1.drawRectangle({
      x,
      y,
      width: colW,
      height: rowH,
      color: LIGHT,
      borderColor: BORDER,
      borderWidth: 1,
    });

    page1.drawText(m.value, {
      x: x + 12,
      y: y + 28,
      size: 18,
      font: fontBold,
      color: GREEN,
    });

    page1.drawText(m.label, {
      x: x + 12,
      y: y + 10,
      size: 9,
      font: fontRegular,
      color: MUTED,
    });
  });

  // Evidence Methodology & Disclaimer
  const discY = PAGE_H - 510;
  page1.drawRectangle({
    x: MARGIN,
    y: discY - 140,
    width: CONTENT_W,
    height: 140,
    color: LIGHT,
    borderColor: BORDER,
    borderWidth: 1,
  });

  page1.drawText("Evidence Methodology & Verification Criteria", {
    x: MARGIN + 12,
    y: discY - 22,
    size: 11,
    font: fontBold,
    color: DARK,
  });

  const discLines = [
    "• Completion Evidence: Based on server-side lesson progress tracking and verified passing quiz attempts.",
    "• Assessment Threshold: Minimum score of 70-80% required for course completion and certificate issuance.",
    "• Version Integrity: Learner completion records retain the specific course version active at the time of completion.",
    "• Scope & Tenant Isolation: Data is strictly filtered and scoped to verified organization records.",
    "• Legal Notice: This report provides evidence of training records stored in Elevio.",
    "  It does not by itself establish independent external audit assurance or regulatory compliance.",
  ];

  discLines.forEach((line, idx) => {
    page1.drawText(line, {
      x: MARGIN + 12,
      y: discY - 40 - idx * 16,
      size: 8.5,
      font: fontRegular,
      color: DARK,
    });
  });

  // Footer Page 1
  page1.drawText(`Page 1 of 2 — Reference: ${packRef}`, {
    x: MARGIN,
    y: MARGIN / 2,
    size: 8,
    font: fontRegular,
    color: MUTED,
  });

  // --- PAGE 2: COMPLETION REGISTER REGISTER ---
  const page2 = pdf.addPage([PAGE_W, PAGE_H]);

  page2.drawRectangle({
    x: 0,
    y: PAGE_H - 50,
    width: PAGE_W,
    height: 50,
    color: GREEN,
  });

  page2.drawText("Learner Completion Register", {
    x: MARGIN,
    y: PAGE_H - 34,
    size: 16,
    font: fontBold,
    color: WHITE,
  });

  // Table Header
  const tableTop = PAGE_H - 80;
  page2.drawRectangle({
    x: MARGIN,
    y: tableTop - 24,
    width: CONTENT_W,
    height: 24,
    color: LIGHT,
    borderColor: BORDER,
    borderWidth: 1,
  });

  const headers = [
    { name: "Learner Name", x: MARGIN + 8, w: 120 },
    { name: "Department", x: MARGIN + 130, w: 90 },
    { name: "Status", x: MARGIN + 225, w: 75 },
    { name: "Core Progress", x: MARGIN + 305, w: 70 },
    { name: "Certified", x: MARGIN + 380, w: 55 },
    { name: "Last Active", x: MARGIN + 440, w: 55 },
  ];

  headers.forEach((h) => {
    page2.drawText(h.name, {
      x: h.x,
      y: tableTop - 17,
      size: 9,
      font: fontBold,
      color: DARK,
    });
  });

  // Rows
  const employees = recordsData.employeeRecords.data.slice(0, 25);
  let curY = tableTop - 24;

  employees.forEach((emp: any, idx: number) => {
    curY -= 22;

    if (idx % 2 === 1) {
      page2.drawRectangle({
        x: MARGIN,
        y: curY,
        width: CONTENT_W,
        height: 22,
        color: rgb(0.98, 0.98, 0.98),
      });
    }

    page2.drawText(emp.name.slice(0, 20), { x: MARGIN + 8, y: curY + 6, size: 8, font: fontRegular, color: DARK });
    page2.drawText((emp.department ?? "General").slice(0, 15), { x: MARGIN + 130, y: curY + 6, size: 8, font: fontRegular, color: DARK });
    page2.drawText(emp.status, { x: MARGIN + 225, y: curY + 6, size: 8, font: fontRegular, color: emp.status === "completed" ? GREEN : DARK });
    page2.drawText(`${emp.individualCoreProgress}%`, { x: MARGIN + 305, y: curY + 6, size: 8, font: fontRegular, color: DARK });
    page2.drawText(emp.isCertified ? "Yes" : "No", { x: MARGIN + 380, y: curY + 6, size: 8, font: fontBold, color: emp.isCertified ? GREEN : MUTED });
    page2.drawText(emp.lastActiveAt ? formatDate(new Date(emp.lastActiveAt)) : "N/A", { x: MARGIN + 440, y: curY + 6, size: 7.5, font: fontRegular, color: MUTED });
  });

  // Footer Page 2
  page2.drawText(`Page 2 of 2 — Reference: ${packRef} — Elevio Corporate LMS`, {
    x: MARGIN,
    y: MARGIN / 2,
    size: 8,
    font: fontRegular,
    color: MUTED,
  });

  return await pdf.save();
}
