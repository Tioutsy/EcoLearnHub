import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont } from "pdf-lib";

export interface EsgReportData {
  company: {
    name: string;
    industry: string | null;
  };
  generatedAt: Date;
  participation: {
    totalEmployees: number;
    activeEmployees: number;
    adoptionRate: number;
    engagementRate: number;
    coursesAssigned: number;
    coursesCompleted: number;
    completionRate: number;
    avgScore: number;
    learningHours: number;
    certificatesIssued: number;
  };
  score: {
    score: number;
    level: string;
    nextLevel: string | null;
    pointsToNextLevel: number;
    components: { label: string; value: number }[];
  };
  impact: {
    co2EquivalentKg: number;
    treesEquivalent: number;
    wasteDivertedKg: number;
    recyclingParticipation: number;
    plasticReductionScore: number;
    waterSavingsScore: number;
    carbonAwarenessScore: number;
    sustainabilityEngagementScore: number;
  };
  departments: {
    department: string;
    employees: number;
    participationRate: number;
    completionRate: number;
  }[];
}

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

interface Fonts {
  regular: PDFFont;
  bold: PDFFont;
  italic: PDFFont;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function formatNumber(n: number): string {
  return Math.round(n).toLocaleString("en-GB");
}

class ReportBuilder {
  pdf: PDFDocument;
  fonts: Fonts;
  page!: PDFPage;
  y = 0;
  pageNumber = 0;

  constructor(pdf: PDFDocument, fonts: Fonts) {
    this.pdf = pdf;
    this.fonts = fonts;
  }

  newPage() {
    this.page = this.pdf.addPage([PAGE_W, PAGE_H]);
    this.pageNumber += 1;
    this.y = PAGE_H - MARGIN;
    this.drawFooter();
  }

  ensure(space: number) {
    if (this.y - space < MARGIN + 40) {
      this.newPage();
    }
  }

  drawFooter() {
    const text = "EcoLearn Mauritius  |  Corporate Sustainability & ESG Training";
    this.page.drawLine({
      start: { x: MARGIN, y: MARGIN + 24 },
      end: { x: PAGE_W - MARGIN, y: MARGIN + 24 },
      thickness: 0.5,
      color: BORDER,
    });
    this.page.drawText(text, {
      x: MARGIN,
      y: MARGIN + 12,
      size: 8,
      font: this.fonts.regular,
      color: MUTED,
    });
    const pageLabel = `Page ${this.pageNumber}`;
    const w = this.fonts.regular.widthOfTextAtSize(pageLabel, 8);
    this.page.drawText(pageLabel, {
      x: PAGE_W - MARGIN - w,
      y: MARGIN + 12,
      size: 8,
      font: this.fonts.regular,
      color: MUTED,
    });
  }

  sectionHeading(title: string) {
    this.ensure(46);
    this.y -= 8;
    this.page.drawRectangle({ x: MARGIN, y: this.y - 4, width: 4, height: 18, color: GREEN });
    this.page.drawText(title, {
      x: MARGIN + 14,
      y: this.y,
      size: 14,
      font: this.fonts.bold,
      color: DARK,
    });
    this.y -= 26;
  }

