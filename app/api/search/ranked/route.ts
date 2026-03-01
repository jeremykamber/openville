import { NextRequest, NextResponse } from "next/server";
import {
  SearchRequest,
  SearchResponse,
  SearchResult,
} from "@/features/search/types";
import { ragSearchService } from "@/features/search/services/ragSearch";
import { rankingService } from "@/features/search/services/ranking";

export async function POST(request: NextRequest) {
  try {
    const body: SearchRequest = await request.json();

    if (!body.query || typeof body.query !== "string") {
      return NextResponse.json({ error: "Invalid query" }, { status: 400 });
    }

    const limit = Math.min(body.limit || 10, 50);
    const { results: ragResults } = await ragSearchService.search({
      query: body.query,
      userPreferences: body.userPreferences,
      filters: body.filters,
      limit: 50,
    });

    const candidates: SearchResult[] = ragResults.map((person) => {
      const { embedding, ...rest } = person;
      return rest;
    });

    const rankedCandidates = await rankingService.rankCandidates(
      candidates,
      body.userPreferences
    );

    rankedCandidates.sort((a, b) => b.score - a.score);
    const response: SearchResponse = {
      candidates: rankedCandidates.slice(0, limit),
      totalFound: ragResults.length,
      query: body.query,
      rankingWeights: {
        relevance: 0.4,
        successCount: 0.2,
        rating: 0.2,
        timeOnPlatform: 0.1,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
