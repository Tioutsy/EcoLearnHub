# EcoLearnHub Production Deployment Runbook

## Overview
This runbook provides step-by-step procedures for deploying EcoLearnHub to Render production environments safely, executing database migrations, and verifying platform integrity.

---

## 1. Deployment Architecture
- **Git Provider**: GitHub (`Tioutsy/EcoLearnHub`)
- **Production Branch**: `main`
- **Hosting Platform**: Render
  - API Service (`@workspace/api-server`)
  - Frontend App (`@workspace/ecolearn`)
- **Database**: PostgreSQL (Neon Cluster)

---

## 2. Pre-Deployment Verification Checklist
Before triggering a production build, verify locally:
```bash
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run test
pnpm run build
```

---

## 3. Deployment Steps
1. Commit all verified sprint features, fixes, and schema migrations:
   ```bash
   git add .
   git commit -m "feat(release): deploy Sprints 7X through 8I production release"
   ```
2. Push to production branch:
   ```bash
   git push origin main
   ```
3. Observe Render deployment logs for API server and Web client.
4. Verify server health endpoints:
   - `/healthz`
   - `/ready`
   - `/api/platform-admin/health-details`

---

## 4. Rollback Procedure
If a production deployment fails:
1. Revert to previous deployment ID in Render dashboard or redeploy previous commit SHA `5d3217c`.
2. Inspect Render build and runtime logs.
