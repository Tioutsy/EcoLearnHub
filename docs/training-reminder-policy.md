# Corporate Training Reminder & Engagement Policy — EcoLearnHub

This document outlines EcoLearnHub's automated training reminder policy, deduplication rules, and notification delivery mechanisms.

---

## 1. Automated Reminder Categories & Schedule

| Category | Default Trigger Rule | Max Frequency |
| :--- | :--- | :--- |
| `invitation_pending` | 3 days & 7 days after initial invitation | 2 reminders total |
| `assignment_not_started` | 3 days after initial assignment | 1 reminder |
| `due_soon` | 7 days & 2 days prior to assignment due date | 2 reminders |
| `overdue` | 1 day after due date, then weekly | Weekly (max 4) |
| `inactive_in_progress` | 7 days without learning activity on active course | 1 per fortnight |
| `quiz_retry` | 2 days after failing quiz attempt if not retried | 1 reminder |
| `pathway_continuation` | 5 days after completing course in active pathway | 1 reminder |

---

## 2. Idempotency & Deduplication Control
- Every automated reminder dispatch generates a unique **Deduplication Key**:
  `comp_{companyId}_emp_{employeeId}_asgn_{assignmentId}_{type}_{policyPeriod}`
- The scheduler checks `notification_delivery_logs` before dispatching. If a log exists for the same deduplication key, the reminder is skipped.
- Deactivated employees, completed assignments, and cancelled assignments are automatically excluded from all reminder dispatches.

---

## 3. Notification Channel & Failure Isolation
- Dispatch occurs via the central `notificationService.ts` provider.
- Delivery failures (e.g. invalid SMTP or network timeouts) are recorded with status `"failed"` in `notification_delivery_logs`.
- Delivery failures **never** cause database transaction rollbacks or disrupt core learning workflows.
