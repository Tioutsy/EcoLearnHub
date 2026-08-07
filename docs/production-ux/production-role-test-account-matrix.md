# Production Role Test Account Matrix

## 1. Executive Summary
This document establishes the dedicated test account matrix used for Sprint 10Q multi-role browser and runtime permission testing.

---

## 2. Test Account Matrix

| Account Role | Organisation Context | Dedicated Test Email / ID | Tested Capabilities |
| :--- | :--- | :--- | :--- |
| **Platform Administrator** | Platform Global | `admin@elevioskills.com` | Multi-tenant overview, global catalogue management, sector configuration, cross-tenant auditing. |
| **Company Administrator — Alpha** | Test Company Alpha | `admin@companyalpha.mu` | Employee creation, bulk import, company-wide course assignment, billing overview, org settings. |
| **Company Administrator — Beta** | Test Company Beta | `admin@companybeta.mu` | Employee lifecycle management, subscription controls, certificate register verification. |
| **Manager — Alpha** | Test Company Alpha (Logistics) | `manager.logistics@companyalpha.mu` | Team progress overview, team course assignment, team challenge reviews, CSV export. |
| **Manager — Beta** | Test Company Beta (Retail) | `manager.retail@companybeta.mu` | Department completion tracking, team workplace action reviews. |
| **Learner — Alpha** | Test Company Alpha | `learner.alpha@companyalpha.mu` | Course player, decision scenarios, quiz attempts, workplace commitments, certificate view. |
| **Learner — Beta** | Test Company Beta | `learner.beta@companybeta.mu` | Mobile course player experience, bilingual course toggle, certificate download. |

---

## 3. Security & Data Protection Compliance
- No passwords, real secret keys, or active credentials are committed to the repository.
- Synthetic email aliases map to test accounts in controlled testing environments.
