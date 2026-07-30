# Behaviour-Change Evidence Model — EcoLearnHub

EcoLearnHub uses a structured 6-level evidence hierarchy to measure corporate sustainability learning outcomes. This model maintains strict distinction between training participation, knowledge mastery, workplace commitments, self-reported actions, manager confirmations, and verified operational outcomes.

---

## The 6 Evidence Levels

```
Level 6: Operational Outcome Evidence (Verified Resource & Environmental Metrics)
Level 5: Manager-Confirmed Action Evidence (Supervisor Verification)
Level 4: Self-Reported Action Evidence (Learner Reflection & Completion)
Level 3: Intention & Commitment Evidence (Action Selection)
Level 2: Knowledge Assessment Evidence (Quiz Pass & Concept Mastery)
Level 1: Training Participation Evidence (Invitation, Enrolment, Completion)
```

---

### Level 1 — Training Participation Evidence
- **Source**: System logs, enrollment records, completion timestamps.
- **Evidence**: Employee activated account, viewed lessons, and completed course modules.
- **Scope**: Confirms attendance and completion of content.

### Level 2 — Knowledge Assessment Evidence
- **Source**: Quiz score logs, question attempt history.
- **Evidence**: Employee passed accredited knowledge quiz (80%+ threshold).
- **Scope**: Proves comprehension of sustainability principles and workplace compliance guidelines.

### Level 3 — Intention & Commitment Evidence
- **Source**: Workplace commitment entries (`learner_commitments`).
- **Evidence**: Learner selected or wrote a specific workplace action commitment (e.g. "Report water leaks in building B", "Segregate e-waste").
- **Scope**: Measures learner commitment and intention to apply training.

### Level 4 — Self-Reported Action Evidence
- **Source**: Learner action logs, reflection notes (`status = 'completed_self_reported'`).
- **Evidence**: Learner confirmed completion of workplace commitment and recorded reflection notes.
- **Scope**: Indicates active workplace implementation as reported by the employee.

### Level 5 — Manager-Confirmed Action Evidence
- **Source**: Manager verification record (`status = 'completed_manager_confirmed'`).
- **Evidence**: Authorized department manager or sustainability supervisor verified the workplace action.
- **Scope**: Supervisor-backed confirmation of workplace behaviour change.

### Level 6 — Operational Outcome Evidence
- **Source**: Enterprise utility meters, waste audit reports, ESG software integration.
- **Evidence**: Measured reduction in kWh energy usage, kg waste diverted, or litres water saved.
- **Crucial Rule**: EcoLearnHub **never** claims Level 6 operational outcomes from course completion alone. Operational outcomes require verified external utility or audit data.
