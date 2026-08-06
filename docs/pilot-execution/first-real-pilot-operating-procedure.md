# First Real Pilot Operating Procedure (Sprint 10E)

## Executive Summary
This Standard Operating Procedure (SOP) provides step-by-step instructions for Elevio Skills operators onboarding the first confirmed external pilot organisation.

---

## Operating Procedure Steps

1. **Candidate Registration**: Register candidate record with legal company name and primary contact email.
2. **Evidence Collection**: Obtain signed participation agreement or authorised email confirmation; upload evidence details.
3. **Evidence Approval**: Platform Admin reviews evidence and sets `evidenceStatus = "ACCEPTED"`.
4. **Scope Configuration**: Select course IDs (e.g. ELH-01 to ELH-04), set learner cap (e.g. 50), and set start/end dates.
5. **Readiness Evaluation**: Run `POST /api/pilots/:id/readiness-gate` to confirm all 16 conditions pass.
6. **Guarded Activation**: Run `POST /api/pilots/:id/activate` with audit reason to activate live access.
7. **Admin Onboarding**: Send invitation link to company administrator.
8. **Learner Intake**: Import employee roster via CSV intake.
