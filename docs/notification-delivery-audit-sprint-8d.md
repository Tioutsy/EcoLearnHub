# Sprint 8D — Production Notification Delivery & Communication Reliability Audit

## Executive Summary

Sprint 8D establishes a production-grade, authoritative notification delivery pipeline, email template engine, provider abstraction layer, retry policy, deduplication protection, learner preference control, and administrative delivery health monitoring for EcoLearnHub.

---

## 1. Initial Audit & Findings

### Existing Foundations
- `notificationDeliveryLogsTable`: Stores `companyId`, `employeeId`, `userId`, `assignmentId`, `notificationType`, `channel`, `recipient`, `deduplicationKey`, `status` (`pending`, `processing`, `delivered`, `failed`, `skipped`, `cancelled`), `retryCount`, `failureCode`, `failureMessage`, `providerMessageId`.
- `notificationPreferencesTable`: Stores `companyId`, `employeeId`, `userId`, `optionalEngagementReminders`.
- `notificationService.ts`: Currently acts as a basic logger dispatch adapter.
- `reminderSchedulerService.ts`: Implements candidate selection and deduplication keys.

### Gaps & Risks Identified
1. **Lack of Provider Abstraction Layer**: Dispatch calls logger directly without vendor abstraction (`NotificationProvider` interface with Resend / SMTP / Log adapters).
2. **Inline / Unstructured Email Content**: Email text and HTML are built inline rather than using a professional, responsive template system with HTML escaping and plain-text fallbacks.
3. **Explicit Notification Classification**: Lack of formal division between `operational` (mandatory account & assignment notifications), `reminder` (policy-driven compliance alerts), and `optional` (engagement suggestions).
4. **Retry & Dead-Letter Handling**: Temporary provider network failures need exponential backoff retry handling with `retryCount`, `nextAttemptAt`, and max attempt caps (e.g., 3 attempts).
5. **Administrative Visibility & Learner Preference Management**: Require API endpoints (`GET /api/notifications/preferences`, `PATCH /api/notifications/preferences`, `GET /api/companies/notification-logs`) and diagnostic scanner (`notificationDeliveryDiagnostics.ts`).
6. **Data Retention & Privacy**: Privacy policy document required (`docs/notification-data-retention-guidance.md`).

---

## 2. Architecture Strategy for Sprint 8D

1. **Provider Abstraction** (`notificationProvider.ts`):
   - `NotificationProvider` interface (`sendEmail(input): Promise<ProviderDeliveryResult>`).
   - `ResendProvider` (for production using `RESEND_API_KEY`), `SmtpProvider` (using `SMTP_HOST`), and `DevLogProvider` (for testing/development).
2. **Email Template Engine** (`emailTemplateEngine.ts`):
   - Professional, responsive, accessible HTML + plain-text email renderer for 11 core message types.
   - Restrained, non-punitive neutral tone.
3. **Authoritative Delivery Service** (`notificationDeliveryService.ts`):
   - Accepts structured `NotificationDeliveryRequest`.
   - Validates recipient company membership, checks preferences, checks deduplication keys, manages lifecycle states (`pending` -> `processing` -> `delivered` / `failed` / `skipped`), logs audit events.
4. **Preference Management**:
   - Learner-facing preferences endpoint (`/api/notifications/preferences`) separating operational vs optional engagement.
5. **Administrative Delivery Visibility & Diagnostics**:
   - Company-admin delivery logs view (`GET /api/companies/notification-logs`).
   - `notificationDeliveryDiagnostics.ts` read-only audit scanner.
6. **Dedicated Test Suite**:
   - `notificationDeliveryAudit.test.ts` covering tenant isolation, preference enforcement, deduplication, retry handling, and template rendering.
