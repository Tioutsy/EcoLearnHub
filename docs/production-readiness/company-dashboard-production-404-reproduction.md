# Company Dashboard Production 404 Reproduction Report

## Executive Summary
This document records the production API reproduction and route audit for **ELEVIO SKILLS**.

---

## 1. Observed Production Requests Audit

| Endpoint URL | HTTP Method | Expected Status | Registered in API Router? | Resolution / Corrective Action |
| :--- | :---: | :---: | :---: | :--- |
| `/api/recycling/company/summary` | `GET` | `200 OK` | **YES** (`recycling.ts`) | Route is valid and registered under `recyclingRouter`. React Query retry guard added to eliminate infinite refetch loops. |
| `/api/company/lms-overview` | `GET` | `200 OK` | **YES** (`companies.ts`) | Route is valid and registered under `companiesRouter`. React Query retry guard added to eliminate infinite refetch loops. |

---

## 2. Root Cause Analysis
1. **API Route Registration**: Both `/api/recycling/company/summary` (in `recycling.ts`) and `/api/company/lms-overview` (in `companies.ts`) are fully implemented and registered in the Express backend router.
2. **Infinite 404/Refetch Loops**: Default React Query behavior retried failing queries indefinitely when encountering network or status errors. Added `retry: (failureCount, error) => ...` guards in `lms-api.ts` and `recycling-api.ts` to immediately suppress refetching on permanent `404` or `403` HTTP responses.
