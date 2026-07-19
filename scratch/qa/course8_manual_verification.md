# Course 8: Biodiversity in Mauritius — Manual Browser Verification Checklist

> Sprint 5G | EcoLearnHub | Course code: ELH-08

---

## Pre-Test Setup

* [ ] API server is running.
* [ ] Frontend development server is running.
* [ ] Signed in as a learner with a fresh Course 8 enrolment or cleared test progress.
* [ ] Browser Developer Tools are open with the Network and Console tabs visible.
* [ ] Test on at least one desktop viewport and one mobile viewport.
* [ ] Course 8 database seeder has completed successfully.
* [ ] No existing Course 8 certificate, badge or completed attempt is attached to the test learner unless duplicate-prevention behaviour is being tested.

---

## 1. Catalogue and Enrolment

### Desktop

* [ ] Course 8, **Biodiversity in Mauritius**, appears in the course catalogue.
* [ ] Course code is `ELH-08`, where course codes are displayed.
* [ ] Level displays as `Foundation`.
* [ ] Estimated duration displays as `15–20 minutes`.
* [ ] The course description is complete and does not overflow awkwardly.
* [ ] The catalogue image (`biodiversity-in-mauritius.jpg`) loads without stretching or distortion.
* [ ] Clicking the course opens the course details page.
* [ ] The Enrol/Start action is visible and functional.

### Mobile

* [ ] The course card scales correctly down to a 320px viewport.
* [ ] The course image crops correctly without hiding essential visual context.
* [ ] Text sizing remains readable.
* [ ] The Enrol/Start action remains easily tappable (minimum 44x44px target).

---

## 2. Lesson Rendering and Navigation

### Lesson 1: A Harmless Workplace Decision?

* [ ] The lesson loads successfully.
* [ ] The "Workplace Decision Scenario" interaction displays clearly.
* [ ] Selecting an incorrect option displays the correct specific feedback.
* [ ] Selecting the correct option ("Check whether the work could affect habitats...") displays the correct feedback.

### Lesson 2: What Biodiversity Means

* [ ] Definitions for Native, Endemic, Introduced, and Invasive species are clearly formatted and readable.

### Lesson 3: Mauritius and Its Living Heritage

* [ ] The ecosystem matching scenario works correctly and displays appropriate feedback.

### Lesson 4: Why Biodiversity Matters to Business

* [ ] Workplace examples (Hospitality, Construction, Retail, Manufacturing) render correctly in their specific layout blocks.

### Lesson 5: Recognising Workplace Pressures

* [ ] The contractor vegetation-clearing scenario renders properly.
* [ ] The correct choice (Option 3: Pause and report the concern) functions as expected.
* [ ] The practical takeaway block stands out visually.

### Lesson 6: Practical Action and Commitment

* [ ] The bulleted list of practical actions is readable.
* [ ] The commitment interaction requires the learner to select exactly one option.
* [ ] The commitment selection is saved properly.

### Navigation and State

* [ ] Previous and Next buttons function between all 6 lessons.
* [ ] Progress indicators update accurately.
* [ ] Refreshing the page mid-course does not destroy current progress.
* [ ] Text contrast meets WCAG AA standards across all lessons.

---

## 3. Quiz Interaction and Security

### Question Display

* [ ] All 5 questions display in sequence or on a single page depending on the player design.
* [ ] Each question displays exactly 4 options.

### Security (Browser DevTools)

* [ ] **Network Tab:** Inspect the GET request for the quiz. Confirm that `correctOption`, `optionFeedback`, `correctExplanation`, and `practicalTakeaway` are **NOT** present in the JSON payload.
* [ ] Confirm that correct answers cannot be found anywhere in the DOM before submission.

### Submission and Feedback

* [ ] Submit a deliberate **failing** attempt (score < 80%).
* [ ] Verify that the fail state UI appears correctly.
* [ ] Verify the retry button functions according to platform rules.
* [ ] Submit a **passing** attempt (score >= 80%).
* [ ] Verify the pass state UI appears correctly.
* [ ] **Network Tab:** Inspect the POST response. Confirm the backend accurately calculates the score.
* [ ] Verify that feedback for **all** options (including why incorrect options were wrong) is now visible.
* [ ] Verify the practical takeaway is displayed for each question.

---

## 4. Completion and Rewards

* [ ] Course completion is accurately recorded in the database.
* [ ] The `Biodiversity Aware` badge is generated exactly once.
* [ ] The badge title displays correctly.
* [ ] The completion message displays: *"You have completed Biodiversity in Mauritius. You can now recognise common workplace impacts on local ecosystems and make more biodiversity-aware decisions."*
* [ ] **Course 9 (ESG Basics)** is shown as the next recommended course.
* [ ] Clicking the next-course recommendation handles the Course 9 state gracefully (e.g., handles the skeleton/draft state without throwing a server 500 error or a broken page).

---

## 5. Accessibility and Resilience

* [ ] The entire course can be navigated using only the `Tab`, `Space`, `Enter` and Arrow keys.
* [ ] Focus states are clearly visible on all interactive elements (options, buttons).
* [ ] Feedback relies on text, not solely on red/green colour changes.
* [ ] No errors are thrown in the browser console during the entire run.
* [ ] No failed network requests occur during the normal flow.
