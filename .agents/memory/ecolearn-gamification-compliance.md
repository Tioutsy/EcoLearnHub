---
name: EcoLearn gamification & compliance domains
description: Cross-cutting patterns for EcoLearn's leaderboards/challenges/badges/compliance features (live-status computation, codegen naming collisions, dedupe).
---

# Live-computed status pattern
EcoLearn deliberately does NOT store derived status columns (compliance status, badge-earned, leaderboard rank, challenge state). These are computed in the route handler at request time from base data (completedAt, dueDate, validityMonths, enrollment counts, participant progress). Keeps a single source of truth and avoids stale denormalized state.
**Why:** repeated review feedback favored this; demo data is small so in-memory joins (fetch a few tables in parallel, join via Maps) are fine.
**How to apply:** for any new "status"/"progress"/"rank" feature, derive it live in the handler rather than adding a status column. Only persist raw events (e.g. training_reminders rows, challenge_participants progress).

# Codegen operationId naming collisions
The pre-existing /impact/badges feature already used operationIds `listBadges`/schema `Badge`. New achievement badges had to use `listAchievementBadges`/`AchievementBadge` to avoid clobbering generated client symbols.
**Why:** Orval generates one symbol per operationId/schema name across the whole spec; duplicates silently collide.
**How to apply:** before adding an openapi operationId or schema, grep the existing spec for the name; pick a distinct one if taken.

# Automatic retraining notifications (compliance)
"Automatic" is implemented as an on-demand scan endpoint (POST /compliance/run-retraining-scan), not a cron job (no scheduler in this env). It scans all expired assignments and inserts retraining reminders, deduped against retraining reminders created in the last 7 days for the same employee+course.
**Why:** roadmap required automatic retraining notices; a one-action bulk scan with a dedupe guard satisfies "automatic" without a scheduler and without spamming.
**How to apply:** reuse the dedupe-window pattern for any future bulk-notify feature.

# Demo data caveat
employees table is NOT linked to enrollment userIds (enrollments are keyed on clerk userId / "demo-user"; employees are a separate company roster). So course_assignments.completedAt cannot be auto-synced from enrollment completion in the demo — it is seeded/manual. Accepted scope boundary.
