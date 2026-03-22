import { beforeEach, describe, expect, it, vi } from "vitest";

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
import { executeSearchAndSelect } from "../executeSearchAndSelect";

const mockedSearch = vi.mocked(ragSearchService.search);
const mockedRank = vi.mocked(rankingService.rankCandidates);
const mockedSelectTop3 = vi.mocked(selectTop3);

const makeCandidates = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    agentId: `agent-${i}`,
    name: `Agent ${i}`,
    score: 0.9 - i * 0.05,
    relevance: 0.8,
    successCount: 100,
    rating: 4.5,
  }));

describe("executeSearchAndSelect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.stubEnv("OPENAI_API_KEY", "sk-test");
    vi.stubEnv("LLM_PROVIDER", "");
  });

  it("throws when provider is unconfigured", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    vi.stubEnv("OPENROUTER_API_KEY", "");

    const candidates = makeCandidates(5);
    mockedSearch.mockResolvedValueOnce({
      results: candidates,
      queryEmbedding: [0.1],
      totalFound: 5,
      source: "supabase",
      seeded: false,
      retrievalMode: "vector",
      warnings: [],
      fallbacksUsed: [],
    });
    mockedRank.mockReturnValueOnce(
      candidates.map((c) => ({ ...c, score: 0.8 })),
    );

    await expect(
      executeSearchAndSelect({
        query: "test",
        userPreferences: {},
        scope: { jobType: "plumbing", description: "Fix pipes" },
      }),
    ).rejects.toThrow("No live LLM provider is configured");
  });

  it("throws when provider is mock", async () => {
    const candidates = makeCandidates(5);
    mockedSearch.mockResolvedValueOnce({
      results: candidates,
      queryEmbedding: [0.1],
      totalFound: 5,
      source: "supabase",
      seeded: false,
      retrievalMode: "vector",
      warnings: [],
      fallbacksUsed: [],
    });
    mockedRank.mockReturnValueOnce(
      candidates.map((c) => ({ ...c, score: 0.8 })),
    );

    await expect(
      executeSearchAndSelect(
        {
          query: "test",
          userPreferences: {},
          scope: { jobType: "plumbing", description: "Fix pipes" },
        },
        { providerType: "mock" },
      ),
    ).rejects.toThrow("Mock shortlist fallback is disabled");
  });

  it("skips selectTop3 when fewer than 3 results", async () => {
    const candidates = makeCandidates(2);
    mockedSearch.mockResolvedValueOnce({
      results: candidates,
      queryEmbedding: [0.1],
      totalFound: 2,
      source: "supabase",
      seeded: false,
      retrievalMode: "vector",
      warnings: [],
      fallbacksUsed: [],
    });
    mockedRank.mockReturnValueOnce(
      candidates.map((c) => ({ ...c, score: 0.8 })),
    );

    const result = await executeSearchAndSelect({
      query: "test",
      userPreferences: {},
      scope: { jobType: "plumbing", description: "Fix pipes" },
    });

    expect(result.selectionResult).toBeNull();
    expect(mockedSelectTop3).not.toHaveBeenCalled();
    expect(result.meta.warnings).toContain(
      "Search returned fewer than 3 candidates, so shortlist selection was skipped.",
    );
  });

  it("runs full pipeline with selectTop3 when enough candidates", async () => {
    const candidates = makeCandidates(5);
    mockedSearch.mockResolvedValueOnce({
      results: candidates,
      queryEmbedding: [0.1],
      totalFound: 5,
      source: "supabase",
      seeded: false,
      retrievalMode: "vector",
      warnings: [],
      fallbacksUsed: [],
    });
    mockedRank.mockReturnValueOnce(
      candidates.map((c) => ({ ...c, score: 0.8 })),
    );
    mockedSelectTop3.mockResolvedValueOnce({
      top3: candidates.slice(0, 3).map((c) => ({
        candidate: c,
        reasoning: "Strong fit",
        matchScore: 85,
      })),
      summary: "Selected top 3",
      eliminationReasons: {},
    });

    const result = await executeSearchAndSelect({
      query: "test",
      userPreferences: {},
      scope: { jobType: "plumbing", description: "Fix pipes" },
    });

    expect(result.selectionResult).not.toBeNull();
    expect(result.selectionResult!.top3).toHaveLength(3);
    expect(result.meta.mode).toBe("live");
    expect(mockedSelectTop3).toHaveBeenCalledTimes(1);
  });
});
