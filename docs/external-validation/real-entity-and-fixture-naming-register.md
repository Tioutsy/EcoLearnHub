# Real Entity and Fixture Naming Register (Sprint 10D)

## Executive Summary
This document records the replacement of unverified corporate brand names in test fixtures and demonstration text with clearly fictional names to prevent unverified endorsement claims.

---

## Fixture Naming Replacement Register

| Original Name | Replacement Fictional Name | Sector Context | File Locations Modified | Permission Status |
| :--- | :--- | :--- | :--- | :---: |
| **Lux Resorts Mauritius** | `Coral Bay Hospitality Ltd` | Hospitality & Tourism | `pilotE2ESmokeTest.test.ts`, `PilotDashboard.tsx`, `controlled-pilot-configuration.md`, `pilot-course-assignment-plans.md`, `pilot-commercial-continuation-register.md`, `sprint-10c-cross-pilot-outcome-report.md` | Unconfirmed / Fixture replaced |
| **Mauritius Commercial Bank** | `Island Professional Services Ltd` | Financial Services | `pilotE2ESmokeTest.test.ts`, `controlled-pilot-configuration.md`, `pilot-course-assignment-plans.md`, `pilot-commercial-continuation-register.md`, `sprint-10c-cross-pilot-outcome-report.md` | Unconfirmed / Fixture replaced |

---

## Naming Standards
1. **Source-Controlled Test Fixtures**: Must use fictional entity names ending in `Ltd` (e.g. `Coral Bay Hospitality Ltd`).
2. **Live External Pilot Companies**: Real legal names are only recorded in protected production database instances following signed participation agreements.
