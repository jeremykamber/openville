import { WorkflowFallback } from "@/features/workflow/types";
import { SearchFilters, SearchRequest, SearchResult } from "../types";
import { marketCandidateRepository } from "../repositories/SupabaseMarketCandidateRepository";
import { embeddingService } from "./embedding";
import { vectorSimilarity } from "./vectorSimilarity";

export class RAGSearchService {
  async search(request: SearchRequest): Promise<{
    results: SearchResult[];
    queryEmbedding: number[] | null;
    totalFound: number;
    source: "supabase" | "seed";
    seeded: boolean;
    retrievalMode: "vector";
    warnings: string[];
    fallbacksUsed: WorkflowFallback[];
  }> {
    const market = await marketCandidateRepository.listCandidates();
    const warnings = [...market.warnings];
    const filteredCandidates = request.filters
      ? this.applyFilters(market.candidates, request.filters)
      : market.candidates;

    const embeddingResult = await embeddingService.generateEmbedding(request.query);
    const queryEmbedding = embeddingResult.embedding;
    const hasCandidateEmbeddings = filteredCandidates.some(
      (candidate) => Array.isArray(candidate.embedding) && candidate.embedding.length > 0,
    );

    if (!queryEmbedding) {
      const message =
        embeddingResult.reason === "unconfigured"
          ? "Embedding provider is not configured."
          : `Embedding API call failed.${embeddingResult.message ? ` Error: ${embeddingResult.message}` : ""}`;
      console.error("RAG search error:", message);
      throw new Error(message);
    }

    if (filteredCandidates.length > 0 && !hasCandidateEmbeddings) {
      const message = "Retrieved market candidates do not include embeddings.";
      console.error("RAG search error:", message);
      throw new Error(message);
    }

    const retrievalMode = "vector" as const;

    const scoredResults = filteredCandidates.map((candidate) => {
      if (!candidate.embedding) {
        const message = `Candidate ${candidate.agentId} is missing an embedding.`;
        console.error("RAG search error:", message);
        throw new Error(message);
      }

      const relevance = vectorSimilarity.cosineSimilarity(
        queryEmbedding,
        candidate.embedding,
      );

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
      fallbacksUsed: [],
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
