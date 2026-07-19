# Course Architecture Readiness Report

This document records the findings of the limited course-authoring and cataloguing architecture review completed during Sprint 4C.

---

## 1. Supported Metadata & Schemas
The current database schemas natively support:
* **Course Slugs & Codes**: Unique string identifiers (e.g. `sustainability-foundations`) for clean URL routing and environment-independent course identification.
* **Basic Metadata**: Level (`beginner`, `intermediate`, `advanced`), duration in minutes, categorization, pricing, and SDG contribution mappings.
* **Course Prerequisites**: A table-based relationship (`coursePrerequisitesTable`) allowing courses to declare dependency on one or many other courses.
* **Recommendations**: Sequential linking (`recommendedNextCourseId`) permitting players to navigate learners to the logical next course.
* **Course Commitments**: A separate schema (`courseCommitmentsTable`) supporting multiple distinct commitment selections per user per course.

---

## 2. Platform Architecture Limitations

1. **Content Block Enum Constraints**:
   * The `ContentBlockType` enum is constrained to: `heading`, `short_text`, `key_message`, `workplace_example`, `mauritian_example`, `practical_action`, `image`, `expandable`, `multiple_choice`, `decision_scenario`, `reflection`, `commitment`.
   * **Limitation**: The schema does not support generic `matching` (classification) blocks or complex interactive multi-role selectors.
   * **Sprint 4C Resolution**: Rather than hardcoding these interactions in the frontend or introducing complex cross-package compilation risk, we represent these using high-quality database-backed `multiple_choice` and `decision_scenario` blocks.

2. **Quiz Versioning Constraints**:
   * The database preserves quiz attempt summaries (`quiz_attempts` table records score, passed state, and timestamp) but does not store versioned question sheets or a historic mapping of which specific question a student answered.
   * **Limitation**: Replacing or updating quiz questions for a course with active attempts breaks the contextual matching of past completions to specific questions.
   * **Sprint 4C Resolution**: A pre-flight database check was executed to confirm Course 1 has exactly 0 attempts before replacing placeholders. For future catalog expansions, question/quiz versioning must be introduced.

3. **Multi-Tenant Visibility Constraints**:
   * Courses are globally defined in `coursesTable` and visible to all registered companies on the platform. Tenant-level filtering is applied only to assignments and enrollments.
   * **Limitation**: Cannot easily restrict access to specialist courses on a per-tenant, per-department, or per-sector basis without adding custom metadata visibility filters.

---

## 3. Recommended Future Changes

1. **Extensible Block Architectures**:
   * Implement a polymorphic block type (e.g., `interactive_widget`) where the block type maps to a custom React component loaded dynamically, with block metadata stored in a flexible JSON field.
2. **True Content Versioning**:
   * Snapshot course lessons, content blocks, and quizzes under incrementing integer versions (e.g., `course_version`). Associate enrollments and attempts with the active content version at enrollment time.
3. **Sector & Audience Metadata**:
   * Add `audience`, `department`, `sector`, and `category_type` (Core vs. Optional) columns to `coursesTable` to support advanced catalog filtering and custom learning pathway logic.

---

## 4. Decisions Deferred from This Sprint
* **No Database Schema Alterations**: Deferred splitting or extending the pgTable schemas to avoid schema migration overhead and preserve runtime compatibility with existing Clerk organization constraints.
* **No Destructive Rollover Scripts**: Did not implement structural database rollbacks, choosing to use idempotent v2 seed tracking instead.
