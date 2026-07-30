# Production Environment Reference — EcoLearnHub

This reference documents mandatory and optional environment variables for EcoLearnHub production deployment.

---

## 1. Environment Variable Inventory

| Variable Name | Required | Secret | Purpose | Safe Example Format |
| :--- | :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Yes | Yes | PostgreSQL connection URI | `postgresql://user:pass@db.example.com:5432/ecolearnhub?sslmode=verify-full` |
| `NODE_ENV` | Yes | No | Runtime mode (`production` / `development`) | `production` |
| `CLERK_SECRET_KEY` | Yes | Yes | Clerk authentication backend secret | `sk_live_...` |
| `CLERK_PUBLISHABLE_KEY` | Yes | No | Clerk frontend publishable key | `pk_live_...` |
| `RESEND_API_KEY` | Optional | Yes | Resend production email API key | `re_...` |
| `SCHEDULER_SECRET` | Yes | Yes | Authentication token for scheduled jobs | `secret_sched_...` |
| `PORT` | Optional | No | API HTTP port | `3000` |

---

## 2. Validation Enforcement
The server checks all required variables on startup using `productionEnvironmentValidator.ts`. In production (`NODE_ENV=production`), missing secrets halt server startup with clear error logs.
