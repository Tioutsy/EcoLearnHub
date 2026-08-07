# Root-Cause Analysis — Catalogue Course Card "View details" Prerequisite Disclosure Defect

## 1. Affected Components & Files
- **Component File**: `artifacts/ecolearn/src/pages/courses/index.tsx`
- **UI Elements**: Lines 548–552 (`<span className="..." title={...}>View details</span>`) and prerequisite callouts across locked and unlocked courses.

---

## 2. Root Cause Analysis
1. **No Interactive Control / Modal Handler**: The "View details" control was implemented purely as a static inline `<span>` element with an HTML `title` tooltip attribute (`title={missingRequiredPrereqs.map(...).join(" • ")}`). It lacked any `onClick` handler, state variable, or modal/dialog container.
2. **Missing Interactivity**: When a learner clicked "View details", nothing happened visually except displaying the native browser tooltip on mouse hover (which is unplayable and completely non-functional on mobile touch viewports).
3. **Restricted Disclosure Scope**: "View details" only rendered inside the `!isPlanLocked && isPrereqLocked` branch, meaning learners could not view course prerequisites or full course descriptions for unlocked, in-progress, recommended, or completed courses.

---

## 3. Architecture-Consistent Solution
- **Radix UI Accessible Dialog Integration**: Implement a clean modal dialog using the platform's established `@/components/ui/dialog` Radix primitives (`Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogClose`).
- **Comprehensive Course Details State**: Store the selected course object (`selectedDetailsCourse`) in local component state so clicking "View details" opens a structured dialog presenting:
  - Course identity (Code, Title, Level, Duration, Category)
  - Full Course Description & Learning Objectives
  - Complete Prerequisite Breakdown (Required vs Recommended) with explicit completion status badges (✓ Completed / ○ Required)
  - Clear Action Controls (Start Course / Continue Course / Complete Prerequisite First / Close) without unintended enrolment or progress side effects.
- **Event Propagation Safeguards**: Wrap "View details" handlers with `e.stopPropagation()` and `e.preventDefault()` to prevent accidental parent card navigation.
