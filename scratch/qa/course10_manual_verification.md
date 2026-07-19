# Course 10: Environmental Compliance — Manual Browser Verification Checklist

> Sprint 5I | EcoLearnHub | Course code: ELH-10

---

## Pre-Test Setup

* [ ] API server is running.
* [ ] Frontend development server is running.
* [ ] Signed in as a learner with a fresh Course 10 enrolment or cleared test progress.
* [ ] Browser Developer Tools are open with the Network and Console tabs visible.
* [ ] Course 10 database seeder has completed successfully.
* [ ] No existing Course 10 certificate, badge or completed attempt is attached to the test learner unless duplicate-prevention behaviour is being tested.

---

## A. Catalogue and access

* [ ] Course 10 appears after ESG Basics.
* [ ] Title is **Environmental Compliance**, description, level and duration are correct.
* [ ] Hero image loads correctly, is photorealistic, and completely text-free.
* [ ] Badge name is `Compliance Aware`.
* [ ] ESG Basics is presented as recommended prior learning where supported.
* [ ] Circular Economy appears as the next course.
* [ ] Desktop and mobile catalogue cards render correctly.

---

## B. Lesson content

* [ ] All six lessons load in the correct order.
* [ ] No placeholder content remains.
* [ ] The legal disclaimer is visible but not disruptive (Lesson 1).
* [ ] The course clearly distinguishes law, approvals, procedures and records.
* [ ] Workplace examples are clear.
* [ ] Employees are not asked to make legal determinations.
* [ ] No outdated Act is presented as current.
* [ ] No penalties are displayed.
* [ ] No unsupported legal claims appear.
* [ ] No horizontal mobile overflow occurs (checked at ~390px width).
* [ ] Progress persists after refresh.

---

## C. Interactions

* [ ] Lesson 1 drain scenario displays feedback for all options.
* [ ] Lesson 2 matching interaction works.
* [ ] Lesson 3 workplace-risk interactions work.
* [ ] Lesson 4 record-keeping challenge works.
* [ ] Lesson 5 contractor scenario displays consequences.
* [ ] Correct and incorrect states do not rely only on colour.
* [ ] Keyboard navigation works.
* [ ] Buttons and controls have descriptive labels.

---

## D. Quiz security (Network Inspection)

Before submitting the quiz, open Developer Tools -> Network tab, inspect the quiz fetch response:
* [ ] Quiz fetch does not reveal `correctOption`.
* [ ] Correct explanations are absent before submission.
* [ ] Incorrect explanations are absent before submission.
* [ ] Practical takeaways are absent before submission.
* [ ] Option feedback is absent before submission.
* [ ] No hidden field reveals the answer.

---

## E. Quiz review

* [ ] Eight questions appear.
* [ ] Complete the quiz with 6 correct answers -> Verify Failure.
* [ ] Complete the quiz with 7 correct answers -> Verify Pass.
* [ ] Complete the quiz with 8 correct answers -> Verify Pass.
* [ ] Correct answers receive explanations.
* [ ] Incorrect answers receive relevant feedback.
* [ ] Practical takeaways appear.
* [ ] Failed attempts do not award the badge.
* [ ] Passing attempts award the badge once.
* [ ] Retakes work.
* [ ] Repeated refreshes do not duplicate completion.

---

## F. Completion and reporting

* [ ] Commitment selection works.
* [ ] Completion copy is correct.
* [ ] Compliance Aware badge appears.
* [ ] Course 11 is recommended.
* [ ] Learner dashboard shows completion.
* [ ] Manager or company reporting shows completion.
* [ ] Exported training records include Course 10.
* [ ] Tenant separation remains intact (another tenant cannot view this completion).
* [ ] Completion persists after signing out and signing back in.

---

## G. Responsive and accessibility checks

Test approximately:
* [ ] 390 px mobile width.
* [ ] Tablet width.
* [ ] Desktop width.

Confirm:
* [ ] Readable text and suitable touch targets.
* [ ] No cropped scenario controls and no horizontal scrolling.
* [ ] Visible keyboard focus.
* [ ] Descriptive alternative text on the Hero Image ("Employees reviewing environmental controls and workplace inspection records.").
* [ ] Feedback is understandable without relying on colour.
* [ ] Loading and error states are usable.

---

## H. Regression

* [ ] Courses 1 through 9 still load.
* [ ] Course 9 still recommends Course 10.
* [ ] Course 11 remains its unchanged skeleton or existing state.
* [ ] Existing quizzes continue to hide answers.
* [ ] Existing badge records remain intact.
* [ ] No new browser-console errors appear.
* [ ] Course 9 end-to-end verification still passes (`scratch/verify_course9_e2e.ts`).
