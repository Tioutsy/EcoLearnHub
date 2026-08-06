# Sprint 10B Runtime Validation Register

## Executive Summary
This document records the manual and automated runtime checks conducted for pilot notices, employee deactivation, export downloads, and mobile responsiveness.

---

## Runtime Check Log

| Check Item | Target Surface | Locale | Expected Result | Verified Result | Status |
| :--- | :--- | :---: | :--- | :--- | :---: |
| **Admin Pilot Notice Modal** | `/company/onboarding` & Dashboard | EN / FR | Modal displays pilot conditions, requires single-click acknowledgement | Acknowledged & recorded in DB (`company_pilot_notice` v1.0) | PASS |
| **Learner Privacy Notice** | `/learn/:courseId` | EN / FR | Modal displays data visibility rules, requires acknowledgement | Acknowledged & recorded in DB (`learner_privacy_notice` v1.0) | PASS |
| **Upload Warning** | Action submission form | EN / FR | Displays sensitive-data warning above file upload input | Warning displayed prominently | PASS |
| **Privacy Page** | `/privacy` | EN / FR | Accessible in footer/nav with comprehensive data processing policy | Fully rendered | PASS |
| **Terms Page** | `/terms` | EN / FR | Accessible in footer/nav with pilot terms & legal disclaimer | Fully rendered | PASS |
| **Support Page** | `/support` | EN / FR | Accessible in footer/nav with issue reporting form | Fully rendered | PASS |
| **Employee Deactivation** | `/company/employees` | Backend API | Setting status to `deactivated` revokes login while retaining reports | Retained in DB & reports | PASS |
| **Company Data Export** | `GET /api/companies/export` | Backend API | Downloads full JSON file of company roster, assignments, progress | Tenant-scoped export generated | PASS |
