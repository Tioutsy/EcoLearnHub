# Platform Localisation Inventory (Sprint 10J)

## Executive Summary
This document provides a comprehensive inventory of learner, manager, and administrative routes, UI components, and course content fields audited for French translation.

---

## 1. Audited Component & Route Inventory

| Scope | Target Surface | Translation Source | Status |
| :--- | :--- | :--- | :---: |
| **Learner Dashboard** | Course Catalogue, Progress, Badges | `translations.ts` (FR) | PASS |
| **Course Player** | Module Titles, Lessons, Scenarios, Feedback | `frenchCourseContent.ts` | PASS |
| **Company Admin** | Employee Onboarding, Assignments, Reports | `translations.ts` (FR) | PASS |
| **Certificates** | Locale-Aware PDF Rendering, Statements | `certificatePdf.ts` | PASS |
| **All 29 Courses** | ELH-01 through ELH-29 Full Metadata & Lessons | `frenchCourseRegistry` | PASS |

---

## 2. Zero English Fallback Rule
- **Development & Test**: Missing French fields produce an immediate test validation error specifying the exact course and field.
- **Structural Parity**: 100% parity maintained between English and French lesson, scenario, and question structures.
