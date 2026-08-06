# Pilot Communication Evidence Standard (Sprint 10J)

## Executive Summary
This document specifies communication evidence standards for sent follow-ups, candidate replies, and meeting records.

---

## Communication Evidence Fields

- `communicationId`: Unique communication identifier string (e.g. `comm_101_01`).
- `candidateId`: Candidate ID (e.g. `101`).
- `evidenceType`: `EMAIL_SENT` | `EMAIL_REPLY_RECEIVED` | `MEETING_HELD` | `DECLINE_RECEIVED` | `DEFERRAL_REQUEST_RECEIVED`.
- `proposalVersion`: Governed proposal version (e.g. `v1`).
- `deliveryStatus`: `DELIVERED` | `SENT` | `FAILED`.
