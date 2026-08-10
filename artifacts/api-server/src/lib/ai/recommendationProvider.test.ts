import test from "node:test";
import assert from "node:assert/strict";
import { FallbackRecommendationProvider, GeminiRecommendationProvider } from "./recommendationProviders";
import { RecommendationInput } from "./recommendationProvider";

const mockInput: RecommendationInput = {
  company: {
    sector: "Hospitality",
    employeeBand: "1-25",
    trainingPriorities: ["energy_efficiency", "water_conservation"],
  },
  learner: {
    department: "Facilities",
    roleCategory: "Operations",
    jobTitle: "Facilities Manager",
    completedCourseIds: [1], // ELH-01 completed
    assignedCourseIds: [2],  // ELH-02 already assigned
  },
  availableCourses: [
    { id: 1, courseCode: "ELH-01", title: "Sustainability Foundations", description: "", level: "Beginner", durationMinutes: 30, prerequisites: [] },
    { id: 2, courseCode: "ELH-02", title: "Waste Sorting & Bin System", description: "", level: "Beginner", durationMinutes: 45, prerequisites: [] },
    { id: 3, courseCode: "ELH-03", title: "Energy Efficiency at Work", description: "", level: "Intermediate", durationMinutes: 40, prerequisites: [] },
    { id: 4, courseCode: "ELH-04", title: "Water Conservation Practices", description: "", level: "Intermediate", durationMinutes: 35, prerequisites: [] },
    { id: 5, courseCode: "ELH-09", title: "ESG Basics", description: "", level: "Advanced", durationMinutes: 60, prerequisites: ["ELH-01"] },
  ],
};

test("FallbackRecommendationProvider generates valid recommendations excluding completed & assigned courses", async () => {
  const provider = new FallbackRecommendationProvider();
  const result = await provider.generateRecommendation(mockInput);

  assert.ok(result.recommendedCourses.length > 0);
  assert.ok(result.recommendedCourses.length <= 5);

  const recommendedIds = result.recommendedCourses.map((r) => r.courseId);
  assert.equal(recommendedIds.includes(1), false, "Completed course ELH-01 must be excluded");
  assert.equal(recommendedIds.includes(2), false, "Assigned course ELH-02 must be excluded");
  assert.equal(recommendedIds.includes(3), true, "Energy Efficiency course ELH-03 should be recommended");

  const elh03 = result.recommendedCourses.find((r) => r.courseId === 3);
  assert.equal(elh03?.priority, "high");
  assert.ok(elh03?.reason.includes("Facilities"));
});

test("GeminiRecommendationProvider falls back cleanly when API key is unconfigured", async () => {
  const oldKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;

  try {
    const provider = new GeminiRecommendationProvider();
    const result = await provider.generateRecommendation(mockInput);

    assert.ok(result.recommendedCourses.length > 0);
    assert.ok(result.recommendedCourses.length <= 5);
  } finally {
    process.env.GEMINI_API_KEY = oldKey;
  }
});
