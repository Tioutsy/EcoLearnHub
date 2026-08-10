import { CompanyAccess } from "../access";

export interface CourseCatalogItem {
  id: number;
  courseCode: string;
  title: string;
  description: string;
  level: string;
  durationMinutes: number;
  prerequisites: string[];
}

export interface RecommendationInput {
  company: {
    sector: string;
    employeeBand: string;
    trainingPriorities: string[];
  };
  learner: {
    department: string;
    roleCategory: string;
    jobTitle: string;
    completedCourseIds: number[];
    assignedCourseIds: number[];
  };
  availableCourses: CourseCatalogItem[];
}

export interface RawCourseRecommendation {
  courseId: number | string;
  courseCode: string;
  reason: string;
  priority: "high" | "medium" | "optional";
}

export interface RecommendationResult {
  recommendedCourses: RawCourseRecommendation[];
  pathwayReason: string;
  confidence: "high" | "medium" | "low";
  providerTag?: "gemini" | "fallback";
}

export interface LearningRecommendationProvider {
  generateRecommendation(input: RecommendationInput): Promise<RecommendationResult>;
}
