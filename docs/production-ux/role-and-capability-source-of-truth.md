# Role and Capability Source of Truth

## 1. Overview
This document defines the authoritative capability matrix for Elevio Skills across all 4 system roles: **Platform Administrator**, **Company Administrator**, **Manager**, and **Learner**.

---

## 2. Authoritative Role & Capability Matrix

| Capability | Platform Admin | Company Admin | Manager | Learner |
| :--- | :---: | :---: | :---: | :---: |
| **View Own Learning Dashboard** | ✓ | ✓ | ✓ | ✓ |
| **Browse Course Catalogue** | ✓ | ✓ | ✓ | ✓ |
| **Play Assigned Courses / Quizzes** | ✓ | ✓ | ✓ | ✓ |
| **Earn & View Own Certificates** | ✓ | ✓ | ✓ | ✓ |
| **Add / Edit / Remove Employees** | ✓ | ✓ | ✗ | ✗ |
| **Bulk Import Employees via CSV** | ✓ | ✓ | ✗ | ✗ |
| **Assign Courses to Employees** | ✓ | ✓ | ✓ (Team Scope) | ✗ |
| **View Organisation Compliance Reports** | ✓ | ✓ | ✗ | ✗ |
| **View Team Learning Reports** | ✓ | ✓ | ✓ (Team Scope) | ✗ |
| **Export Training Evidence (CSV/PDF)** | ✓ | ✓ | ✓ (Team Scope) | ✗ |
| **Review Workplace Actions / Challenges** | ✓ | ✓ | ✓ (Team Scope) | Own Only |
| **Manage Company Subscription & Billing** | ✓ | ✓ | ✗ | ✗ |
| **Configure Organisation Settings** | ✓ | ✓ | ✗ | ✗ |
| **Access Multi-Tenant Platform Admin Portal** | ✓ | ✗ | ✗ | ✗ |
| **Manage Global Course Catalogue** | ✓ | ✗ | ✗ | ✗ |

---

## 3. UI Presentation Standard
1. **Hidden Controls**: If a user role lacks a capability, controls for that action MUST NOT be displayed in navigation, sidebars, or quick action cards.
2. **Contextual Messaging**: Direct navigation to restricted URLs renders an explicit user-facing access boundary notice rather than a raw 403 or blank page.
3. **Role Identification**: User interface header displays human-readable role badges (`Platform Administrator`, `Company Administrator`, `Manager`, `Learner`) alongside the organisation context.
