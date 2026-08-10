# Sprint AI-01 — Current State Audit & Architecture Plan

## Executive Summary
This document records the repository pre-implementation audit for **Sprint AI-01 — Intelligent Learning Path Recommendations**.

---

## 1. Current Architecture Discovery

### Monorepo & Project Structure
* **Package Manager**: `pnpm` workspaces (`pnpm-workspace.yaml`).
* **Backend API (`artifacts/api-server`)**: Express.js server (`Node.js` v20+ runtime), TypeScript, Drizzle ORM, Node test runner.
* **Frontend Web Application (`artifacts/ecolearn`)**: Vite + React 19 + TypeScript, TailwindCSS v4, TanStack Query v5, Wouter for routing, Radix UI components, Lucide icons.
* **Database Package (`lib/db`)**: PostgreSQL schema managed via Drizzle ORM (`pg`).
* **Zod Schemas (`lib/api-zod`)**: Shared API Zod schemas and validation definitions.

### Existing Domain & Database Schema Audit
* **Companies Table (`companiesTable`)**:
  * Fields: `id`, `name`, `slug`, `industry`, `logoUrl`, `planId`, `employeeCount`, `maxEmployees`, `completionRate`, `certificatesIssued`, `badges`, `isPublicProfile`, `leaderboardEnabled`, `stripeCustomerId`, `recyclingServiceStatus`, `createdAt`, `updatedAt`.
  * **Gap Identified**: Missing explicit `trainingPriorities` column for company-wide sustainability focus areas.
* **Employees Table (`employeesTable`)**:
  * Fields: `id`, `companyId`, `clerkUserId`, `email`, `name`, `department`, `jobTitle`, `role`, `status`, `invitationStatus`, `enrolledCourses`, `completedCourses`, `avgScore`, `learningMinutes`.
  * **Role Values**: `admin`, `manager`, `employee`.
* **Courses Table (`coursesTable`)**:
  * Fields: `id`, `courseCode` (e.g. `ELH-01`, `ELH-02`), `title`, `description`, `level`, `durationMinutes`, `isPublished`, `isFeatured`, `prerequisites`.
* **Course Entitlements & Catalog (`planCourseEntitlementsTable`, `categoriesTable`)**:
  * Published course catalogue includes 12 core sustainability & ESG modules (e.g., `ELH-01` to `ELH-12`).
* **Enrollments & Assignments (`enrollmentsTable`, `courseAssignmentsTable`)**:
  * Course assignments are tracked per employee (`employeeId`, `courseId`, `assignedBy`, `dueDate`, `status`).

### Existing Recommendation Infrastructure
* **Learner Next Course Recommendation (`artifacts/api-server/src/lib/recommendationService.ts`)**:
  * Implements deterministic learner progression rules (overdue assigned course -> next course on learning path -> fallback).
  * **Gap Identified**: No company-admin AI role-based pathway recommendation engine exists.

---

## 2. Sprint AI-01 Plan & Integration Blueprint

### Lightweight Database Extension
* Add `training_priorities` array column (`text("training_priorities").array().notNull().default([])`) to `companiesTable`.
* Support selection of up to 3 priorities:
  * `sustainability_foundations`, `waste_circularity`, `energy_efficiency`, `water_conservation`, `esg_literacy`, `sustainable_procurement`, `environmental_awareness`, `governance_responsible_business`, `esg_data_reporting`, `workplace_sustainability`.

### AI Provider & Abstraction Architecture
* Implement `LearningRecommendationProvider` interface in `artifacts/api-server/src/lib/ai/recommendationProvider.ts`.
* Native provider implementation using Google Gemini API (`@google/genai` or direct fetch using `GEMINI_API_KEY`).
* Strict fallback mechanism when `GEMINI_API_KEY` is missing or when API call times out/fails:
  * Deterministic rule-based fallback service matching employee department + company priorities against existing course database metadata.

### Server-Side Grounding & Strict Validation
1. Query active, published courses directly from `coursesTable` with prerequisites and category assignments.
2. Supply only sanitized, non-PII context to the LLM (Company Sector, Employee Department, Role Category, Completed Course Codes, Priority List, Available Course Metadata).
3. Validate every recommended course ID returned by LLM against active DB records.
4. Filter out hallucinated course IDs (e.g. `ELH-99`), filter completed courses, and enforce prerequisite ordering.
5. Guarantee 3–6 valid recommendations returned to frontend.

### Tenant Isolation & RBAC Protection
* Endpoint: `POST /api/companies/employees/:id/recommendations`.
* Protected via `requireCompanyAdmin(req)`:
  * Rejects unauthenticated requests (`HTTP 401`).
  * Rejects non-admin/learner requests (`HTTP 403`).
  * Enforces `employee.companyId === access.companyId` to prevent cross-tenant access.

### Administrator UI Integration (`artifacts/ecolearn`)
* Add **"Smart Recommendation" / "Recommended Learning Path"** card in employee detail modal/drawer within the Company Admin Workspace (`/company/employees`).
* Displays priority badge, concise human-readable explanation per course, and selection checkboxes.
* Allows one-click batch course assignment using the existing `POST /api/companies/assignments` endpoint.
