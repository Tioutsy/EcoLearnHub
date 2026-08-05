export type ReminderCategory =
  | "invitation_pending"
  | "assignment_not_started"
  | "due_soon"
  | "overdue"
  | "inactive_in_progress"
  | "quiz_retry"
  | "pathway_continuation"
  | "completion_confirmation";

export interface ReminderPolicyRule {
  category: ReminderCategory;
  title: string;
  triggerDays: number[];
  maxCount: number;
  cooldownDays: number;
  channel: "email" | "in_app";
  isOptional: boolean;
}

export interface TrainingReminderPolicy {
  rules: Record<ReminderCategory, ReminderPolicyRule>;
}

export const defaultTrainingReminderPolicy: TrainingReminderPolicy = {
  rules: {
    invitation_pending: {
      category: "invitation_pending",
      title: "Activate Your Elevio Corporate Account",
      triggerDays: [3, 7],
      maxCount: 2,
      cooldownDays: 3,
      channel: "email",
      isOptional: false, // Operational
    },
    assignment_not_started: {
      category: "assignment_not_started",
      title: "New Sustainability Course Assigned",
      triggerDays: [3],
      maxCount: 1,
      cooldownDays: 3,
      channel: "email",
      isOptional: false, // Operational
    },
    due_soon: {
      category: "due_soon",
      title: "Upcoming Training Deadline Alert",
      triggerDays: [7, 2],
      maxCount: 2,
      cooldownDays: 2,
      channel: "email",
      isOptional: false, // Operational
    },
    overdue: {
      category: "overdue",
      title: "Overdue Training Compliance Reminder",
      triggerDays: [1, 7, 14, 21],
      maxCount: 4,
      cooldownDays: 7,
      channel: "email",
      isOptional: false, // Operational
    },
    inactive_in_progress: {
      category: "inactive_in_progress",
      title: "Resume Your In-Progress Training Module",
      triggerDays: [7, 14],
      maxCount: 2,
      cooldownDays: 7,
      channel: "email",
      isOptional: true, // Engagement
    },
    quiz_retry: {
      category: "quiz_retry",
      title: "Assessment Review & Quiz Retry Available",
      triggerDays: [2],
      maxCount: 1,
      cooldownDays: 2,
      channel: "email",
      isOptional: true, // Engagement
    },
    pathway_continuation: {
      category: "pathway_continuation",
      title: "Continue Your Learning Pathway Journey",
      triggerDays: [5],
      maxCount: 1,
      cooldownDays: 5,
      channel: "email",
      isOptional: true, // Engagement
    },
    completion_confirmation: {
      category: "completion_confirmation",
      title: "Course Completion & Certificate Issued",
      triggerDays: [0],
      maxCount: 1,
      cooldownDays: 0,
      channel: "email",
      isOptional: false, // Operational
    },
  },
};
