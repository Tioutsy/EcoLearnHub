# Test, Demo and Live Data Separation (Sprint 10D)

## Executive Summary
This document specifies the database columns and backend API filters that isolate test and demonstration data from live external pilot reporting.

---

## Technical Separation Architecture

- **Schema Fields**: `pilot_companies` table contains:
  - `isTestRecord`: `boolean` (true for test fixtures, false for live pilots).
  - `recordEnvironment`: `text` (`"test" | "demo" | "external_pilot" | "commercial"`).
  - `externalValidationStage`: `text` (Stage 0 to Stage 8).
- **Backend API Filtering**: `GET /api/pilots/overview` and `GET /api/pilots/monitoring` filter out records where `isTestRecord = true` or `recordEnvironment = 'test'` by default unless explicitly requested by automated test runners.
- **Reporting Exclusion**: Cross-pilot reports and platform metrics exclude test/demo completions to ensure real market validation figures remain unpolluted.
