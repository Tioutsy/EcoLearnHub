# Billing Status and Access Standard (Sprint 10P)

## Executive Summary
This document specifies provider-neutral billing states (`PAYMENT_PENDING`, `PAID`, `OVERDUE`, `SUSPENDED`).

---

## 1. Billing Lifecycle States
- **PAYMENT_PENDING**: Invoice or PO issued; grace period active.
- **PAID**: Active status; platform access open.
- **OVERDUE**: Past due; admin warnings displayed.
- **SUSPENDED**: Administrative hold; access blocked cleanly.
