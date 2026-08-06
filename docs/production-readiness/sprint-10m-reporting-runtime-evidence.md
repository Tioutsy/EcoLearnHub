# Reporting Runtime Evidence (Sprint 10M)

## Executive Summary
This document registers CSV/PDF report generation, company completion tracking, and department filter verification.

---

## 1. Reporting Summary
- **Training Reports**: `GET /api/reports/training` exports complete learner progress, completion dates, and quiz scores.
- **CSV & PDF Export**: CSV exports generate valid formatted files without HTML errors. PDF certificate generation functions without broken images or localhost links.
- **Tenant Isolation**: Reports filter strictly by authenticated company tenant ID.
