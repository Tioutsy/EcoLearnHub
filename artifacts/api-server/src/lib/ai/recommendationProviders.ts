import {
  LearningRecommendationProvider,
  RecommendationInput,
  RecommendationResult,
} from "./recommendationProvider";
import { logger } from "../logger";

export class FallbackRecommendationProvider implements LearningRecommendationProvider {
  async generateRecommendation(input: RecommendationInput): Promise<RecommendationResult> {
    const { company, learner, availableCourses } = input;
    const completedSet = new Set(learner.completedCourseIds);
    const assignedSet = new Set(learner.assignedCourseIds);

    const candidates = availableCourses.filter(
      (c) => !completedSet.has(c.id) && !assignedSet.has(c.id)
    );

    const recommended: RecommendationResult["recommendedCourses"] = [];
    const deptLower = (learner.department || "").toLowerCase();
    const roleLower = (learner.roleCategory || "").toLowerCase();
    const prioritiesSet = new Set(company.trainingPriorities.map((p) => p.toLowerCase()));

    for (const course of candidates) {
      let priority: "high" | "medium" | "optional" = "optional";
      let reason = `Relevant sustainability course for ${learner.department || "employees"}.`;

      const codeUpper = (course.courseCode || "").toUpperCase();
      const titleLower = (course.title || "").toLowerCase();

      // Rule-based priority matching
      if (
        deptLower.includes("facility") ||
        deptLower.includes("facilities") ||
        deptLower.includes("operation")
      ) {
        if (titleLower.includes("energy") || titleLower.includes("water") || titleLower.includes("waste")) {
          priority = "high";
          reason = `Recommended because ${learner.department || "operations"} staff directly handle site energy, water, and resource efficiency.`;
        }
      } else if (deptLower.includes("procure") || deptLower.includes("purchas") || deptLower.includes("finance")) {
        if (titleLower.includes("procurement") || titleLower.includes("supply") || titleLower.includes("finance")) {
          priority = "high";
          reason = `Recommended for ${learner.department || "finance & procurement"} to manage sustainable supply chains and commercial risk.`;
        }
      } else if (deptLower.includes("hr") || deptLower.includes("human") || deptLower.includes("admin")) {
        if (titleLower.includes("green team") || titleLower.includes("workplace") || titleLower.includes("foundations")) {
          priority = "high";
          reason = `Recommended for ${learner.department || "HR & Admin"} staff to drive workplace green initiatives and employee engagement.`;
        }
      }

      if (prioritiesSet.has("energy_efficiency") && titleLower.includes("energy")) {
        priority = "high";
        reason += ` Matches company priority: Energy Efficiency.`;
      } else if (prioritiesSet.has("water_conservation") && titleLower.includes("water")) {
        priority = "high";
        reason += ` Matches company priority: Water Conservation.`;
      } else if (prioritiesSet.has("waste_circularity") && (titleLower.includes("waste") || titleLower.includes("recycling"))) {
        priority = "high";
        reason += ` Matches company priority: Waste & Circularity.`;
      } else if (prioritiesSet.has("esg_literacy") && titleLower.includes("esg")) {
        priority = "high";
        reason += ` Matches company priority: ESG Literacy.`;
      }

      if (codeUpper === "ELH-01" && completedSet.size === 0) {
        priority = "high";
        reason = "Essential foundation course recommended as the first step in sustainability training.";
      }

      recommended.push({
        courseId: course.id,
        courseCode: course.courseCode,
        reason,
        priority,
      });
    }

    // Sort: high -> medium -> optional
    const order = { high: 1, medium: 2, optional: 3 };
    recommended.sort((a, b) => order[a.priority] - order[b.priority]);

    const sliced = recommended.slice(0, 5);

    return {
      recommendedCourses: sliced,
      pathwayReason: `Generated structured recommendation pathway tailored to ${company.sector || "general"} sector, ${learner.department || "general"} department, and company priorities.`,
      confidence: "medium",
      providerTag: "fallback",
    };
  }
}

export class GeminiRecommendationProvider implements LearningRecommendationProvider {
  private fallback = new FallbackRecommendationProvider();

  async generateRecommendation(input: RecommendationInput): Promise<RecommendationResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === "") {
      logger.info({ provider: "fallback" }, "GEMINI_API_KEY missing. Using FallbackRecommendationProvider.");
      return this.fallback.generateRecommendation(input);
    }

    try {
      const prompt = this.buildPrompt(input);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout for AI reasoning

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: "application/json",
            },
          }),
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        logger.warn({ provider: "fallback", status: response.status }, `Gemini API error status ${response.status}. Using fallback recommendation.`);
        return this.fallback.generateRecommendation(input);
      }

      const resJson = (await response.json()) as any;
      const rawText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        logger.warn({ provider: "fallback" }, "Empty response from Gemini API. Using fallback recommendation.");
        return this.fallback.generateRecommendation(input);
      }

      const parsed = JSON.parse(rawText) as RecommendationResult;
      if (!parsed || !Array.isArray(parsed.recommendedCourses)) {
        logger.warn({ provider: "fallback" }, "Invalid JSON schema from Gemini API. Using fallback recommendation.");
        return this.fallback.generateRecommendation(input);
      }

      logger.info({ provider: "gemini", model: "gemini-3.6-flash" }, "Successfully generated recommendations using Gemini AI Provider.");
      return {
        ...parsed,
        providerTag: "gemini",
      };
    } catch (err: any) {
      logger.warn({ provider: "fallback", err: err?.message }, "Gemini API call failed or timed out. Falling back cleanly.");
      return this.fallback.generateRecommendation(input);
    }
  }

  private buildPrompt(input: RecommendationInput): string {
    const systemInstructions = `
You are the ELEVIO SKILLS AI Recommendation Engine.
STRICT RULES:
1. Recommend ONLY existing courses provided in the AVAILABLE_COURSES list below.
2. DO NOT invent course codes, course titles, or course IDs under any circumstances.
3. DO NOT provide legal advice, claim ESG regulatory compliance, claim HRDC eligibility, or calculate environmental impact.
4. DO NOT attempt to assign training automatically or change company data.
5. Provide concise, human-readable explanations (1 sentence) for why each course is recommended based on the employee's role/department and company priorities.
6. Target between 3 and 5 recommended courses.
7. Output strictly valid JSON matching this structure:
{
  "recommendedCourses": [
    {
      "courseId": number,
      "courseCode": "string",
      "reason": "string",
      "priority": "high" | "medium" | "optional"
    }
  ],
  "pathwayReason": "string",
  "confidence": "high" | "medium" | "low"
}
`;

    return `${systemInstructions}

COMPANY CONTEXT:
Sector: ${input.company.sector || "Unspecified"}
Employee Band: ${input.company.employeeBand || "1-25"}
Training Priorities: ${input.company.trainingPriorities.join(", ") || "General Sustainability"}

LEARNER CONTEXT:
Department: ${input.learner.department || "General"}
Role Category: ${input.learner.roleCategory || "General employee"}
Job Title: ${input.learner.jobTitle || "Employee"}
Completed Course IDs: ${JSON.stringify(input.learner.completedCourseIds)}
Already Assigned Course IDs: ${JSON.stringify(input.learner.assignedCourseIds)}

AVAILABLE_COURSES CATALOG (ONLY SELECT FROM THIS LIST):
${JSON.stringify(input.availableCourses, null, 2)}
`;
  }
}
