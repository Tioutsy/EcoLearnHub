# Repository & Commercial Architecture Discovery Document (Sprint 10P)

## Executive Summary
This document records the repository and commercial architecture discovery conducted for **Sprint 10P — Repeatable Multi-Company Commercial Onboarding, Subscription Enforcement, Customer Success Scaling & Portfolio Readiness Decision**.

---

## 1. Verified Architecture & Commercial Source of Truth

- **Frontend Application**: Vite + React SPA (`artifacts/ecolearn`).
- **Backend API Application**: Node.js + Express (`artifacts/api-server`).
- **Database Model**: PostgreSQL (Drizzle ORM) with multi-tenant company separation (`companiesTable`, `companySubscriptionsTable`, `employeesTable`).
- **Billing Architecture**: Provider-neutral billing status tracking (`PAYMENT_PENDING`, `PAID`, `OVERDUE`) supporting manual purchase orders, invoices, and commercial approvals.
