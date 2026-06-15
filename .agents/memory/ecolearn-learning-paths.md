---
name: EcoLearn learning paths model
description: How role-based learning paths and their per-learner progress are modeled and computed.
---

Learning paths are structured, role-based course journeys (General Employee, Hotel & Hospitality, Property Management, Manufacturing). Modeled with two tables: `learning_paths` (slug, title, description, audience, icon = lucide name, order_index) and `learning_path_courses` (path_id, course_id, order_index) — a join onto existing courses, NOT new content. Add new paths by inserting rows + join rows; reuse existing course ids.

**Progress is computed live, never stored on the path.** `GET /api/learning-paths` reads the current user's completed enrollments (`enrollments.status = 'completed'`, userId fallback `demo-user`), builds a Set of completed courseIds, then for each path counts how many of its modules are in that set → `completedModules / totalModules` and `progressPct`. So path progress always reflects the same enrollment source of truth the rest of the learner flow uses.

**Why live computation:** a path's progress is per-user and changes every time a course is completed; storing it would require fan-out updates on every completion and could drift from enrollments.

**How to apply:** to make demo progress visible you must seed `enrollments` rows for `demo-user` with `status='completed'` (the table starts empty). The `icon` string maps to a lucide-react component via a lookup table in the frontend page — if you add a new icon value in the DB, add it to that map or it falls back to the Route icon.
