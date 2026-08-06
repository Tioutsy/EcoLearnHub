# Organisation Source-of-Truth Standard (Sprint 10L)

## Executive Summary
This document specifies authoritative ownership between Clerk and the internal Elevio Database.

---

## 1. Data Ownership Matrix

| Data Dimension | Authoritative Source | Notes |
| :--- | :--- | :--- |
| User Identity & Auth | Clerk | Email verification and authentication tokens |
| Company Tenant Record | Elevio Database | `companiesTable` internal integer ID |
| Employee Record | Elevio Database | `employeesTable` linked via `clerkUserId` and `companyId` |
| Role & Capability | Elevio Access Engine | `access.ts` role resolution (`company_admin`, `manager`, `employee`) |
| Subscription Band | Elevio Database | `employeeBandsTable` capacity limits (25, 50, 80, 120, >120) |
| Course Assignments | Elevio Database | `courseAssignmentsTable` and `enrollmentsTable` |
