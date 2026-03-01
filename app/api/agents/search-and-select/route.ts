import { NextRequest, NextResponse } from "next/server";
import { ragSearchService } from "@/features/search/services/ragSearch";
import { rankingService } from "@/features/search/services/ranking";
import { selectTop3 } from "@/features/agents/selection/selectTop3";
import { SelectTop3Response } from "@/features/agents/selection/types";
import { SearchResult } from "@/features/search/types";
import { SearchAndSelectRequestSchema } from "@/features/shared/schemas/WorkflowSchemas";
import {
  isMockLlmFallbackAllowed,
  mergeExecutionMeta,
  resolveLlmProvider,
} from "@/features/workflow/server/runtime";

interface SearchAndSelectResponse {
  searchResults: SearchResult[];
  selectionResult: SelectTop3Response | null;
  meta: ReturnType<typeof mergeExecutionMeta>;
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    const validated = SearchAndSelectRequestSchema.safeParse(rawBody);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid workflow request", details: validated.error.format() },
        { status: 400 },
      );
    }

    const body = validated.data;

    const {
      results: ragResults,
      source,
      retrievalMode,
      warnings,
      fallbacksUsed,
    } = await ragSearchService.search({
      query: body.query,
      userPreferences: body.userPreferences,
      filters: {
        serviceCategories: body.scope.jobType ? [body.scope.jobType] : undefined,
        location: body.scope.location || body.userPreferences.location,
        minRating: body.userPreferences.minRating,
        maxHourlyRate: body.userPreferences.budget,
      },
      limit: 50,
    });

    const rankedCandidates = rankingService.rankCandidates(
      ragResults,
      body.userPreferences
    );

    rankedCandidates.sort((a, b) => b.score - a.score);
    const top10 = rankedCandidates.slice(0, body.limit ?? 10);

    const llm = resolveLlmProvider();
    let selectionResult: SelectTop3Response | null = null;
    let selectionMeta = llm.meta;
    const searchWarnings =
      top10.length < 3
        ? [
            ...warnings,
            "Search returned fewer than 3 candidates, so shortlist selection was skipped.",
          ]
        : warnings;

    if (top10.length >= 3) {
      try {
        selectionResult = await selectTop3(
          top10,
          body.userPreferences,
          body.scope,
          { providerType: llm.providerType }
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown shortlist selection failure";

        if (llm.providerType !== "mock" && isMockLlmFallbackAllowed()) {
          selectionResult = await selectTop3(
            top10,
            body.userPreferences,
            body.scope,
            { providerType: "mock" }
          );
          selectionMeta = {
            mode: "degraded",
            llmProvider: "mock",
            fallbacksUsed: ["mock_llm"],
            warnings: [
              `Primary ${llm.providerType} shortlist selection failed: ${message}`,
              "Using mock LLM fallback for shortlist selection.",
            ],
          };
        } else {
          throw error;
        }
      }
    }

    const response: SearchAndSelectResponse = {
      searchResults: top10,
      selectionResult,
      meta: mergeExecutionMeta(
        {
          mode: fallbacksUsed.length > 0 || top10.length < 3 ? "degraded" : "live",
          llmProvider: "openai",
          dataSource: source,
          retrievalMode,
          fallbacksUsed,
          warnings: searchWarnings,
        },
        selectionMeta,
      ),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Search and select error:", error);

    const message = error instanceof Error ? error.message : "Internal server error";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
