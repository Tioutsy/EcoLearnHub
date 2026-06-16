---
name: Multi-module course player state isolation
description: Why interactive blocks in a step/module player must remount per module, and the badge-lookup trap in progression summaries.
---

# Multi-module player: force remount per module

When a single React player renders a list of interactive "blocks" per module and advances by changing a `moduleIndex`, do NOT rely on index-based child keys alone. If two modules render the same component type at the same block index (e.g. both have a `CheckView` at index 3), React reuses the instance and its internal `useState` (e.g. "already answered") leaks into the next module, leaving inputs disabled and any "gate" (continue-button) permanently stuck.

**Rule:** key the blocks container on the module identity (`key={module.key}`) so the whole subtree remounts on module change. Resetting a separate `resolved` set on `moduleIndex` change is NOT enough — the children keep their own state.

**Why:** found via E2E test — Module 2's continue button stayed disabled forever because its first knowledge-check reused Module 1's answered instance.
**How to apply:** any step/wizard/module player in this repo (e.g. `artifacts/ecolearn/src/pages/learn/foundations/FoundationsPlayer.tsx`).

# Badge lookup in progression summary

`badge_definitions` has MANY rows with `criteria_type = 'all_courses'`, each scoped to different `course_ids`. Selecting `[badge] = ... where criteriaType='all_courses'` returns an arbitrary first row, so the wrong badge (or none) matches. Always filter to the badge whose `courseIds` array includes the target courseId: `rows.find(b => b.courseIds.includes(courseId))`.

# Points must count DISTINCT lessons

`lesson_progress` has no unique constraint on `(enrollment_id, lesson_id)` and the shared PATCH writer (`artifacts/api-server/src/routes/progress.ts`) does non-atomic select-then-insert, so duplicate completion rows are possible. Any points/summary computation must count `new Set(rows.map(r => r.lessonId)).size` and clamp module counts to the course's lesson total, not `rows.length`.
