# Pilot Product Defect Register (Sprint 10C)

## Executive Summary
This document tracks all logged product defects, usability observations, and resolution statuses during the external pilot.

---

## Defect Log

| Defect ID | Date Reported | Severity | Workflow | Description | Root Cause | Fix Applied | Test Added | Status |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- | :--- | :---: |
| **DEF-01** | 2026-08-06 | **P1** | Certificates | Certificate PDF date missing French formatting | Missing locale pass-through | Updated `certificates.ts` | `internationalizationAudit.test.ts` | **Resolved** |
| **DEF-02** | 2026-08-06 | **P1** | Subscriptions | Employee creation allowed 26th user on 25-user plan | Boundary check missing | Added employee limit guardrail | `subscriptionIntegrityAndMigration.test.ts` | **Resolved** |
| **DEF-03** | 2026-08-06 | **P2** | CSV Export | French accents malformed in Excel export | Missing UTF-8 BOM marker | Added UTF-8 BOM prefix | `reportingIntegrityAudit.test.ts` | **Resolved** |
| **DEF-04** | 2026-08-06 | **P2** | Action Review | Manager approval comment missing persistence | State update missing in route | Updated `challenges.ts` | `controlledPilotOperationsAudit.test.ts` | **Resolved** |

---

## Open Defect Summary
- **Open P0 Blockers**: 0
- **Open P1 Defects**: 0
- **Open P2 Defects**: 0
- **Overall Status**: Clean
