# Live Production Runtime Discovery

## 1. Executive Summary
This document records the discovery of the live production environment for **ELEVIO SKILLS** (`ecolearnhub.com`) to reconcile local development changes with the live production deployment.

---

## 2. Environment Comparison Matrix

| Component | Local Development | Live Production (`ecolearnhub.com`) |
| :--- | :--- | :--- |
| **Frontend Host** | `http://localhost:5173` / `24777` | `https://ecolearnhub.com` |
| **API Server Host** | `http://localhost:8080` | Production Express Backend |
| **Git Commit SHA** | Uncommitted working tree | `96010052bb45586ad39fa2979fb6bde216afdd1e` |
| **Clerk Secret Environment** | `sk_test_nu4y7eLWywLqkuEP0x0wqZYYKc4frD4mn4iQHDZATx` | Live Production Clerk Credentials |
| **Database Connection** | Neon PostgreSQL (`neondb`) | Neon Production Database |
| **Owner Identity Role (`slennon2206@gmail.com`)** | `platform_admin` | Pending Git Commit & Deployment Push |

---

## 3. Production Failure Cause Classification
- **Primary Root Cause**: **Stale Production Deployment**. The code changes containing the Platform Admin routes, `GET /api/platform-admin/me/access` endpoint, `PlatformAdminLayout` sidebar links, and `authHelpers.ts` role updates were sitting uncommitted in the local working directory and had not yet been committed to Git or pushed/deployed to the live production server (`ecolearnhub.com`).
