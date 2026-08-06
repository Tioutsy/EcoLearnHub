# Clerk & Database Reconciliation Standard (Sprint 10L)

## Executive Summary
This document specifies tenant identity reconciliation between Clerk session claims and Elevio database tables.

---

## 1. Reconciliation Logic
1. **Identifier Matching**: Match `clerkUserId` and lowercase `email` against `employeesTable`.
2. **Auto Link**: Link unlinked employees when matching Clerk login succeeds.
3. **Role Validation**: Re-evaluate effective access role against `access.ts` capability engine.
