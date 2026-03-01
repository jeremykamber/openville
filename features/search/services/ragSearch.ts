import { WorkflowFallback } from "@/features/workflow/types";
import { SearchFilters, SearchRequest, SearchResult } from "../types";
import { marketCandidateRepository } from "../repositories/SupabaseMarketCandidateRepository";
import { embeddingService } from "./embedding";
import { vectorSimilarity } from "./vectorSimilarity";

function computeKeywordRelevance(query: string, candidate: SearchResult): number {
  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);

  if (tokens.length === 0) {
    return 0;
  }

  const fields = [
    candidate.name,
    candidate.description ?? "",
    ...(candidate.services ?? []),
    ...(candidate.specialties ?? []),
    ...(candidate.tags ?? []),
    candidate.location ?? "",
  ]
    .join(" ")
    .toLowerCase();

  const matches = tokens.reduce((score, token) => {
    if (fields.includes(token)) {
      return score + 1;
    }

    return score;
  }, 0);

  return Math.max(0, Math.min(1, matches / tokens.length));
}

export class RAGSearchService {
  async search(request: SearchRequest): Promise<{
    results: SearchResult[];
    queryEmbedding: number[] | null;
    totalFound: number;
    source: "supabase" | "seed";
    seeded: boolean;
    retrievalMode: "vector" | "keyword";
    warnings: string[];
    fallbacksUsed: WorkflowFallback[];
  }> {
    const market = await marketCandidateRepository.listCandidates();
    const filteredCandidates = request.filters
      ? this.applyFilters(market.candidates, request.filters)
      : market.candidates;

    const queryEmbedding = await embeddingService.generateEmbedding(request.query);
    const hasCandidateEmbeddings = filteredCandidates.some(
      (candidate) => Array.isArray(candidate.embedding) && candidate.embedding.length > 0,
    );

    const warnings = [...market.warnings];
    const fallbacksUsed = [...market.fallbacksUsed];
    const retrievalMode =
      queryEmbedding && hasCandidateEmbeddings ? "vector" : "keyword";

    if (retrievalMode === "keyword") {
      warnings.push("Using keyword retrieval fallback.");
      fallbacksUsed.push("keyword_search");
    }

    const scoredResults = filteredCandidates.map((candidate) => {
      const relevance =
        retrievalMode === "vector" && queryEmbedding && candidate.embedding
          ? vectorSimilarity.cosineSimilarity(queryEmbedding, candidate.embedding)
          : computeKeywordRelevance(request.query, candidate);

      return {
        ...candidate,
        relevance,
      };
    });

    const limit = Math.max(1, Math.min(request.limit ?? 50, 50));

    return {
      results: scoredResults.sort((a, b) => b.relevance - a.relevance).slice(0, limit),
      queryEmbedding,
      totalFound: filteredCandidates.length,
      source: market.source,
      seeded: market.seeded,
      retrievalMode,
      warnings: [...new Set(warnings)],
      fallbacksUsed: [...new Set(fallbacksUsed)],
    };
  }

  private applyFilters(results: SearchResult[], filters: SearchFilters): SearchResult[] {
    return results.filter((person) => {
      if (filters.serviceCategories?.length) {
        const personServices = person.services || [];
        const hasService = personServices.some((service) =>
          filters.serviceCategories!.some((category) =>
            service.toLowerCase().includes(category.toLowerCase()),
          ),
        );

        if (!hasService) {
          return false;
        }
      }

      if (
        filters.minRating !== undefined &&
        filters.minRating !== null &&
        (person.rating || 0) < filters.minRating
      ) {
        return false;
      }

      if (
        filters.minSuccessCount !== undefined &&
        filters.minSuccessCount !== null &&
        (person.successCount || 0) < filters.minSuccessCount
      ) {
        return false;
      }

      if (
        filters.maxHourlyRate !== undefined &&
        filters.maxHourlyRate !== null &&
        (person.hourlyRate || 0) > filters.maxHourlyRate
      ) {
        return false;
      }

      if (
        filters.location &&
        !(person.location || "").toLowerCase().includes(filters.location.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }
}

export const ragSearchService = new RAGSearchService();