  paragraph(text: string, size = 10, color = MUTED) {
    const maxWidth = CONTENT_W;
    const words = text.split(" ");
    let line = "";
    const lines: string[] = [];
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (this.fonts.regular.widthOfTextAtSize(test, size) > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    for (const l of lines) {
      this.ensure(size + 6);
      this.page.drawText(l, { x: MARGIN, y: this.y, size, font: this.fonts.regular, color });
      this.y -= size + 5;
    }
    this.y -= 4;
  }

  statGrid(items: { label: string; value: string; sub?: string }[], columns = 3) {
    const gap = 12;
    const cardW = (CONTENT_W - gap * (columns - 1)) / columns;
    const cardH = 62;
    let i = 0;
    while (i < items.length) {
      this.ensure(cardH + gap);
      const rowTop = this.y;
      for (let c = 0; c < columns && i < items.length; c++, i++) {
        const item = items[i];
        const x = MARGIN + c * (cardW + gap);
        const yBottom = rowTop - cardH;
        this.page.drawRectangle({
          x,
          y: yBottom,
          width: cardW,
          height: cardH,
          color: LIGHT,
          borderColor: BORDER,
          borderWidth: 0.5,
        });
        this.page.drawText(item.value, {
          x: x + 12,
          y: yBottom + cardH - 26,
          size: 19,
          font: this.fonts.bold,
          color: GREEN,
        });
        this.page.drawText(item.label, {
          x: x + 12,
          y: yBottom + 20,
          size: 8.5,
          font: this.fonts.regular,
          color: DARK,
        });
        if (item.sub) {
          this.page.drawText(item.sub, {
            x: x + 12,
            y: yBottom + 8,
            size: 7.5,
            font: this.fonts.regular,
            color: MUTED,
          });
        }
      }
      this.y = rowTop - cardH - gap;
    }
  }

  barRow(label: string, value: number, suffix = "%") {
    this.ensure(28);
    const labelW = 170;
    const barX = MARGIN + labelW;
    const barW = CONTENT_W - labelW - 50;
    this.page.drawText(label, {
      x: MARGIN,
      y: this.y,
      size: 9.5,
      font: this.fonts.regular,
      color: DARK,
    });
    this.page.drawRectangle({ x: barX, y: this.y - 2, width: barW, height: 9, color: GREEN_SOFT });
    const filled = Math.max(0, Math.min(100, value)) / 100;
    this.page.drawRectangle({
      x: barX,
      y: this.y - 2,
      width: barW * filled,
      height: 9,
      color: GREEN,
    });
    const valueText = `${value}${suffix}`;
    this.page.drawText(valueText, {
      x: barX + barW + 8,
      y: this.y,
      size: 9.5,
      font: this.fonts.bold,
      color: DARK,
    });
    this.y -= 22;
  }

  table(headers: string[], rows: string[][], widths: number[]) {
    const rowH = 22;
    this.ensure(rowH * 2);
    // header
    this.page.drawRectangle({
      x: MARGIN,
      y: this.y - rowH + 14,
      width: CONTENT_W,
      height: rowH,
      color: GREEN,
    });
    let x = MARGIN + 8;
    headers.forEach((h, idx) => {
      this.page.drawText(h, {
        x,
        y: this.y,
        size: 9,
        font: this.fonts.bold,
        color: WHITE,
      });
      x += widths[idx];
    });
    this.y -= rowH;

    rows.forEach((row, ri) => {
      this.ensure(rowH);
      if (ri % 2 === 1) {
        this.page.drawRectangle({
          x: MARGIN,
          y: this.y - rowH + 14,
          width: CONTENT_W,
          height: rowH,
          color: LIGHT,
        });
      }
      let cx = MARGIN + 8;
      row.forEach((cell, idx) => {
        this.page.drawText(cell, {
          x: cx,
          y: this.y,
          size: 9,
          font: this.fonts.regular,
          color: DARK,
        });
        cx += widths[idx];
      });
      this.y -= rowH;
    });
    this.y -= 6;
  }

  drawCoverHeader(data: EsgReportData) {
    const bandH = 96;
    const top = PAGE_H - MARGIN;
    this.page.drawRectangle({
      x: MARGIN,
      y: top - bandH,
      width: CONTENT_W,
      height: bandH,
      color: GREEN,
    });
    this.page.drawCircle({ x: MARGIN + 34, y: top - 34, size: 16, color: WHITE });
    this.page.drawText("E", {
      x: MARGIN + 28,
      y: top - 41,
      size: 20,
      font: this.fonts.bold,
      color: GREEN,
    });
    this.page.drawText("EcoLearn Mauritius", {
      x: MARGIN + 60,
      y: top - 34,
      size: 16,
      font: this.fonts.bold,
      color: WHITE,
    });
    this.page.drawText("Corporate Sustainability & ESG Training", {
      x: MARGIN + 60,
      y: top - 50,
      size: 9,
      font: this.fonts.regular,
      color: GREEN_SOFT,
    });
    this.page.drawText("ESG TRAINING REPORT", {
      x: MARGIN + 16,
      y: top - 80,
      size: 18,
      font: this.fonts.bold,
      color: WHITE,
    });
    this.y = top - bandH - 24;

    // Company + date block
    this.page.drawText(data.company.name, {
      x: MARGIN,
      y: this.y,
      size: 16,
      font: this.fonts.bold,
      color: DARK,
    });
    this.y -= 18;
    const meta = `${data.company.industry ?? "Industry not specified"}  -  Report generated ${formatDate(
      data.generatedAt,
    )}`;
    this.page.drawText(meta, {
      x: MARGIN,
      y: this.y,
      size: 10,
      font: this.fonts.regular,
      color: MUTED,
    });
    this.y -= 24;
  }
}

export async function generateEsgReportPdf(data: EsgReportData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const fonts: Fonts = {
    regular: await pdf.embedFont(StandardFonts.Helvetica),
    bold: await pdf.embedFont(StandardFonts.HelveticaBold),
    italic: await pdf.embedFont(StandardFonts.HelveticaOblique),
  };

  const b = new ReportBuilder(pdf, fonts);
  b.newPage();
  b.drawCoverHeader(data);

  // Executive summary
  b.sectionHeading("Executive Summary");
  b.paragraph(
    `This report summarises ${data.company.name}'s environmental and sustainability training performance, ` +
      `measured through the EcoLearn platform. It covers workforce participation, course completion, assessment ` +
      `outcomes, certifications earned and the estimated environmental impact of staff training. It is intended ` +
      `to be shared with auditors, clients, investors, ESG consultants and certification bodies as supporting ` +
      `evidence of the organisation's commitment to sustainability capability building.`,
  );

  // Sustainability score highlight
  b.ensure(86);
  {
    const boxH = 74;
    const top = b.y;
    b.page.drawRectangle({
      x: MARGIN,
      y: top - boxH,
      width: CONTENT_W,
      height: boxH,
      color: GREEN_SOFT,
      borderColor: GREEN,
      borderWidth: 1,
    });
    b.page.drawText("Sustainability Score", {
      x: MARGIN + 18,
      y: top - 26,
      size: 11,
      font: fonts.bold,
      color: DARK,
    });
    b.page.drawText(`${data.score.score}`, {
      x: MARGIN + 18,
      y: top - 60,
      size: 30,
      font: fonts.bold,
      color: GREEN,
    });
    b.page.drawText("/ 100", {
      x: MARGIN + 18 + fonts.bold.widthOfTextAtSize(`${data.score.score}`, 30) + 6,
      y: top - 56,
      size: 12,
      font: fonts.regular,
      color: MUTED,
    });
    const levelLabel = `${data.score.level} Level`;
    b.page.drawRectangle({
      x: MARGIN + 150,
      y: top - 44,
      width: 86,
      height: 22,
      color: GOLD,
    });
    const llw = fonts.bold.widthOfTextAtSize(levelLabel, 9);
    b.page.drawText(levelLabel, {
      x: MARGIN + 150 + (86 - llw) / 2,
      y: top - 38,
      size: 9,
      font: fonts.bold,
      color: WHITE,
    });
    const nextText = data.score.nextLevel
      ? `${data.score.pointsToNextLevel} points to ${data.score.nextLevel}`
      : "Highest level achieved";
    b.page.drawText(nextText, {
      x: MARGIN + 150,
      y: top - 60,
      size: 9,
      font: fonts.regular,
      color: MUTED,
    });
    b.y = top - boxH - 18;
  }

  // Participation & completion
  b.sectionHeading("Workforce Participation & Completion");
  const p = data.participation;
  b.statGrid([
    { label: "Total employees", value: formatNumber(p.totalEmployees) },
    { label: "Active learners", value: formatNumber(p.activeEmployees), sub: `${p.engagementRate}% engaged` },
    { label: "Training adoption", value: `${p.adoptionRate}%` },
    { label: "Courses assigned", value: formatNumber(p.coursesAssigned) },
    { label: "Courses completed", value: formatNumber(p.coursesCompleted) },
    { label: "Completion rate", value: `${p.completionRate}%` },
    { label: "Avg assessment", value: `${p.avgScore}%` },
    { label: "Learning hours", value: formatNumber(p.learningHours) },
    { label: "Certificates earned", value: formatNumber(p.certificatesIssued) },
  ]);

  // ESG environmental impact
  b.sectionHeading("Estimated Environmental Impact");
  b.paragraph(
    "Environmental impact is estimated from completed training using transparent, conservative factors " +
      "(30 kg CO2 avoided and 15 kg waste diverted per completed course per year). Figures are indicative of " +
      "behaviour change enabled by training, not direct measured emissions.",
    9,
  );
  const im = data.impact;
  b.statGrid([
    { label: "CO2 avoided / year", value: `${formatNumber(im.co2EquivalentKg)} kg` },
    { label: "Equivalent trees", value: formatNumber(im.treesEquivalent) },
    { label: "Waste diverted / year", value: `${formatNumber(im.wasteDivertedKg)} kg` },
  ]);
  b.y -= 4;
  b.barRow("Carbon awareness", im.carbonAwarenessScore);
  b.barRow("Plastic reduction", im.plasticReductionScore);
  b.barRow("Water savings", im.waterSavingsScore);
  b.barRow("Recycling participation", im.recyclingParticipation);
  b.barRow("Sustainability engagement", im.sustainabilityEngagementScore);

  // Score components
  b.sectionHeading("Sustainability Score Breakdown");
  for (const c of data.score.components) {
    b.barRow(c.label, c.value);
  }

  // Department breakdown
  if (data.departments.length > 0) {
    b.sectionHeading("Department Breakdown");
    b.table(
      ["Department", "Employees", "Participation", "Completion"],
      data.departments.map((d) => [
        d.department,
        formatNumber(d.employees),
        `${d.participationRate}%`,
        `${d.completionRate}%`,
      ]),
      [CONTENT_W - 270, 90, 100, 80],
    );
  }

  // Methodology footer note
  b.sectionHeading("Methodology & Assurance");
  b.paragraph(
    "All metrics are derived from real training activity recorded on the EcoLearn platform for the organisation " +
      "named above. Completion, adoption, assessment and engagement rates are calculated from employee records. " +
      "The Sustainability Score is a weighted composite (completion 30%, adoption 25%, assessment 25%, engagement 20%). " +
      "Issued certificates can be independently verified via the QR code printed on each certificate.",
    9,
  );

  return pdf.save();
}
