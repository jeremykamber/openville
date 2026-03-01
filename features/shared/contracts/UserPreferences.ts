export type BudgetPriority = "low_cost" | "balanced" | "premium";
export type TimelinePreference = "asap" | "this_week" | "flexible";
export type QualityPriority = "standard" | "high";

export interface UserPreferences {
  budgetPriority: BudgetPriority;
  timeline: TimelinePreference;
  qualityPriority: QualityPriority;
  notes: string;
  maxBudget: number | null;
}
