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

    let candidates = availableCourses.filter(
      (c) => !completedSet.has(c.id) && !assignedSet.has(c.id)
    );

    // If all courses are assigned or completed, include uncompleted courses or top catalogue courses
    if (candidates.length === 0) {
      candidates = availableCourses.filter((c) => !completedSet.has(c.id));
      if (candidates.length === 0) {
        candidates = availableCourses;
      }
    }

    const deptLower = (learner.department || "").toLowerCase();
    const roleLower = (learner.roleCategory || "").toLowerCase();
    const jobLower = (learner.jobTitle || "").toLowerCase();
    const prioritiesSet = new Set(company.trainingPriorities.map((p) => p.toLowerCase()));

    interface ScoredCourse {
      course: typeof availableCourses[0];
      score: number;
      priority: "high" | "medium" | "optional";
      reason: string;
    }

    const scoredList: ScoredCourse[] = [];

    for (const course of candidates) {
      let score = 20;
      let priority: "high" | "medium" | "optional" = "optional";
      let reason = `Recommended sustainability training for ${learner.department || "all"} staff.`;

      const codeUpper = (course.courseCode || "").toUpperCase();
      const titleLower = (course.title || "").toLowerCase();
      const descLower = (course.description || "").toLowerCase();

      // Check if prerequisites are met
      const hasMissingPrereq = course.prerequisites && course.prerequisites.length > 0
        ? course.prerequisites.some((pCode) => {
            const prereqCourse = availableCourses.find((c) => (c.courseCode || "").toUpperCase() === pCode.toUpperCase());
            return prereqCourse ? !completedSet.has(prereqCourse.id) : true;
          })
        : false;

      // Capstone certification should only be prioritized if foundations are done
      if (codeUpper === "ELH-12") {
        if (completedSet.size >= 5 && !hasMissingPrereq) {
          score += 60;
          priority = "high";
          reason = "Capstone sustainability certification: you have completed the prerequisite foundation modules.";
        } else {
          score -= 40; // Deprioritize until learner is ready
          reason = "Comprehensive certification capstone: recommended after core practical modules.";
        }
      }

      // Foundational Core
      if (codeUpper === "ELH-01") {
        if (completedSet.size === 0) {
          score += 80;
          priority = "high";
          reason = "Essential foundation course: the ideal first step to build baseline sustainability awareness.";
        } else {
          score += 10;
        }
      }

      // Department & Job matching
      if (
        deptLower.includes("operat") ||
        deptLower.includes("facil") ||
        deptLower.includes("mainten") ||
        deptLower.includes("kitchen") ||
        jobLower.includes("operat") ||
        jobLower.includes("technic")
      ) {
        if (codeUpper === "ELH-29" || titleLower.includes("operations") || titleLower.includes("frontline")) {
          score += 70;
          priority = "high";
          reason = `Directly tailored for ${learner.department || "Operations"} frontline practices, waste reduction, and site efficiency.`;
        } else if (codeUpper === "ELH-27" || titleLower.includes("facilities") || titleLower.includes("property")) {
          score += 65;
          priority = "high";
          reason = `Recommended for ${learner.department || "Facilities"} to manage building efficiency, HVAC, and property sustainability.`;
        } else if (titleLower.includes("energy") || titleLower.includes("waste") || titleLower.includes("water")) {
          score += 50;
          priority = "high";
          reason = `Recommended because ${learner.department || "Facilities"} staff directly handle site energy, water, and resource efficiency.`;
        }
      } else if (
        deptLower.includes("procur") ||
        deptLower.includes("purchas") ||
        deptLower.includes("supply") ||
        jobLower.includes("buyer") ||
        jobLower.includes("procure")
      ) {
        if (codeUpper === "ELH-26" || titleLower.includes("procurement") || titleLower.includes("purchasing")) {
          score += 75;
          priority = "high";
          reason = "Specialized module for procurement professionals to evaluate sustainable suppliers and supply chain impact.";
        } else if (titleLower.includes("circular") || titleLower.includes("waste")) {
          score += 40;
          priority = "medium";
          reason = "Covers product lifecycle and circular purchasing disciplines.";
        }
      } else if (
        deptLower.includes("hr") ||
        deptLower.includes("human") ||
        deptLower.includes("people") ||
        deptLower.includes("talent") ||
        jobLower.includes("hr") ||
        jobLower.includes("training")
      ) {
        if (codeUpper === "ELH-24" || titleLower.includes("hr")) {
          score += 75;
          priority = "high";
          reason = "Designed for HR teams to embed sustainability into culture, onboarding, and employee engagement.";
        } else if (codeUpper === "ELH-14" || titleLower.includes("green team")) {
          score += 60;
          priority = "high";
          reason = "Guide to launching and coordinating cross-functional workplace Green Teams.";
        }
      } else if (
        deptLower.includes("finance") ||
        deptLower.includes("account") ||
        deptLower.includes("audit") ||
        jobLower.includes("finance") ||
        jobLower.includes("accountant")
      ) {
        if (codeUpper === "ELH-25" || titleLower.includes("finance")) {
          score += 75;
          priority = "high";
          reason = "Covers ESG financial implications, carbon risk accounting, and resource cost savings.";
        } else if (titleLower.includes("esg data") || titleLower.includes("reporting")) {
          score += 55;
          priority = "high";
          reason = "Covers non-financial ESG metrics, data verification, and reporting frameworks.";
        }
      } else if (
        deptLower.includes("sales") ||
        deptLower.includes("market") ||
        deptLower.includes("comms") ||
        jobLower.includes("sales") ||
        jobLower.includes("marketing")
      ) {
        if (codeUpper === "ELH-28" || titleLower.includes("sales") || titleLower.includes("marketing")) {
          score += 75;
          priority = "high";
          reason = "Equips sales and marketing teams to communicate credible sustainability claims and avoid greenwashing.";
        }
      } else if (
        roleLower.includes("admin") ||
        roleLower.includes("manager") ||
        roleLower.includes("director") ||
        jobLower.includes("manager") ||
        jobLower.includes("lead")
      ) {
        if (titleLower.includes("leadership") || titleLower.includes("goal") || titleLower.includes("initiatives")) {
          score += 60;
          priority = "high";
          reason = "Management-level course on setting departmental sustainability targets and driving accountability.";
        }
      }

      // Company Priority Boosts
      if (prioritiesSet.has("energy_efficiency") && (titleLower.includes("energy") || descLower.includes("energy"))) {
        score += 35;
        if (priority === "optional") priority = "medium";
        reason += " Aligns with organization priority: Energy Efficiency.";
      }
      if (prioritiesSet.has("water_conservation") && (titleLower.includes("water") || descLower.includes("water"))) {
        score += 35;
        if (priority === "optional") priority = "medium";
        reason += " Aligns with organization priority: Water Conservation.";
      }
      if (prioritiesSet.has("waste_circularity") && (titleLower.includes("waste") || titleLower.includes("recycling") || titleLower.includes("circular"))) {
        score += 35;
        if (priority === "optional") priority = "medium";
        reason += " Aligns with organization priority: Waste & Circularity.";
      }
      if (prioritiesSet.has("esg_literacy") && (titleLower.includes("esg") || titleLower.includes("ethics") || titleLower.includes("governance"))) {
        score += 35;
        if (priority === "optional") priority = "medium";
        reason += " Aligns with organization priority: ESG & Governance Literacy.";
      }

      // Foundational prerequisites bonus
      if (!hasMissingPrereq) {
        score += 15;
      } else {
        score -= 15;
      }

      if (score >= 60) {
        priority = "high";
      } else if (score >= 40) {
        priority = "medium";
      }

      scoredList.push({
        course,
        score,
        priority,
        reason,
      });
    }

    // Sort by score descending
    scoredList.sort((a, b) => b.score - a.score);

    const recommended = scoredList.slice(0, 5).map((item) => ({
      courseId: item.course.id,
      courseCode: item.course.courseCode,
      reason: item.reason,
      priority: item.priority,
    }));

    return {
      recommendedCourses: recommended,
      pathwayReason: `Generated role-aligned learning pathway tailored to ${company.sector || "Sustainability"} sector, ${learner.department || "General"} department, and company priorities.`,
      confidence: "high",
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
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s fast timeout for AI reasoning

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
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
      if (!parsed || !Array.isArray(parsed.recommendedCourses) || parsed.recommendedCourses.length === 0) {
        logger.warn({ provider: "fallback" }, "Invalid JSON schema or empty courses from Gemini API. Using fallback recommendation.");
        return this.fallback.generateRecommendation(input);
      }

      logger.info({ provider: "gemini", model: "gemini-2.5-flash" }, "Successfully generated recommendations using Gemini AI Provider.");
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
