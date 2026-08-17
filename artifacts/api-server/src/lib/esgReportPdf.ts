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
    const text = "Elevio Skills  |  Learn. Apply. Improve.";
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

  glossaryTable(items: { term: string; category: string; definition: string }[]) {
    const termW = 150;
    const defW = CONTENT_W - termW - 16;
    
    // Table Header
    this.ensure(28);
    this.page.drawRectangle({
      x: MARGIN,
      y: this.y - 14,
      width: CONTENT_W,
      height: 22,
      color: GREEN,
    });
    this.page.drawText("TERM & PILLAR", {
      x: MARGIN + 8,
      y: this.y - 8,
      size: 9,
      font: this.fonts.bold,
      color: WHITE,
    });
    this.page.drawText("DEFINITION & REPORTING APPLICATION", {
      x: MARGIN + termW + 8,
      y: this.y - 8,
      size: 9,
      font: this.fonts.bold,
      color: WHITE,
    });
    this.y -= 26;

    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      const words = item.definition.split(" ");
      let line = "";
      const lines: string[] = [];
      for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (this.fonts.regular.widthOfTextAtSize(test, 8) > defW) {
          lines.push(line);
          line = word;
        } else {
          line = test;
        }
      }
      if (line) lines.push(line);

      const rowHeight = Math.max(26, lines.length * 10 + 14);
      this.ensure(rowHeight + 2);

      const yTop = this.y;
      if (idx % 2 === 1) {
        this.page.drawRectangle({
          x: MARGIN,
          y: yTop - rowHeight + 14,
          width: CONTENT_W,
          height: rowHeight,
          color: LIGHT,
        });
      }

      this.page.drawText(item.term, {
        x: MARGIN + 8,
        y: yTop,
        size: 8.5,
        font: this.fonts.bold,
        color: DARK,
      });
      this.page.drawText(item.category, {
        x: MARGIN + 8,
        y: yTop - 11,
        size: 7,
        font: this.fonts.regular,
        color: MUTED,
      });

      let lineY = yTop;
      for (const l of lines) {
        this.page.drawText(l, {
          x: MARGIN + termW + 8,
          y: lineY,
          size: 8,
          font: this.fonts.regular,
          color: DARK,
        });
        lineY -= 10;
      }

      this.y = yTop - rowHeight;
    }
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
    this.page.drawText("Elevio Skills", {
      x: MARGIN + 60,
      y: top - 34,
      size: 16,
      font: this.fonts.bold,
      color: WHITE,
    });
    this.page.drawText("Corporate Sustainability & ESG Workforce Capability", {
      x: MARGIN + 60,
      y: top - 50,
      size: 9,
      font: this.fonts.regular,
      color: GREEN_SOFT,
    });
    this.page.drawText("ESG TRAINING & HUMAN CAPITAL REPORT", {
      x: MARGIN + 16,
      y: top - 80,
      size: 17,
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
    const meta = `${data.company.industry ?? "Corporate Sustainability"}  •  Report Generated: ${formatDate(
      data.generatedAt,
    )}  •  Reporting Boundary: Active Workforce`;
    this.page.drawText(meta, {
      x: MARGIN,
      y: this.y,
      size: 9.5,
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
  b.sectionHeading("1. Executive Summary & Reporting Scope");
  b.paragraph(
    `This report provides a structured account of ${data.company.name}'s sustainability training performance, ` +
      `competency development, and workforce engagement on the Elevio Skills platform. Aligned with global ESG reporting ` +
      `standards (GRI 404-1 Human Capital, UN Sustainable Development Goals, and CSRD/ESRS S1), this document provides ` +
      `verifiable evidence of capability building across all departments, supporting internal audits, investor disclosures, ` +
      `and corporate sustainability reporting.`,
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
    b.page.drawText("Elevio Sustainability Score", {
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
      ? `${data.score.pointsToNextLevel} points to reach ${data.score.nextLevel} level`
      : "Highest capability level achieved";
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
  b.sectionHeading("2. Workforce Participation & Social Metrics (GRI 404-1)");
  const p = data.participation;
  b.statGrid([
    { label: "Total employees", value: formatNumber(p.totalEmployees), sub: "Reporting boundary" },
    { label: "Active learners", value: formatNumber(p.activeEmployees), sub: `${p.engagementRate}% engaged` },
    { label: "Training adoption", value: `${p.adoptionRate}%` },
    { label: "Courses assigned", value: formatNumber(p.coursesAssigned) },
    { label: "Courses completed", value: formatNumber(p.coursesCompleted) },
    { label: "Training completion rate", value: `${p.completionRate}%` },
    { label: "Avg assessment mark", value: `${p.avgScore}%` },
    { label: "Total learning hours", value: formatNumber(p.learningHours) },
    { label: "Certificates earned", value: formatNumber(p.certificatesIssued) },
  ]);

  // Score components
  b.sectionHeading("3. Sustainability Score Breakdown");
  b.paragraph(
    "The Sustainability Score is a weighted composite measuring verified capability building across four material dimensions:",
    9,
  );
  for (const c of data.score.components) {
    b.barRow(c.label, c.value);
  }

  // Department breakdown
  if (data.departments.length > 0) {
    b.sectionHeading("4. Departmental Participation & Value Chain Matrix");
    b.table(
      ["Department", "Headcount", "Participation Rate", "Completion Rate"],
      data.departments.map((d) => [
        d.department,
        formatNumber(d.employees),
        `${d.participationRate}%`,
        `${d.completionRate}%`,
      ]),
      [CONTENT_W - 280, 80, 100, 100],
    );
  }

  // Material Topics Covered
  b.sectionHeading("5. Material ESG Topics & Competency Coverage");
  b.paragraph(
    "Workforce training curricula on Elevio map directly to the organisation's material sustainability topics:",
    9,
  );
  b.table(
    ["ESG Pillar", "Material Topic", "LMS Competency Focus", "Framework Alignment"],
    [
      ["Environmental (E)", "Energy & Climate", "Scope 1, 2, 3 awareness, workplace energy efficiency, renewables", "GRI 302, SDG 7 & 13"],
      ["Environmental (E)", "Waste & Circularity", "Waste hierarchy (prevention, reuse, recycling), plastic reduction", "GRI 306, SDG 12"],
      ["Environmental (E)", "Water Stewardship", "Water withdrawal, conservation practices, facility monitoring", "GRI 303, SDG 6"],
      ["Social (S)", "Human Capital", "Training completion rates, DEI, health and safety, employee engagement", "GRI 404, SDG 4 & 8"],
      ["Governance (G)", "Ethics & Anti-Greenwashing", "Code of conduct, compliance, verifiable claims, risk management", "GRI 205, CSRD ESRS G1"],
    ],
    [100, 110, 190, 99],
  );

  // ESG Glossary Reference
  b.sectionHeading("6. ESG Reporting Glossary & Definitions");
  b.paragraph(
    "Reference glossary of core ESG terms, boundaries, and definitions applicable to this training report and corporate disclosures:",
    8.5,
  );
  b.glossaryTable([
    {
      term: "ESG",
      category: "Core ESG",
      definition: "Environmental, Social and Governance: a framework used to understand how an organisation manages sustainability-related risks, opportunities, responsibilities and performance.",
    },
    {
      term: "Double Materiality",
      category: "Reporting Standard",
      definition: "An approach that considers both how sustainability matters affect the organisation (financial materiality) and how the organisation affects people and the environment (impact materiality).",
    },
    {
      term: "Material Topic",
      category: "Materiality",
      definition: "An ESG issue considered sufficiently important to influence stakeholder decisions or the organisation's impacts, risks, opportunities or long-term performance.",
    },
    {
      term: "Training Completion Rate",
      category: "Social (GRI 404-1)",
      definition: "The percentage of assigned learners who successfully completed a specified training course or certified programme within the defined reporting period.",
    },
    {
      term: "Scope 1, 2 & 3 Emissions",
      category: "Environmental (GHG)",
      definition: "Scope 1 (direct emissions), Scope 2 (purchased electricity/energy), and Scope 3 (indirect value chain emissions across supply chain and products).",
    },
    {
      term: "Waste Hierarchy",
      category: "Circular Economy",
      definition: "A prioritisation approach that favours prevention first, followed by reuse, recycling, recovery and, lastly, disposal.",
    },
    {
      term: "Audit Trail",
      category: "Governance",
      definition: "A traceable, tamper-evident record showing the source, assessment scores, completion timestamps, and approval of reported training data.",
    },
    {
      term: "Greenwashing Prevention",
      category: "Governance & Ethics",
      definition: "Ensuring all sustainability credentials, workforce claims, and environmental achievements are grounded in verifiable, assessed learning data.",
    },
    {
      term: "Assurance",
      category: "Governance",
      definition: "Independent review processes or verifiable credentials intended to increase confidence in reported ESG training information and controls.",
    },
  ]);

  // Methodology & Assurance Note
  b.sectionHeading("7. Methodology & Assurance Statement");
  b.paragraph(
    "All training participation, completion, assessment scores, and certification records in this report are " +
      "derived from authenticated learner sessions on the Elevio Skills platform. The Sustainability Score is calculated " +
      "using fixed, transparent weighting (Completion 30%, Adoption 25%, Assessment Average 25%, Engagement 20%). " +
      "All issued certificates contain a unique digital verification reference for third-party auditor validation.",
    8.5,
  );

  return pdf.save();
}
