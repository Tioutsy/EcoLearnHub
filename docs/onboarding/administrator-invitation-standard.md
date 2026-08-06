# Administrator Invitation Standard (Sprint 10L)

## Executive Summary
This document specifies primary administrator invitation creation, expiration, cancellation, and tenant binding.

---

## 1. Invitation Lifecycle
- **Tenant Bound**: Invitations are explicitly bound to `companyId` and `intended_role`.
- **States**: `PENDING`, `SENT`, `ACCEPTED`, `EXPIRED`, `CANCELLED`.
- **Security**: Client-submitted role claims during invitation acceptance are rejected; role assignment occurs strictly on the backend.
