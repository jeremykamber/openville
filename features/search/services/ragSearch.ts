import { WorkflowFallback } from "@/features/workflow/types";
import { SearchRequest, SearchResult } from "../types";
import { marketCandidateRepository } from "../repositories/SupabaseMarketCandidateRepository";
import { embeddingService } from "./embedding";

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
    const embeddingResult = await embeddingService.generateEmbedding(request.query);
    const queryEmbedding = embeddingResult.embedding;

    if (!queryEmbedding) {
      const message =
        embeddingResult.reason === "unconfigured"
          ? "Embedding provider is not configured."
          : `Embedding API call failed.${embeddingResult.message ? ` Error: ${embeddingResult.message}` : ""}`;
      console.error("RAG search error:", message);
      throw new Error(message);
    }

    const limit = Math.max(1, Math.min(request.limit ?? 50, 50));

    // Database-level vector search with pgvector — filters applied in SQL
    const vectorResult = await marketCandidateRepository.searchByVector(
      queryEmbedding,
      limit,
      request.filters,
    );

    // Service category filtering uses substring matching, handled in JS
    let results = vectorResult.candidates;
    if (request.filters?.serviceCategories?.length) {
      results = this.filterByServiceCategories(results, request.filters.serviceCategories);
    }

    return {
      results,
      queryEmbedding,
      totalFound: vectorResult.totalFound,
      source: vectorResult.source,
      seeded: false,
      retrievalMode: "vector",
      warnings: [],
      fallbacksUsed: [],
    };
  }

  private filterByServiceCategories(
    results: SearchResult[],
    categories: string[],
  ): SearchResult[] {
    return results.filter((person) => {
      const personServices = person.services || [];
      return personServices.some((service) =>
        categories.some((category) =>
          service.toLowerCase().includes(category.toLowerCase()),
        ),
      );
    });
  }
}

export const ragSearchService = new RAGSearchService();
