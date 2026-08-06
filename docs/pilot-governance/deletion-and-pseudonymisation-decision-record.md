# Deletion and Pseudonymisation Decision Record (Sprint 10B)

## Executive Summary
This document establishes the technical rules for handling employee departures, account deletions, evidence removals, and audit record preservation.

---

## Technical Decision Rules

1. **Employee Deactivation**: Setting `employees.status = "deactivated"` revokes login access immediately while preserving `enrollments`, `quiz_attempts`, `certificates`, and training reports for audit compliance.
2. **Employee Pseudonymisation**: Upon formal data subject deletion request, the employee's name and email in `employeesTable` are replaced with `Former Learner #{id}` and `deleted-user-#{id}@anonymised.local`. Course completion counts and certificate unique codes remain intact.
3. **Evidence Removal**: Free-text workplace action submissions and uploaded files in `challenges` are deleted from storage upon authorized tenant request.
4. **Certificate Verification**: Issued certificates (`certificatesTable`) remain verifiable by unique code (`/verify-certificate?code=...`) to protect credential integrity for past training.
