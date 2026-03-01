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
  const budgetPriority =
    normalized.includes("cheap") ||
    normalized.includes("budget") ||
    normalized.includes("cost") ||
    normalized.includes("tight")
      ? "low_cost"
      : normalized.includes("best") ||
          normalized.includes("premium") ||
          normalized.includes("highest quality")
        ? "premium"
        : "balanced";
  const timeline =
    normalized.includes("today") ||
    normalized.includes("asap") ||
    normalized.includes("tomorrow") ||
    normalized.includes("4 pm") ||
    normalized.includes("deadline")
      ? "asap"
      : normalized.includes("week")
        ? "this_week"
        : "flexible";
  const qualityPriority =
    normalized.includes("reliable") ||
    normalized.includes("reliability") ||
    normalized.includes("best") ||
    normalized.includes("quality")
      ? "high"
      : "standard";
  const maxBudgetMatch = normalized.match(/\$?(\d{3,5})(k)?/);
  const maxBudget = maxBudgetMatch
    ? maxBudgetMatch[2]
      ? Number(maxBudgetMatch[1]) * 1000
      : Number(maxBudgetMatch[1])
    : null;

  return {
    budgetPriority,
    timeline,
    qualityPriority,
    maxBudget,
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
