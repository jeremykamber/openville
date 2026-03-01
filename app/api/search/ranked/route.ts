import { NextRequest, NextResponse } from "next/server";
import {
  SearchResponse,
  SearchResult,
} from "@/features/search/types";
import { SearchRequestSchema } from "@/features/shared/schemas/WorkflowSchemas";
import { ragSearchService } from "@/features/search/services/ragSearch";
import { rankingService } from "@/features/search/services/ranking";
import { getConfiguredLlmProvider } from "@/features/workflow/server/runtime";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    const validated = SearchRequestSchema.safeParse(rawBody);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid search request", details: validated.error.format() },
        { status: 400 },
      );
    }

    const body = validated.data;

    const limit = Math.max(1, Math.min(body.limit ?? 10, 50));
    const {
      results: ragResults,
      totalFound,
      source,
      retrievalMode,
      warnings,
      fallbacksUsed,
    } = await ragSearchService.search({
      query: body.query,
      userPreferences: body.userPreferences,
      filters: body.filters,
      limit: 50,
    });

    const candidates: SearchResult[] = ragResults.map((tradesPerson) => ({
      ...tradesPerson,
      embedding: undefined,
    }));

    const rankedCandidates = await rankingService.rankCandidates(
      candidates,
      body.userPreferences
    );

    rankedCandidates.sort((a, b) => b.score - a.score);
    const configuredLlmProvider = getConfiguredLlmProvider();

    const response: SearchResponse = {
      candidates: rankedCandidates.slice(0, limit),
      totalFound,
      query: body.query,
      rankingWeights: {
        relevance: 0.4,
        successCount: 0.2,
        rating: 0.2,
        timeOnPlatform: 0.1,
      },
      meta: {
        mode: fallbacksUsed.length > 0 ? "degraded" : "live",
        dataSource: source,
        retrievalMode,
        llmProvider:
          configuredLlmProvider === "unconfigured"
            ? "mock"
            : configuredLlmProvider,
        fallbacksUsed,
        warnings,
      },
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
