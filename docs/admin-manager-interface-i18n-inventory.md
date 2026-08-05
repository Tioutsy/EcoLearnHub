# Elevio Administrator & Manager Interface Internationalisation (i18n) Inventory

## Overview
This document details the company-administrator and manager-facing interface audit conducted during **Sprint 9X**. It accounts for all admin/manager routes, management modals, compliance tables, export tools, and shared layout elements.

---

## Admin & Manager Route Inventory Matrix

| Route / Component | Target Role | Strings Found | Translation Status | Excluded Content | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Company Dashboard (`company/index.tsx`)** | Company Admin / Manager | Company Overview, Total Employees, Active Learners, Completion Rate, Overdue Training | **Translated (Sprint 9X)** | Dynamic company name, employee numbers | Recharts tooltips & headers integrated |
| **Employee Management (`company/employees.tsx`)** | Company Admin | Employee Management, Add Employee, Edit Employee, Send Invite, Role & Department filters | **Translated (Sprint 9X)** | Employee names, email addresses, job titles | Preserves employee creation/invitation modal logic |
| **Challenge Reviews (`company/challenges-review.tsx`)** | Manager / Admin | Employee Challenge Reviews, Awaiting Review, Approved, Returned, Evidence text, Review notes | **Translated (Sprint 9X)** | Submitted challenge text | Detail dialogs & CSV export headers translated |
| **Training & Compliance (`company/compliance.tsx`)** | Manager / Admin | Employee Training & Compliance Overview, Status filters, Completion dates, Detail modal | **Translated (Sprint 9X)** | Employee names, course titles | Preserves manager entitlement boundaries |
| **Training Reports (`company/reports.tsx`)** | Manager / Admin | Training & Compliance Reports, Export CSV, Status filters, Report table columns | **Translated (Sprint 9X)** | Database records | CSV download headers & status badges translated |

---

## Shared Component Classification
1. **Interface Labels & Modals**: 100% translated in English and French dictionaries (`admin.*`, `common.*`, `dashboard.*`).
2. **Educational Course Content**: Course titles and codes (`ELH-01` .. `ELH-29`) remain intact across all administrative views.
3. **Database Records**: Dynamic employee names, email addresses, company names, and submission timestamps are interpolated dynamically without string fragmentation.
