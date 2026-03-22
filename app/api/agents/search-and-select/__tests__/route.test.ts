import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/features/search/services/ragSearch", () => ({
  ragSearchService: {
    search: vi.fn(),
  },
}));

vi.mock("@/features/search/services/ranking", () => ({
  rankingService: {
    rankCandidates: vi.fn(),
  },
}));

vi.mock("@/features/agents/selection/selectTop3", () => ({
  selectTop3: vi.fn(),
}));

import { ragSearchService } from "@/features/search/services/ragSearch";
import { rankingService } from "@/features/search/services/ranking";
import { selectTop3 } from "@/features/agents/selection/selectTop3";
import { POST } from "../route";

const mockedSearch = vi.mocked(ragSearchService.search);
const mockedRankCandidates = vi.mocked(rankingService.rankCandidates);
const mockedSelectTop3 = vi.mocked(selectTop3);

const requestBody = {
  query: "Need a plumber to fix a leaking kitchen sink today in Austin",
  userPreferences: {
    priority: "cost" as const,
    location: "Austin",
  },
  scope: {
    jobType: "plumbing",
    description: "Fix a leaking kitchen sink today",
    location: "Austin",
    urgency: "asap" as const,
  },
  limit: 10,
};

const rankedCandidates = [
  {
    agentId: "agent-1",
    name: "Fast Pipes",
    score: 0.96,
    relevance: 0.91,
    successCount: 120,
    rating: 4.8,
  },
  {
    agentId: "agent-2",
    name: "Capital Plumbing",
    score: 0.92,
    relevance: 0.88,
    successCount: 102,
    rating: 4.7,
  },
  {
    agentId: "agent-3",
    name: "Austin Leak Patrol",
    score: 0.9,
    relevance: 0.86,
    successCount: 95,
    rating: 4.6,
  },
];

describe("POST /api/agents/search-and-select", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("returns corrected live provider metadata with the resolved model", async () => {
    vi.stubEnv("LLM_PROVIDER", "openrouter");
    vi.stubEnv("OPENROUTER_API_KEY", "test-openrouter-key");
    vi.stubEnv("OPENROUTER_MODEL", "minimax/minimax-m2.5");

    mockedSearch.mockResolvedValueOnce({
      results: rankedCandidates,
      queryEmbedding: null,
      totalFound: rankedCandidates.length,
      source: "supabase",
      seeded: false,
      retrievalMode: "vector",
      warnings: [],
      fallbacksUsed: [],
    });
    mockedRankCandidates.mockReturnValueOnce(rankedCandidates);
    mockedSelectTop3.mockResolvedValueOnce({
      top3: rankedCandidates.map((candidate, index) => ({
        candidate,
        reasoning: `Reason ${index + 1}`,
        matchScore: 90 - index,
      })),
      summary: "Shortlist created.",
    });

    const response = await POST(
      new NextRequest("http://localhost:3000/api/agents/search-and-select", {
        method: "POST",
        body: JSON.stringify(requestBody),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.meta.mode).toBe("live");
    expect(payload.meta.llmProvider).toBe("openrouter");
    expect(payload.meta.model).toBe("minimax/minimax-m2.5");
    expect(payload.selectionResult.top3).toHaveLength(3);
  });

  it("returns a failure when shortlist selection errors instead of falling back", async () => {
    vi.stubEnv("LLM_PROVIDER", "openrouter");
    vi.stubEnv("OPENROUTER_API_KEY", "test-openrouter-key");

    mockedSearch.mockResolvedValueOnce({
      results: rankedCandidates,
      queryEmbedding: null,
      totalFound: rankedCandidates.length,
      source: "seed",
      seeded: true,
      retrievalMode: "keyword",
      warnings: ["Using keyword retrieval fallback."],
      fallbacksUsed: ["seed_market", "keyword_search"],
    });
    mockedRankCandidates.mockReturnValueOnce(rankedCandidates);
    mockedSelectTop3
      .mockRejectedValueOnce(new Error("provider timeout"))
      .mockResolvedValueOnce({
        top3: rankedCandidates.map((candidate, index) => ({
          candidate,
          reasoning: `Fallback reason ${index + 1}`,
          matchScore: 88 - index,
        })),
        summary: "Fallback shortlist created.",
      });

    const response = await POST(
      new NextRequest("http://localhost:3000/api/agents/search-and-select", {
        method: "POST",
        body: JSON.stringify(requestBody),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toBe("provider timeout");
  });

  it("returns 400 for an invalid workflow request", async () => {
    const response = await POST(
      new NextRequest("http://localhost:3000/api/agents/search-and-select", {
        method: "POST",
        body: JSON.stringify({ query: "" }),
      }),
    );

    expect(response.status).toBe(400);
  });
});
