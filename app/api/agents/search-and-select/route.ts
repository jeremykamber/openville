import { NextRequest, NextResponse } from "next/server";
import { ragSearchService } from "@/features/search/services/ragSearch";
import { rankingService } from "@/features/search/services/ranking";
import { selectTop3 } from "@/features/agents/selection/selectTop3";
import { UserPreferences, JobScope, SelectTop3Response } from "@/features/agents/selection/types";
import { SearchResult } from "@/features/search/types";

interface SearchAndSelectRequest {
  query: string;
  userPreferences: UserPreferences;
  scope: JobScope;
  limit?: number;
}

interface SearchAndSelectResponse {
  searchResults: SearchResult[];
  selectionResult: SelectTop3Response;
}

export async function POST(request: NextRequest) {
  try {
    const body: SearchAndSelectRequest = await request.json();

    if (!body.query || typeof body.query !== "string") {
      return NextResponse.json({ error: "Invalid query" }, { status: 400 });
    }

    if (!body.userPreferences) {
      return NextResponse.json(
        { error: "userPreferences is required" },
        { status: 400 }
      );
    }

    if (!body.scope) {
      return NextResponse.json({ error: "scope is required" }, { status: 400 });
    }

    const { results: ragResults } = await ragSearchService.search({
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
    const top10 = rankedCandidates.slice(0, 10);

    if (top10.length < 3) {
      return NextResponse.json(
        { error: "At least 3 candidates required for selection" },
        { status: 400 }
      );
    }

    const providerType = process.env.USE_MOCK_LLM === "true"
      ? "mock"
      : (process.env.LLM_PROVIDER === "openrouter" ? "openrouter" : "openai");

    const selectionResult = await selectTop3(
      top10,
      body.userPreferences,
      body.scope,
      { providerType }
    );

    const response: SearchAndSelectResponse = {
      searchResults: top10,
      selectionResult,
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
