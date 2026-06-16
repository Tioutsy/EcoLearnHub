---
name: Course player and progression gotchas
description: Durable rules for multi-module interactive course players and progression/badge computation.
---

# Remount interactive blocks per module

A single player that renders a list of interactive blocks per module must remount the block subtree when the module changes (key it on the module identity), not just reset a separate "resolved" set. Index-based child keys alone let two modules share a component instance at the same index, so internal state (e.g. "already answered") leaks forward and any continue-button gate can lock permanently.
**Why:** found via E2E — a later module's continue button stayed disabled because its first knowledge-check reused an earlier module's answered instance.

# Badge lookup must filter by course, and be pass-gated

`badge_definitions` holds many rows with the same `criteria_type` (e.g. `all_courses`), each scoped to different course ids. Never take the first matching row; select the one whose course-id array includes the target course. A course badge should be marked earned only on true completion (all modules done AND final quiz passed), not merely when all lessons are flagged complete.

# Count DISTINCT lessons for points/progress

Lesson-progress rows have no uniqueness guarantee and the shared writer is non-atomic, so duplicates are possible. Any points/progress computation must dedupe by lesson id and clamp counts to the course's lesson total rather than trusting row counts.

# Activate bespoke players by a durable identifier

Gate a special-cased course experience on a stable identifier (a course slug/flag), not a hard-coded numeric id, so it survives reseeds and environment drift. Keep authored quiz/lesson/badge data in an idempotent seed keyed by that slug so fresh environments are reproducible.
