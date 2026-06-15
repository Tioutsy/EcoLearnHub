---
name: EcoLearn ESG training report PDF
description: How the shareable ESG training report PDF is composed and where its source metrics come from.
---

The ESG Training Report is a multi-page A4 portrait PDF generated on demand at `GET /api/esg/report`, downloaded via plain `<a href>` (same binary-endpoint pattern as certificate PDFs — NOT through the Orval client). A reusable `ReportBuilder` class in `esgReportPdf.ts` handles cursor-based layout with automatic page breaks, section headings, stat grids, horizontal bar rows, and tables.

**Single source of truth for metrics:** the report reuses the same `computeImpact()` and `computeScore()` functions that back `/esg/impact` and `/esg/score`, so the PDF can never drift from what the UI shows. When changing the ESG estimation model or score weighting, edit those shared functions once.

**Why a builder class (not flat draw calls):** the report grows/shrinks with real data (department count varies), so content must reflow across pages. A fixed-coordinate layout like the certificate would clip or overlap.

**How to apply:** any new report section should go through the builder helpers (`sectionHeading`, `statGrid`, `barRow`, `table`, `paragraph`) so page-break handling stays automatic. Keep all derived numbers coming from the shared compute functions, not recomputed inline.
