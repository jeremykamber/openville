import { SearchResult, RankingWeights, UserPreferences } from "../types";

/* Determine how to rank candidates based on multiple factors */
export class RankingService {
  private defaultWeights: RankingWeights = {
    relevance: 0.4,
    successCount: 0.2,
    rating: 0.2,
    timeOnPlatform: 0.1,
  };

  rankCandidates(
    candidates: SearchResult[],
    userPreferences?: UserPreferences,
    customWeights?: Partial<RankingWeights>
  ): SearchResult[] {
    const weights = { ...this.defaultWeights, ...customWeights };

    return candidates.map((candidate) => {
      /* Normalize each factor to 0-1 range, guard against NaN/Infinity */
      const relevanceScore = Math.max(0, Math.min(1, candidate.relevance || 0));

      /* Normalize success count (assuming max ~500), guard against NaN */
      const successScore = Math.max(0, Math.min(1, (candidate.successCount || 0) / 500));

      /* Normalize rating (1-5 scale to 0-1), guard against NaN */
      const ratingScore = Math.max(0, Math.min(1, (candidate.rating || 0) / 5));

      /* Normalize time on platform (assuming max 10 years), guard against NaN */
      const timeScore = Math.max(0, Math.min(1, (candidate.yearsOnPlatform || 0) / 10));

      /* Calculate base composite score */
      let compositeScore =
        (relevanceScore * weights.relevance) +
        (successScore * weights.successCount) +
        (ratingScore * weights.rating) +
        (timeScore * weights.timeOnPlatform);

      /* Apply user preference adjustments */
      if (userPreferences?.budget !== undefined && userPreferences.budget !== null && candidate.hourlyRate) {
        const budgetRatio = userPreferences.budget / candidate.hourlyRate;
        if (budgetRatio < 1) {
          /* Candidate is over budget - penalize score */
          compositeScore *= 0.5;
        } else if (budgetRatio > 1.5) {
          /* Candidate is well under budget - bonus */
          compositeScore *= 1.1;
        }
      }

      /* Priority adjustments */
      if (userPreferences?.priority === "cost" && candidate.hourlyRate) {
        const rateBonus = Math.max(0, (200 - candidate.hourlyRate) / 200) * 0.1;
        compositeScore += rateBonus;
      } else if (userPreferences?.priority === "quality") {
        const qualityBonus = (candidate.rating - 3) * 0.05;
        compositeScore += Math.max(0, qualityBonus);
      }

      /* Clamp final score to 0-1, guard against NaN/Infinity */
      const finalScore = Math.max(0, Math.min(1, compositeScore || 0));

      return {
        ...candidate,
        score: finalScore,
      };
    });
  }

  setWeights(weights: Partial<RankingWeights>): void {
    this.defaultWeights = { ...this.defaultWeights, ...weights };
  }
}

export const rankingService = new RankingService();
