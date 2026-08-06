# Pilot Activation Readiness Gate (Sprint 10E)

## Executive Summary
This document specifies the 16 mandatory backend readiness conditions evaluated by `evaluateActivationReadinessGate` before permitting external pilot activation.

---

## 16 Mandatory Activation Readiness Conditions

1. **Genuine External Organisation**: `companyId` exists and points to a registered company.
2. **Non-Test Environment**: `isTestRecord = false` and `recordEnvironment = "external_pilot"`.
3. **Authorised Representative**: `primaryContactName` and `primaryContactEmail` populated.
4. **Accepted Participation Evidence**: `evidenceStatus = "ACCEPTED"` and `participationConfirmedAt` set.
5. **Defined Pilot Dates**: `plannedStartDate` and `plannedEndDate` specified.
6. **Defined Learner Scope**: `approvedLearnerLimit > 0`.
7. **Selected Courses**: `selectedCourseIds` contains at least 1 valid course ID.
8. **Company Administrator**: At least 1 active `company_admin` employee exists.
9. **Language Settings**: Default language configured (EN / FR).
10. **Data Import Method**: Learner intake method agreed.
11. **Data Handling Acknowledgement**: `learner_privacy_notice` & `company_pilot_notice` version active.
12. **Assigned Elevio Owner**: `internalOwnerUserId` assigned.
13. **Support Channel**: In-platform `/support` active.
14. **Tenant Isolation**: Backend tenant security verified.
15. **Zero Release-Blocking Defects**: 0 open P0/P1 issues in `pilot_issues`.
16. **Decision Guard Alignment**: Commercial decision guard permits pilot launch.
