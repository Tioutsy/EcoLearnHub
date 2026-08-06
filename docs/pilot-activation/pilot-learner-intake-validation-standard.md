# Pilot Learner Intake Validation Standard (Sprint 10I)

## Executive Summary
This document specifies 16-point row-level validation rules for CSV learner cohort uploads.

---

## Validation Rules

1. `email_format`: Valid corporate email address (reject personal domains `@gmail.com` or `@yahoo.com`).
2. `formula_injection_safety`: Prevent leading `=` or `+` formula prefixes.
3. `duplicate_detection`: Reject duplicate emails within the file or existing organisation.
4. `required_fields`: `first_name`, `last_name`, `email`, `department`, `language` (`en` or `fr`).
