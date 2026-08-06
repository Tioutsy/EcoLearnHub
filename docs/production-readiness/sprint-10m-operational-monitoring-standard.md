# Operational Monitoring Standard (Sprint 10M)

## Executive Summary
This document specifies operational logging, audit events, correlation IDs, and monitoring standards.

---

## 1. Audit Logging Coverage
- **Authentication**: Auth events logged without exposing tokens or passwords.
- **Onboarding & Role Changes**: Immutable audit events generated for company activation and admin promotion.
- **Health Monitoring**: Structured JSON logs via Pino logger.
