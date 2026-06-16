---
name: Bespoke interactive course pattern (EcoLearn)
description: How rich, interactive courses are built and seeded in EcoLearn, so new ones stay consistent.
---

# Bespoke interactive course pattern

Rich interactive courses (vs the generic lesson-reader) follow one convention. Two exist:
Sustainability Foundations (course id 23, slug `sustainability-foundations`) and Waste Sorting
(course id 12, slug `waste-sorting`).

## Convention
- Each course gets its own frontend folder `artifacts/ecolearn/src/pages/learn/<slug>/`
  with `content.ts` (block-data + types + slug/id consts), `blocks.tsx` (view components),
  and `<Name>Player.tsx` (modeled on FoundationsPlayer: module gating, final quiz, completion +
  badge + certificate). Keep each course self-contained; do NOT modify another course's folder.
- The router `learn/index.tsx` dispatches to the bespoke player by durable **slug** with an **id
  fallback** for legacy rows. Add a branch per course.
- Backend has an idempotent startup seed `artifacts/api-server/src/lib/ensure<Name>Course.ts`,
  wired in `api-server/src/index.ts` `start()` BEFORE `app.listen`. It resolves/adopts the course
  by slug, then by known legacy title(s), then inserts; upserts lessons (keyed course_id+order_index)
  and quiz questions (keyed course_id+order_index) and the badge (keyed slug). It catches its own
  errors so a seed failure never blocks boot.

## Replacing an existing simpler course in place
- Adopt the existing row instead of creating a new one: match by slug OR legacy title, then UPDATE
  slug/title/passingScore/description/objectives. Reuse the SAME order_index range as the existing
  rows and use `onConflictDoUpdate` so existing rows convert in place (avoids orphan/duplicate rows
  and avoids FK trouble: `quiz_attempts` has NO FK to question ids, `lesson_progress` references
  lesson ids so do not delete lessons).
- `onConflictDoUpdate` (not DoNothing) is correct here because the seed is the canonical source for
  this authored content and must overwrite the older content on first boot; it stays idempotent.

## Gating & blocks
- Module advance gate: `resolved.size >= interactiveCount && (!hasPledge || pledgeSel.size > 0)`.
  Interactive blocks call `onResolved()` only when fully completed. The block subtree is keyed by
  `module.key` so child interaction state remounts per module (prevents answered-state leaking
  across modules).
- The end-of-course "pledge" reuses the generic commitments API keyed by courseId
  (`useGetCommitments`/`useSaveCommitments`).

## Badges
- One course-completion badge per course (criteria engine only supports `min_courses`/`all_courses`).
  Use `criteriaType: 'all_courses'`, `courseIds: [courseId]`, `onConflictDoUpdate` on slug.

**Why:** keeps each course isolated and low-risk, and makes prod converge deterministically on every
boot/deploy regardless of prior DB state.
