# Route & API Access Audit Report (Sprint 10K)

## Executive Summary
This document details permission enforcement and route guards across all frontend routes and API endpoints.

---

## 1. API Route Permission Matrix

| Endpoint | Required Role | Enforcement Middleware | Status |
| :--- | :--- | :--- | :---: |
| `POST /api/employees` | `company_admin` | `requireCompanyAdmin` | PASS |
| `PATCH /api/employees/:id` | `company_admin` | `requireCompanyAdmin` | PASS |
| `DELETE /api/employees/:id` | `company_admin` | `requireCompanyAdmin` | PASS |
| `GET /api/pilots/overview` | `platform_admin` | `requirePlatformAdmin` | PASS |
| `GET /api/reports/company` | `company_admin` | `requireCompanyAdmin` | PASS |
