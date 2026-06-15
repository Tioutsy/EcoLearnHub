---
name: EcoLearn certificate PDF generation
description: How branded certificate PDFs + QR codes are generated server-side and why the approach was chosen.
---

Certificate PDFs are generated on-demand server-side with `pdf-lib` + `qrcode` (both pure-JS), not stored. Binary PDF endpoints are fetched via plain `<a href="/api/...">` links from the frontend, NOT via the Orval-generated client (which expects JSON).

**Why pdf-lib (not pdfkit/puppeteer):** pdf-lib embeds the StandardFonts (Helvetica family) without shipping external font files, so it bundles cleanly through the api-server's esbuild step. pdfkit needs `.afm` font files and puppeteer needs a browser — both fight the single-file esbuild bundle.

**Why on-demand (not stored pdfUrl):** the `certificates.pdf_url` column exists but is intentionally left null; regenerating is cheap and avoids object-storage wiring.

**QR verification URL:** built from `PUBLIC_APP_URL` env, falling back to `https://$REPLIT_DEV_DOMAIN`, pointing at the public frontend route `/certificates/verify/:code`. Set `PUBLIC_APP_URL` in production so QR codes resolve to the deployed domain instead of the dev domain.

**How to apply:** new binary/download endpoints should follow this pattern — set `Content-Type` + `Content-Disposition`, `res.send(Buffer.from(bytes))`, and link to them directly; do not add them to openapi.yaml as JSON operations. Only JSON list endpoints (e.g. `/certificates/company/list`) go through codegen.
