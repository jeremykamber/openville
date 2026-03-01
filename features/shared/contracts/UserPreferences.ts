/**
 * UserPreferences — Captures what the user cares about when
 * searching for a tradesperson.
 *
 * Aligned with the dev branch UserPreferences from
 * features/search/types/index.ts and features/agents/selection/types/
 *
 * All fields are optional because the chat flow builds preferences
 * incrementally through follow-up questions.
 */
export interface UserPreferences {
  /** Maximum budget in dollars */
  budget?: number;
  /** Primary optimization axis */
  priority?: "cost" | "quality" | "speed" | "rating";
  /** Hard requirements that eliminate candidates */
  dealBreakers?: string[];
  /** Soft requirements that boost ranking */
  preferredQualifications?: string[];
  /** When the user needs the work done */
  availabilityRequired?: string;
  /** Minimum acceptable rating (1-5) */
  minRating?: number;
  /** Geographic preference */
  location?: string;
  /** Availability window preference */
  availability?: "any" | "weekdays" | "weekends";
}
