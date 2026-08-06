# Employee Band Enforcement Standard (Sprint 10L)

## Executive Summary
This document specifies commercial employee band capacity limits and backend enforcement.

---

## 1. Commercial Employee Bands

| Band Limit | Price / Month | Quote Workflow |
| :--- | :--- | :--- |
| Up to 25 employees | MUR 3,000 / month | Standard |
| 26–50 employees | MUR 4,500 / month | Standard |
| 51–80 employees | MUR 5,000 / month | Standard |
| 81–120 employees | MUR 6,250 / month | Standard |
| > 120 employees | Tailored quote | Contact Sales |

---

## 2. Capacity Pre-Check Rule
Attempting to add or bulk-import employees exceeding the active subscription band limit MUST be blocked on the backend with a `400 Bad Request` or `422 Unprocessable Entity` error explaining capacity exhaustion.
