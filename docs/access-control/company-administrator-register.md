# Company Administrator Register (Sprint 10K)

## Executive Summary
This document specifies company administrator discovery standards and active administrator verification rules across subscribing organisations.

---

## 1. Discovery & Audit Rules
1. **Active Admin Count**: Every active subscribing organisation MUST have at least 1 active `company_admin`.
2. **Sole Admin Safeguard**: Attempting to deactivate, delete, or demote the last active `company_admin` of an organisation MUST be rejected with a `409 Conflict` error.
3. **Admin Visibility**: Company administrators are discoverable by authorized users within their organisation to assist with support requests.
