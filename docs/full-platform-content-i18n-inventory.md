# Full Platform Content i18n Inventory

## Overview
This document audits every active route, dynamic content source, certificate template, report generator, and email template across Elevio to track English and French availability.

---

## 1. Interface & Platform Routes Inventory Matrix

| Route / Area | Content Source | English Status | French Status | Delivery Method | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Navbar & Footer** | `config/translations.ts` | 100% | 100% | React Context | Includes brand lockup & legal operator notices |
| **Learner Dashboard** | `dashboard/index.tsx` | 100% | 100% | Dynamic `t()` | Includes progress metrics & status tags |
| **Course Catalogue** | `courses/index.tsx` | 100% | 100% | Dynamic `t()` & API | Preserves English course notice badge |
| **Course Details** | `courses/detail.tsx` | 100% | 100% | Dynamic `t()` & API | Overview, prerequisites, and CTA buttons |
| **Lesson Player** | `DatabaseCoursePlayer.tsx` | 100% | 100% | Dynamic `t()` & API | Player controls & module navigation |
| **Quiz Shell** | `quiz/index.tsx` | 100% | 100% | Dynamic `t()` & API | Question counter, submission, & result screens |
| **Company Dashboard** | `company/index.tsx` | 100% | 100% | Dynamic `t()` | Overview KPI cards & chart labels |
| **Employee Management**| `company/employees.tsx` | 100% | 100% | Dynamic `t()` | Employee roster, modals, & status tags |
| **Challenge Reviews** | `company/challenges-review.tsx` | 100% | 100% | Dynamic `t()` | Status filters, detail drawers, & CSV export |
| **Compliance & Reports**| `company/compliance.tsx` / `reports.tsx` | 100% | 100% | Dynamic `t()` | Compliance tables & CSV download headers |
| **Certificates Hub** | `certificates/index.tsx` | 100% | 100% | Dynamic `t()` & PDF | PDF headers preserve `Elevio by Recyclean` |

---

## 2. Course Content Inventory (ELH-01 to ELH-29)

| Course Code | Title | Lessons | Quiz Questions | English Available | French Available | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **ELH-01** | Sustainability Foundations | 6 | 8 | Yes | Yes | Fully Bilingual |
| **ELH-02** | Waste Sorting & Mauritian Bin System | 6 | 8 | Yes | Yes | Fully Bilingual |
| **ELH-03** | Energy Efficiency at Work | 6 | 8 | Yes | Yes | Fully Bilingual |
| **ELH-04** | Water Conservation | 6 | 8 | Yes | Yes | Fully Bilingual |
| **ELH-05** | Sustainable Procurement | 6 | 8 | Yes | Yes | Fully Bilingual |
| **ELH-06** | Green Office Practices | 6 | 8 | Yes | Yes | Fully Bilingual |
| **ELH-07** | Carbon Footprint Awareness | 6 | 8 | Yes | Yes | Fully Bilingual |
| **ELH-08** | Biodiversity in Mauritius | 6 | 8 | Yes | Yes | Fully Bilingual |
| **ELH-09** | ESG Basics | 6 | 8 | Yes | Yes | Fully Bilingual |
| **ELH-10** | Environmental Compliance | 6 | 8 | Yes | Yes | Fully Bilingual |
| **ELH-11** | Circular Economy | 6 | 8 | Yes | Yes | Fully Bilingual |
| **ELH-12** | Final Sustainability Certification | 6 | 15 | Yes | Yes | Fully Bilingual |
| **ELH-13..29**| Applied & Departmental Courses | 6 each | 8 each | Yes | Yes | Fully Bilingual |
