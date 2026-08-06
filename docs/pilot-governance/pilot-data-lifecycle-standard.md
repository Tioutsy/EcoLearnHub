# Pilot Data Lifecycle Standard (Sprint 10B)

## Executive Summary
This document defines the 17-stage operational data lifecycle for pilot organisations and learners on Elevio Skills by Recyclean.

---

## Data Lifecycle Stages

1. **Company Onboarding**: Organization record created; initial Company Admin assigned.
2. **Admin Invitation**: Admin accepts invitation; accepts `company_pilot_notice` (v1.0).
3. **Employee Roster Setup**: Employees added manually or invited; account statuses set to `active`.
4. **Learner First Access**: Learner signs in; accepts `learner_privacy_notice` (v1.0) prior to starting training.
5. **Course Enrolment**: Mandatory & elective courses assigned to employees.
6. **Active Learning & Progress**: Progress updated in real-time; attempts recorded deterministically.
7. **Course Completion & Certification**: Score >= 80% creates 1 completion record and 1 unique certificate.
8. **Workplace Action Submission**: Free-text commitments and evidence files submitted with sensitive-data warnings.
9. **Manager Review**: Submissions reviewed, commented upon, and approved/returned.
10. **Employee Deactivation**: Account marked `deactivated`; login blocked while preserving historical completion evidence.
11. **Employee Departure**: Personal profile data pseudonymised upon formal request; training records retained.
12. **Data Correction**: Authorized Company Admin updates employee name/department; certificates maintain issued reference.
13. **Company Data Export**: Company Admin generates full JSON/CSV export upon pilot completion or request.
14. **Pilot Completion & Transition**: Company converts to paid subscription or enters archived state.
15. **Pilot Closure & Archival**: Archived company blocks new course assignments while allowing read-only reporting.
16. **Data Deletion Request**: Tenant evidence files and free-text submissions removed upon authorized written request.
17. **Backup Expiration**: Database backup cycles expire after 30 days.
