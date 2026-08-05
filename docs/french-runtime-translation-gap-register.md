# Elevio French Runtime Translation Gap Register

## Overview
This document tracks all runtime translation gaps identified during **Sprint 9Y**, recording their root cause, source location, and verification status.

---

## Runtime Defect & Resolution Register

| ID | Route / Workflow | Role | Visible Content / Issue | Content Source | Root Cause | Fix Status | Verification |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **GAP-01** | PDF Certificate Download | Learner / Admin | PDF Certificate static labels ("Certificate of Completion", "Date of Completion") rendered in English | PDF Generator (`certificatePdf.ts`) | PDF generator lacked `locale` parameter | **Resolved** | Verified PDF rendering in `fr` and `en` |
| **GAP-02** | Course Catalogue | All Roles | Course Cards displaying English-only course title/description in French view | Database / API (`courses.ts`) | API handler lacked `locale` parameter handling | **Resolved** | Verified `t()` and API locale header resolution |
| **GAP-03** | Training CSV Reports | Company Admin | CSV report column headers in English when downloaded in French | Report Generator (`reports.tsx`) | Hardcoded CSV header array | **Resolved** | Verified localized CSV exports |
| **GAP-04** | Quiz Results Screen | Learner | Minimum passing score explanation toast rendered in English | Quiz Shell (`quiz/index.tsx`) | Hardcoded string in toast helper | **Resolved** | Verified toast notifications in `fr` |
| **GAP-05** | Form Validation | All Roles | Network error / fallback messages in English | Form handlers | Missing `t()` wrapper | **Resolved** | Verified error state screens |

---

## Defect Summary by Category
- **Hardcoded Component Props**: 2 fixed
- **PDF & Export Templates**: 2 fixed
- **Toast Notifications & Modals**: 1 fixed
- **Third-Party Vendor Boundaries**: Clerk authentication widget text remains under vendor control as documented.
