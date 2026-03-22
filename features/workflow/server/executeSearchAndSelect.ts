import { selectTop3 } from "@/features/agents/selection/selectTop3";
import type { SearchResult } from "@/features/search/types";
import { ragSearchService } from "@/features/search/services/ragSearch";
import { rankingService } from "@/features/search/services/ranking";
import type {
  SearchAndSelectRequest,
  SearchAndSelectResponse,
  WorkflowProviderType,
} from "@/features/workflow/client/types";
import {
  mergeExecutionMeta,
  getConfiguredLlmProvider,
  resolveConfiguredLlmModel,
} from "@/features/workflow/server/runtime";

export async function executeSearchAndSelect(
  request: SearchAndSelectRequest,
  options: { providerType?: WorkflowProviderType } = {},
): Promise<SearchAndSelectResponse> {
  const {
    results: ragResults,
    source,
    retrievalMode,
    warnings,
    fallbacksUsed,
  } = await ragSearchService.search({
    query: request.query,
    userPreferences: request.userPreferences,
    filters: {
      // serviceCategories and location are intentionally omitted here.
      // They act as hard gates that eliminate candidates too aggressively.
      minRating: request.userPreferences.minRating,
      maxHourlyRate: request.userPreferences.budget,
    },
    limit: 50,
  });

  const rankedCandidates = rankingService.rankCandidates(
    ragResults,
    request.userPreferences,
  );

  rankedCandidates.sort((left, right) => right.score - left.score);
  const top10 = rankedCandidates.slice(0, request.limit ?? 10) as SearchResult[];

  const configuredProvider = options.providerType ?? getConfiguredLlmProvider();
  if (configuredProvider === "unconfigured") {
    const error = new Error("No live LLM provider is configured for shortlist selection.");
    console.error("Search-and-select error:", error);
    throw error;
  }

  if (configuredProvider === "mock") {
    const error = new Error("Mock shortlist fallback is disabled for landing search.");
    console.error("Search-and-select error:", error);
    throw error;
  }

  const searchWarnings =
    top10.length < 3
      ? [
          ...warnings,
          "Search returned fewer than 3 candidates, so shortlist selection was skipped.",
        ]
      : warnings;

  const searchMeta = {
    mode:
      fallbacksUsed.length > 0 || top10.length < 3
        ? "degraded"
        : "live",
    llmProvider: configuredProvider,
    model: resolveConfiguredLlmModel(configuredProvider),
    dataSource: source,
    retrievalMode,
    fallbacksUsed: [...fallbacksUsed],
    warnings: [...searchWarnings],
  } as const;

  let selectionResult: SearchAndSelectResponse["selectionResult"] = null;

  if (top10.length >= 3) {
    try {
      selectionResult = await selectTop3(
        top10,
        request.userPreferences,
        request.scope,
        { providerType: configuredProvider },
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown shortlist selection failure";
      console.error("Search-and-select shortlist selection error:", error);
      throw new Error(message);
    }
  }

  return {
    searchResults: top10,
    rankedResults: rankedCandidates as SearchResult[],
    selectionResult,
    meta: mergeExecutionMeta(searchMeta, {
      fallbacksUsed: [],
      warnings: [],
      llmProvider: configuredProvider,
      model: resolveConfiguredLlmModel(configuredProvider),
    }),
  };
}
