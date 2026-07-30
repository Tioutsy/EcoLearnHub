# Sprint 8I Audit — Mauritius Rules & Resources Simplification

## Executive Summary

Sprint 8I simplifies EcoLearnHub's content reference area by retiring the public blog/article interface and repositioning the platform's reference Hub as **Mauritius Rules & Resources**.

---

## 1. Existing System Audit

| Surface | File / Location | Planned Change |
| :--- | :--- | :--- |
| **Navbar Link** | `artifacts/ecolearn/src/components/layout/Navbar.tsx` | Rename "Insights" -> "Mauritius Rules & Resources", path `/mauritius-rules-resources` |
| **Platform Admin Layout** | `artifacts/ecolearn/src/components/layout/PlatformAdminLayout.tsx` | Rename "Insights" -> "Mauritius Rules & Resources" |
| **App Routing** | `artifacts/ecolearn/src/App.tsx` | Add `/mauritius-rules-resources` route; redirect `/insights` and legacy subroutes |
| **Public Page** | `artifacts/ecolearn/src/pages/Insights/` | Rebuild around Laws & Regulations and Official Guidance; remove blog/article cards |
| **Admin Page** | `artifacts/ecolearn/src/pages/platform-admin/insights.tsx` | Remove article editing tabs/dialogs; retain Mauritian Laws & Resources management |
| **API Endpoints** | `artifacts/api-server/src/routes/blog.ts` | Serve `/api/mauritius-resources` and `/api/insights/mauritius-resources`; deprecate `/api/insights/articles` |
| **Database Table `blog_posts`** | `lib/db/src/schema/blog.ts` | **PRESERVED UNCHANGED**. Deprecated in documentation to avoid destructive schema migration risk. |

---

## 2. Route Strategy & Compatibility

- **Canonical Route**: `/mauritius-rules-resources`
- **Legacy Redirects**:
  - `/insights` -> `/mauritius-rules-resources`
  - `/insights/articles` -> `/mauritius-rules-resources`
  - `/insights/articles/*` -> `/mauritius-rules-resources`
  - `/insights/mauritius-resources` -> `/mauritius-rules-resources`

---

## 3. Database Retention Decision

- **`blog_posts` Table**: Kept intact in PostgreSQL schema to prevent foreign key issues, seed failures, or destructive migration risks.
- **Seeder Policy**: Article seeders disabled from auto-population during application startup (`ensureCategoriesAndAssignments.ts`).
