import type { UserPreferences } from "@/features/shared/contracts/UserPreferences";

export const defaultUserPreferences: UserPreferences = {
  budgetPriority: "balanced",
  timeline: "this_week",
  qualityPriority: "standard",
  notes: "",
  maxBudget: null,
};

export function inferPreferencesFromRequest(
  request: string,
): Partial<UserPreferences> {
  const normalized = request.toLowerCase();

  return {
    budgetPriority: normalized.includes("cheap") || normalized.includes("budget")
      ? "low_cost"
      : normalized.includes("best") || normalized.includes("premium")
        ? "premium"
        : "balanced",
    timeline: normalized.includes("today") || normalized.includes("asap")
      ? "asap"
      : normalized.includes("week")
        ? "this_week"
        : "flexible",
    qualityPriority:
      normalized.includes("best") || normalized.includes("quality")
        ? "high"
        : "standard",
    maxBudget: normalized.includes("$150") || normalized.includes("150")
      ? 150
      : normalized.includes("$200") || normalized.includes("200")
        ? 200
        : null,
    notes: request.trim(),
  };
}

export function mergeUserPreferences(
  preferences: Partial<UserPreferences>,
): UserPreferences {
  return {
    ...defaultUserPreferences,
    ...preferences,
    notes: preferences.notes ?? defaultUserPreferences.notes,
  };
}
