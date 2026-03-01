import { SearchResult, RankingWeights, UserPreferences } from "../types";

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
      const relevanceScore = Math.max(0, Math.min(1, candidate.relevance || 0));
      const successScore = Math.max(0, Math.min(1, (candidate.successCount || 0) / 500));
      const ratingScore = Math.max(0, Math.min(1, (candidate.rating || 0) / 5));
      const timeScore = Math.max(0, Math.min(1, (candidate.yearsOnPlatform || 0) / 10));

      let compositeScore =
        (relevanceScore * weights.relevance) +
        (successScore * weights.successCount) +
        (ratingScore * weights.rating) +
        (timeScore * weights.timeOnPlatform);

      if (userPreferences?.budget !== undefined && userPreferences.budget !== null && candidate.hourlyRate) {
        const budgetRatio = userPreferences.budget / candidate.hourlyRate;
        if (budgetRatio < 1) {
          compositeScore *= 0.5;
        } else if (budgetRatio > 1.5) {
          compositeScore *= 1.1;
        }
      }

      if (userPreferences?.priority === "cost" && candidate.hourlyRate) {
        const rateBonus = Math.max(0, (200 - candidate.hourlyRate) / 200) * 0.1;
        compositeScore += rateBonus;
      } else if (userPreferences?.priority === "quality" || userPreferences?.priority === "rating") {
        const qualityBonus = ((candidate.rating || 0) - 3) * 0.05;
        compositeScore += Math.max(0, qualityBonus);
      }

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
