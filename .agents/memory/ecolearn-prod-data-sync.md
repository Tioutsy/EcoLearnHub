---
name: EcoLearn prod/dev data split
description: How EcoLearn's production data relates to dev, and how to push data fixes live
---

# EcoLearn production data is a SEPARATE database from dev

Production and development do NOT share the same Postgres. Confirmed because an
enrollment that exists in prod (low ids 1,2) does not exist in dev (independent id
sequence), and prod read-replica showed broken data while dev was correct.

The whole app has NO repo seed file — every row (courses, lessons, blog, plans,
quiz_questions) was inserted directly into the dev database by hand.

**Why this matters:** direct dev DB edits (e.g. fixing lessons.course_id, seeding
quiz_questions) do NOT reach production on a normal publish. Publish only diffs and
applies the SCHEMA to prod, not row data.

**How to apply / fix prod data:** dev is the source of truth. To get corrected
content live, the user must choose the **"Overwrite data"** option in the Publish
dialog, which replaces prod data with dev data wholesale (this also wipes existing
prod enrollments/progress — acceptable when prod data is broken). Never write to prod
directly (executeSql production is read-only; DDL/data hooks are disallowed).

Known prod-only breakage seen historically: lessons.course_id offset by -10 (orphan
lessons) and quiz_questions empty — both already correct in dev.
