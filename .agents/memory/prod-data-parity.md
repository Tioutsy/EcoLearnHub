---
name: Production data parity (Replit publish)
description: Why authored content added to dev after first publish never reaches prod, and the safe way to fix it.
---

# Production data parity on Replit publish

Replit's Publish flow migrates **schema** automatically (dev→prod SQL diff), but does **NOT** migrate row data on ordinary re-publishes. Dev and prod are separate databases. Dev data is copied to prod only when the production database is first created ("Set up production database with current development data"). Any content authored in dev *after* that first snapshot will never appear in prod via normal re-publishing.

**Symptom:** a feature that depends on new rows (e.g. a new course/catalog entry) works in dev but is missing in the published app; read-only prod queries show the old data and a higher-id row simply absent.

**Do NOT** (database guardrail, see `database/references/database-migrations-on-publish.md`): run DDL against prod, write prod migration scripts, add schema DDL to deploy build or app startup. Those rules are about SCHEMA.

**Safe fix for required CONTENT data:** an idempotent startup seed in the API server (DML, not DDL) that ensures the rows exist in whatever DB the server connects to. On the next deploy the prod server boots and populates prod itself.

**Why:** the supported "overwrite prod data" UI path is destructive (replaces all prod data) and proved hard for the user to action; a startup content-ensure is reliable, non-destructive, and keeps fresh environments reproducible.

**How to apply (make it race-safe — autoscale can boot multiple instances):**
- Back every seeded key with a real DB unique constraint (e.g. `courses.slug`, `(lessons.course_id, order_index)`, `(quiz_questions.course_id, order_index)`), declared in the drizzle schema so the publish diff adds them to prod too.
- Insert with `onConflictDoNothing` / `onConflictDoUpdate`; never check-then-insert.
- Run the seed **before** `app.listen` so first post-deploy requests see the data.
- Swallow seed errors so a seed failure can't crash the server.
- Adding a unique constraint to a populated table: `drizzle-kit push` prompts to truncate (non-TTY = crash) and `--force` may accept truncation. Instead verify no duplicates first, then `ALTER TABLE ... ADD CONSTRAINT` directly on dev guarded by `pg_constraint` existence; the drizzle schema stays source of truth so prod gets it on publish.
