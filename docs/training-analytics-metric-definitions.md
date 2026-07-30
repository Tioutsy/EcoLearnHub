# Metric Definition Register — EcoLearnHub Training Analytics

This register provides authoritative mathematical definitions, inclusion/exclusion rules, and denominators for all management analytics in EcoLearnHub.

---

## 1. Core Analytics Metrics

### 1.1 Assigned Learners
- **Definition**: Distinct count of active, eligible employees who have at least one active course assignment or enrollment.
- **Numerator**: `COUNT(DISTINCT employee_id)` with active assignments or enrollments.
- **Denominator**: N/A (Absolute Count).
- **Exclusions**: Deactivated employees.

### 1.2 Activated Learners Rate
- **Definition**: Percentage of invited employees who completed account activation.
- **Numerator**: `COUNT(DISTINCT employee_id WHERE invitation_status = 'activated')`.
- **Denominator**: `COUNT(DISTINCT employee_id WHERE status = 'active')`.

### 1.3 Started Assignments Rate
- **Definition**: Percentage of assigned courses where meaningful lesson progress (`progressPct > 0`) has been recorded.
- **Numerator**: `COUNT(assignments WHERE progressPct > 0)`.
- **Denominator**: Total active assigned courses.

### 1.4 Course Completion Rate
- **Definition**: Percentage of assigned courses fully completed.
- **Numerator**: `COUNT(assignments WHERE status = 'completed' OR completedAt IS NOT NULL)`.
- **Denominator**: Total active assigned courses.

### 1.5 On-Time Completion Rate
- **Definition**: Percentage of completed courses finished on or before their assigned due date.
- **Numerator**: `COUNT(completed_assignments WHERE completedAt <= dueDate)`.
- **Denominator**: Total completed assignments that had an explicit due date assigned.
- **Note**: Assignments without a due date are excluded from this denominator.

### 1.6 Overdue Assignment Rate
- **Definition**: Percentage of incomplete assignments currently past their due date.
- **Numerator**: `COUNT(incomplete_assignments WHERE dueDate < NOW())`.
- **Denominator**: Total active assigned courses with a due date.
- **Rule**: Completed assignments are **never** counted as overdue.

### 1.7 Inactivity Rate
- **Definition**: Percentage of in-progress assignments with no learner activity in 7+ days.
- **Numerator**: `COUNT(in_progress_assignments WHERE lastActiveAt < NOW() - 7 days)`.
- **Denominator**: Total in-progress assignments.

### 1.8 Average Completion Duration
- **Definition**: Average calendar days between first lesson activity and course completion.
- **Calculation**: `AVG(completedAt - startedAt)` for completed enrollments.

### 1.9 Assessment Pass Rate
- **Definition**: Percentage of final quiz attempts that met or exceeded the pass threshold (80%).
- **Numerator**: `COUNT(quiz_attempts WHERE score >= 80)`.
- **Denominator**: Total final quiz attempts.

### 1.10 Average Quiz Score
- **Definition**: Mean percentage score across all final quiz submissions.

### 1.11 Quiz Retry Rate
- **Definition**: Percentage of learners requiring 2 or more quiz attempts before passing.

### 1.12 Reminder Response Association Rate
- **Definition**: Percentage of reminder recipients who started or completed training within 3 days of receiving a reminder.

### 1.13 Commitment Participation Rate
- **Definition**: Percentage of course completers who selected or recorded a workplace action commitment.

### 1.14 Reported Commitment Completion Rate
- **Definition**: Percentage of workplace commitments marked as completed (self-reported or manager-confirmed).
