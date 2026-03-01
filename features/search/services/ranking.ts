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
      /* Normalize each factor to 0-1 range */
      const relevanceScore = candidate.relevance;

      /* Normalize success count (assuming max ~500) */
      const successScore = Math.min(candidate.successCount / 500, 1);

      /* Normalize rating (1-5 scale to 0-1) */
      const ratingScore = candidate.rating / 5;

      /* Normalize time on platform (assuming max 10 years) */
      const timeScore = Math.min(candidate.yearsOnPlatform / 10, 1);

      /* Calculate base composite score */
      let compositeScore =
        relevanceScore * weights.relevance +
        successScore * weights.successCount +
        ratingScore * weights.rating +
        timeScore * weights.timeOnPlatform;

      /* Apply user preference adjustments */
      if (userPreferences?.budget && candidate.hourlyRate) {
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

      return {
        ...candidate,
        score: Math.min(compositeScore, 1),
      };
    });
  }

  setWeights(weights: Partial<RankingWeights>): void {
    this.defaultWeights = { ...this.defaultWeights, ...weights };
  }
}

export const rankingService = new RankingService();
