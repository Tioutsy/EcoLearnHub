# Sprint 10M — Repository & Environment Discovery Document

## Executive Summary
This document records the repository and deployment environment discovery conducted for **Sprint 10M — End-to-End Production Readiness, Live Company Simulation, Launch Blocker Closure & Controlled Go-Live Decision**.

---

## 1. Architecture & Environment Inventory

- **Frontend Application**: Vite + React SPA (`artifacts/ecolearn`).
- **Backend API Application**: Node.js + Express (`artifacts/api-server`).
- **Database Provider**: PostgreSQL (Drizzle ORM).
- **Authentication**: Clerk (`@clerk/express`, `@clerk/react`).
- **Health Endpoints**: `/healthz`, `/health`, `/ready`.
- **Environment Isolation**: Production environment variables configured without localhost or mock dependencies in core mutation flows.
