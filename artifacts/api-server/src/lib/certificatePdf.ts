import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont } from "pdf-lib";
import QRCode from "qrcode";

export interface CertificateData {
  employeeName: string;
  companyName: string;
  courseName: string;
  uniqueCode: string;
  issuedAt: Date;
}

const GREEN = rgb(0.13, 0.43, 0.27);
const GOLD = rgb(0.79, 0.62, 0.23);
const DARK = rgb(0.11, 0.15, 0.13);
const MUTED = rgb(0.42, 0.46, 0.44);
const LIGHT = rgb(0.96, 0.97, 0.96);

function centerText(
  page: PDFPage,
  text: string,
  y: number,
  font: PDFFont,
  size: number,
  color = DARK,
) {
  const width = font.widthOfTextAtSize(text, size);
  page.drawText(text, {
    x: (page.getWidth() - width) / 2,
    y,
    size,
    font,
    color,
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

async function drawCertificatePage(
  pdf: PDFDocument,
  data: CertificateData,
  fonts: { regular: PDFFont; bold: PDFFont; italic: PDFFont },
  verifyUrl: string,
): Promise<void> {
  const page = pdf.addPage([841.89, 595.28]);
  const { width, height } = page.getSize();

  page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(1, 1, 1) });

  page.drawRectangle({
    x: 24,
    y: 24,
    width: width - 48,
    height: height - 48,
    borderColor: GREEN,
    borderWidth: 3,
  });
  page.drawRectangle({
    x: 32,
    y: 32,
    width: width - 64,
    height: height - 64,
    borderColor: GOLD,
    borderWidth: 1,
  });

  page.drawRectangle({ x: 32, y: height - 110, width: width - 64, height: 78, color: LIGHT });

  page.drawCircle({ x: 80, y: height - 71, size: 18, color: GREEN });
  centerTextAt(page, "E", 73, height - 78, fonts.bold, 22, rgb(1, 1, 1));
  page.drawText("EcoLearn Mauritius", {
    x: 110,
    y: height - 78,
    size: 20,
    font: fonts.bold,
    color: GREEN,
  });
  page.drawText("Corporate Sustainability & ESG Training", {
    x: 110,
    y: height - 96,
    size: 9,
    font: fonts.regular,
    color: MUTED,
  });

  centerText(page, "CERTIFICATE OF COMPLETION", height - 170, fonts.bold, 30, DARK);
  page.drawRectangle({ x: width / 2 - 60, y: height - 185, width: 120, height: 3, color: GOLD });

  centerText(page, "This is to certify that", height - 225, fonts.italic, 14, MUTED);
  centerText(page, data.employeeName, height - 268, fonts.bold, 32, GREEN);

  centerText(page, "has successfully completed the course", height - 305, fonts.italic, 14, MUTED);
  centerText(page, data.courseName, height - 340, fonts.bold, 20, DARK);

  centerText(
    page,
    `awarded to employees of ${data.companyName}`,
    height - 368,
    fonts.regular,
    12,
    MUTED,
  );

  const baseY = 110;
  page.drawText("Date of Completion", { x: 90, y: baseY, size: 9, font: fonts.regular, color: MUTED });
  page.drawText(formatDate(data.issuedAt), {
    x: 90,
    y: baseY - 18,
    size: 13,
    font: fonts.bold,
    color: DARK,
  });
  page.drawLine({
    start: { x: 90, y: baseY - 28 },
    end: { x: 250, y: baseY - 28 },
    thickness: 1,
    color: MUTED,
  });

  page.drawText("Certificate ID", {
    x: width - 250,
    y: baseY,
    size: 9,
    font: fonts.regular,
    color: MUTED,
  });
  page.drawText(data.uniqueCode, {
    x: width - 250,
    y: baseY - 18,
    size: 13,
    font: fonts.bold,
    color: DARK,
  });
  page.drawLine({
    start: { x: width - 250, y: baseY - 28 },
    end: { x: width - 90, y: baseY - 28 },
    thickness: 1,
    color: MUTED,
  });

  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    margin: 1,
    width: 240,
    color: { dark: "#1f6e45", light: "#ffffff" },
  });
  const qrImage = await pdf.embedPng(qrDataUrl);
  const qrSize = 78;
  page.drawImage(qrImage, {
    x: (width - qrSize) / 2,
    y: 44,
    width: qrSize,
    height: qrSize,
  });
  centerText(page, "Scan to verify authenticity", 34, fonts.regular, 8, MUTED);
}

function centerTextAt(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  font: PDFFont,
  size: number,
  color = DARK,
) {
  const w = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: x - w / 2, y: y, size, font, color });
}

async function loadFonts(pdf: PDFDocument) {
  return {
    regular: await pdf.embedFont(StandardFonts.Helvetica),
    bold: await pdf.embedFont(StandardFonts.HelveticaBold),
    italic: await pdf.embedFont(StandardFonts.HelveticaOblique),
  };
}

export function buildVerifyUrl(uniqueCode: string): string {
  const explicit = process.env.PUBLIC_APP_URL;
  const base = explicit
    ? explicit.replace(/\/$/, "")
    : process.env.REPLIT_DEV_DOMAIN
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : "";
  return `${base}/certificates/verify/${uniqueCode}`;
}

export async function generateCertificatePdf(data: CertificateData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const fonts = await loadFonts(pdf);
  await drawCertificatePage(pdf, data, fonts, buildVerifyUrl(data.uniqueCode));
  return pdf.save();
}

export async function generateBulkCertificatesPdf(
  items: CertificateData[],
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const fonts = await loadFonts(pdf);
  for (const data of items) {
    await drawCertificatePage(pdf, data, fonts, buildVerifyUrl(data.uniqueCode));
  }
  return pdf.save();
}
