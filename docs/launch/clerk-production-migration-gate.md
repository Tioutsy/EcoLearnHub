# Clerk Production Migration Gate & Pre-Launch Checklist

## Project Authentication Status
**AUTHENTICATION STATUS: DEVELOPMENT-READY / PRODUCTION MIGRATION REQUIRED BEFORE COMMERCIAL LAUNCH**

---

## 1. Overview & Accepted Development State
For internal development, feature implementation, and pre-launch validation, ELEVIO SKILLS (`ecolearnhub.com`) operates under a **Clerk Development Instance**.
- **Clerk Development Warning**: The browser console warning (*"Clerk has been loaded with development keys"*) is **expected and accepted** during development.
- **RBAC Functionality**: Application RBAC (Platform Administrator, Company Administrator, Manager, Learner) functions completely independently of the Clerk environment mode.

---

## 2. Pre-Launch Production Migration Checklist

Before commercial launch to external client organisations, the following steps must be completed:

### A. Clerk Production Account & Instance
- [ ] Upgrade Clerk subscription plan if required for production volume.
- [ ] Enable / Create the official **Clerk Production Instance**.
- [ ] Configure `ecolearnhub.com` in Clerk Production domain settings.
- [ ] Configure sign-in, sign-up, and session redirect URLs.
- [ ] Obtain Production publishable key (`pk_live_...`).
- [ ] Obtain matching Production secret key (`sk_live_...`).

### B. Environment Variable Deployment
- [ ] **Frontend Host**: Set `VITE_CLERK_PUBLISHABLE_KEY = pk_live_...` in production build environment.
- [ ] **Backend Render Host**: Set `CLERK_SECRET_KEY = sk_live_...` in Render API environment.
- [ ] Confirm no hardcoded `pk_test_` or `sk_test_` fallback strings exist in source files.

### C. Owner Account Migration (`slennon2206@gmail.com`)
- [ ] Authenticate `slennon2206@gmail.com` in the Clerk Production instance.
- [ ] Verify Production Clerk user ID.
- [ ] Confirm durable `PLATFORM_ADMIN` role assignment (`platformRole = PLATFORM_ADMIN`, `organisationId = null`, `organisationRole = null`).

### D. Secret Rotation
- [ ] Rotate development Clerk secret key.
- [ ] Rotate database connection credentials if previously logged in temporary development scripts.

---

## 3. Commercial Launch Acceptance Gate

Commercial launch is prohibited until all of the following pass:
1. Clerk Production instance enabled and active.
2. Frontend and backend instances match with production keys (`pk_live_...` / `sk_live_...`).
3. Development-mode warning is gone on `ecolearnhub.com`.
4. Platform Administrator role verified for `slennon2206@gmail.com`.
5. Company Admin, Manager, and Learner role boundaries verified across tenants.
