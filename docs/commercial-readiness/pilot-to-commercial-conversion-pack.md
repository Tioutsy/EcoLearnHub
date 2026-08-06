# Pilot-to-Commercial Conversion Pack (Sprint 10D)

## Executive Summary
This document provides the commercial conversion workflow, pricing band presentation, and billing information required when a pilot company converts to a paid subscription.

---

## 1. Approved Commercial Pricing Bands

- **Band 1 (UP_TO_25)**: 1–25 employees (MUR 3,000 / month)
- **Band 2 (FROM_26_TO_50)**: 26–50 employees (MUR 4,500 / month)
- **Band 3 (FROM_51_TO_80)**: 51–80 employees (MUR 5,000 / month)
- **Band 4 (FROM_81_TO_120)**: 81–120 employees (MUR 6,250 / month)
- **Band 5 (OVER_120)**: > 120 employees (Tailored Quotation)

---

## 2. Conversion Process

1. **Pilot Evaluation Review**: Present company pilot report (`GET /api/pilots/company-report`).
2. **Band Selection**: Select employee band based on active roster count.
3. **Commercial Agreement**: Execute subscription agreement; update company record `recordEnvironment = "commercial"` and `externalValidationStage = "stage_8_commercial_customer_confirmed"`.
