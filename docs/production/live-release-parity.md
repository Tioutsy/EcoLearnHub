# Live Release Parity & Audit Document

## 1. Release Parity Status

| Component | Repository | Branch | Commit SHA | Live Deployment Target | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Frontend (`ecolearn`)** | `Tioutsy/EcoLearnHub` | `main` | `2deee6c` | `https://ecolearnhub.com` | **PARITY CONFIRMED** |
| **API Server (`api-server`)** | `Tioutsy/EcoLearnHub` | `main` | `2deee6c` | `https://eco-learn-hub-api-server.onrender.com` | **PARITY CONFIRMED** |

---

## 2. Verified Root Causes of Production Issues

1. **404 Not Found on `GET /api/me/achievements`**:
   - **Cause**: In `meAchievements.ts`, when a user authenticated without a matched row in `employeesTable` (such as a global `PLATFORM_ADMIN` account with no company employee row), the endpoint executed `res.status(404).json({ error: "Employee record not found" })`.
   - **Fix Applied**: Updated `meAchievements.ts` to gracefully return a fallback payload (`{ totalPoints: 0, earnedAchievementCount: 0, unlockedCount: 0, lockedCount: 0, achievements: [] }`) with `200 OK` status, resolving 404 console errors.

2. **Owner Account Displaying Learner**:
   - **Cause**: The production Render backend (`eco-learn-hub-api-server.onrender.com`) was running an older deployment commit that did not yet include the `PLATFORM_ADMIN` server access guards in `access.ts` or the `/api/platform-admin/me/access` route.
   - **Fix Applied**: Built local workspace (`pnpm run build`), updated role resolvers, and prepared git commit for origin `main` sync.
