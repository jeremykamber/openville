import type { UserPreferences } from "@/features/shared/contracts/UserPreferences";

/**
 * Default preferences — used as fallback when the chat hasn't yet
 * extracted specific preferences from the user's request.
 */
export const defaultUserPreferences: UserPreferences = {
  priority: "quality",
  availability: "any",
};

/**
 * inferPreferencesFromRequest — Extracts user preferences from
 * natural language input using simple keyword matching.
 *
 * This is a frontend-only heuristic. The real preference extraction
 * happens server-side via the LLM agent. This provides instant
 * optimistic feedback before the server responds.
 */
export function inferPreferencesFromRequest(
  request: string,
): Partial<UserPreferences> {
  const normalized = request.toLowerCase();
  const result: Partial<UserPreferences> = {};

  // Priority detection
  if (
    normalized.includes("cheap") ||
    normalized.includes("budget") ||
    normalized.includes("affordable") ||
    normalized.includes("cost")
  ) {
    result.priority = "cost";
  } else if (
    normalized.includes("best") ||
    normalized.includes("quality") ||
    normalized.includes("reliable")
  ) {
    result.priority = "quality";
  } else if (
    normalized.includes("fast") ||
    normalized.includes("asap") ||
    normalized.includes("urgent") ||
    normalized.includes("today") ||
    normalized.includes("tomorrow")
  ) {
    result.priority = "speed";
  }

  // Budget extraction
  const budgetMatch = normalized.match(/\$\s?(\d{2,6})/);
  if (budgetMatch) {
    result.budget = Number(budgetMatch[1]);
  }
  const kBudgetMatch = normalized.match(/(\d+)\s?k/);
  if (kBudgetMatch) {
    result.budget = Number(kBudgetMatch[1]) * 1000;
  }

  // Availability detection
  if (normalized.includes("weekend")) {
    result.availability = "weekends";
  } else if (normalized.includes("weekday")) {
    result.availability = "weekdays";
  }

  // Availability required (temporal)
  if (normalized.includes("today") || normalized.includes("asap")) {
    result.availabilityRequired = "today";
  } else if (normalized.includes("this week")) {
    result.availabilityRequired = "this_week";
  }

  // Location extraction (simple city detection)
  const locationMatch = normalized.match(
    /\b(?:in|near|around)\s+([a-z\s]+?)(?:\.|,|$)/,
  );
  if (locationMatch) {
    result.location = locationMatch[1].trim();
  }

  // Min rating extraction
  const ratingMatch = normalized.match(/(\d(?:\.\d)?)\s*(?:\+\s*)?star/);
  if (ratingMatch) {
    result.minRating = Number(ratingMatch[1]);
  }

  return result;
}

/**
 * mergeUserPreferences — Merges partial preferences (from inference)
 * into a complete UserPreferences object with defaults.
 */
export function mergeUserPreferences(
  preferences: Partial<UserPreferences>,
): UserPreferences {
  return {
    ...defaultUserPreferences,
    ...preferences,
  };
}
