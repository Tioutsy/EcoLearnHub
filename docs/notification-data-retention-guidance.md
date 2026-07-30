# Notification Data Retention & Privacy Guidance — EcoLearnHub

This document sets out EcoLearnHub's internal data retention rules, privacy safeguards, and logging policies for notification and email delivery operations.

---

## 1. Data Minimisation & Log Content
- **No Token or Credential Storage**: Invitation tokens, password reset links, authentication headers, and API provider secret keys must **never** be stored in delivery log tables or general audit logs.
- **Provider References**: Delivery logs store provider message IDs (e.g., `msg_resend_12345`) for delivery verification and troubleshooting.
- **Recipient References**: Recipient email addresses and employee IDs are recorded to enable company administrator delivery health tracking.

---

## 2. Retention Schedules

| Data Category | Retention Period | Action |
| :--- | :--- | :--- |
| **Delivery Logs** (`notification_delivery_logs`) | 180 Days | Automatically archived or purged after 6 months |
| **Delivery Diagnostics & Error Logs** | 90 Days | Purged after 90 days |
| **Audit-Ready Training Certificates** | Indefinite / Life of Company | Retained as authoritative compliance evidence |
| **Notification Preferences** | Active Account Lifecycle | Removed upon company data deletion request |

---

## 3. Account Deactivation & Company Termination
- When an employee is deactivated, scheduled notification dispatches cease immediately.
- Historical delivery logs are preserved for audit purposes.
- Upon company contract termination or formal data erasure request, company delivery logs are purged in accordance with standard data processing agreements.
