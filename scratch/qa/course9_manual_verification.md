# Course 9: ESG Basics — Manual Browser Verification Checklist

> Sprint 5H | EcoLearnHub | Course code: ELH-09

---

## Pre-Test Setup

* [ ] API server is running.
* [ ] Frontend development server is running.
* [ ] Signed in as a learner with a fresh Course 9 enrolment or cleared test progress.
* [ ] Browser Developer Tools are open with the Network and Console tabs visible.
* [ ] Test on at least one desktop viewport and one mobile viewport.
* [ ] Course 9 database seeder has completed successfully.
* [ ] No existing Course 9 certificate, badge or completed attempt is attached to the test learner unless duplicate-prevention behaviour is being tested.

---

## 1. Catalogue and Enrolment

### Desktop

* [ ] Course 9, **ESG Basics**, appears in the course catalogue.
* [ ] Course code is `ELH-09`, where course codes are displayed.
* [ ] Level displays as `Level 3` or `ESG and Compliance`.
* [ ] Estimated duration displays as `15–20 minutes`.
* [ ] The course description is complete and does not overlap other elements.
* [ ] The Hero image represents a realistic Mauritian workplace meeting (no floating ESG letters or globes).
* [ ] The Hero image is not pixelated and fills its container correctly without distortion.
* [ ] The "Enrol" or "Start Course" button is accessible and visible.
* [ ] Clicking the course opens the course overview or first lesson without console errors.

### Mobile

* [ ] Catalogue card layout stacks correctly without horizontal scrolling.
* [ ] The Hero image uses an appropriate square or scaled crop.
* [ ] The "Enrol" or "Start" button remains easily tappable (minimum 44x44px interaction area).

---

## 2. Lesson Content and Interactions

* [ ] **Lesson 1:** "A Company Claim Needs Evidence" displays correctly. Verify the scenario block allows option selection and provides immediate, context-specific feedback.
* [ ] **Lesson 2:** "What ESG Means" displays correctly. Verify both classification scenarios work correctly.
* [ ] **Lesson 3:** "ESG in Everyday Mauritian Workplaces" displays correctly. Verify the bulleted list renders cleanly.
* [ ] **Lesson 4:** "From Employee Action to Company Evidence" displays correctly. Verify the scenario interaction regarding missing data.
* [ ] **Lesson 5:** "Scenario, Pressure to Improve the Story" displays correctly. Verify the scenario interaction regarding the waste recycling claim.
* [ ] **Lesson 6:** "Knowledge Check, Commitment and Completion" displays correctly. Verify the final commitment block allows selection of one action.

---

## 3. Quiz Security and Submission

### Network Inspection (Before Submission)

* [ ] Open Developer Tools -> Network tab.
* [ ] Reload the quiz page.
* [ ] Inspect the `GET /api/courses/9/quiz` (or similar) response payload.
* [ ] **CRITICAL:** Ensure `correctOption` is absent or `undefined`.
* [ ] **CRITICAL:** Ensure `correctExplanation` and `incorrectExplanation` are absent.
* [ ] **CRITICAL:** Ensure `practicalTakeaway` is absent.
* [ ] **CRITICAL:** Ensure `optionFeedback` (the array of feedback strings for each option) is absent.

### Attempting the Quiz (Threshold testing)

* [ ] Complete the quiz with exactly **6 correct answers** (75%).
* [ ] Submit the quiz.
* [ ] Verify the result screen shows a **Fail** state.
* [ ] Verify that incorrect selections display why they were not the best choice.
* [ ] Verify that correct selections display their explanations.
* [ ] Verify practical takeaways appear after submission.
* [ ] Verify the course does not complete, and the badge is not awarded.
* [ ] Use the "Retake" feature.
* [ ] Complete the quiz with exactly **7 correct answers** (87.5%).
* [ ] Submit the quiz.
* [ ] Verify the result screen shows a **Pass** state.

---

## 4. Completion and Badge Award

* [ ] After passing, verify the **ESG Fundamentals** badge is awarded exactly once.
* [ ] Verify the completion message displays: "You have completed ESG Basics. You can now recognise Environmental, Social and Governance factors, connect everyday workplace actions with company evidence and respond more responsibly when information is uncertain or incomplete."
* [ ] Verify Course 10 (**Environmental Compliance**) is recommended as the next course.
* [ ] Verify the course is marked as "Completed" in the learner's dashboard/progress view.

---

## 5. Tenant and Reporting Verification (If Applicable)

* [ ] Sign in as a Manager for the learner's company.
* [ ] Verify the learner's completion of Course 9 appears in the company reports.
* [ ] Sign in as a Manager for a *different* company.
* [ ] Verify the first learner's completion does **not** appear.
* [ ] Export training records and verify Course 9 completion is included.
