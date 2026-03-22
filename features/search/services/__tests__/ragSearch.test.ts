import { beforeEach, describe, expect, it, vi } from "vitest";
import { ragSearchService } from "../ragSearch";
import { marketCandidateRepository } from "../../repositories/SupabaseMarketCandidateRepository";
import { embeddingService } from "../embedding";

vi.mock("../../repositories/SupabaseMarketCandidateRepository", () => ({
  marketCandidateRepository: {
    listCandidates: vi.fn(),
  },
}));

vi.mock("../embedding", () => ({
  embeddingService: {
    generateEmbedding: vi.fn(),
  },
}));

const mockedListCandidates = vi.mocked(marketCandidateRepository.listCandidates);
const mockedGenerateEmbedding = vi.mocked(embeddingService.generateEmbedding);

const candidates = [
  {
    agentId: "agent-1",
    name: "Fast Pipes",
    score: 0,
    relevance: 0,
    successCount: 120,
    rating: 4.8,
    yearsOnPlatform: 4,
    location: "Austin",
    services: ["plumbing"],
    specialties: ["emergency plumbing"],
    hourlyRate: 180,
    description: "Emergency kitchen sink repairs",
    tags: ["fast", "reliable"],
    embedding: [0.92, 0.08, 0.05],
  },
  {
    agentId: "agent-2",
    name: "Capital Plumbing",
    score: 0,
    relevance: 0,
    successCount: 102,
    rating: 4.7,
    yearsOnPlatform: 5,
    location: "Austin",
    services: ["plumbing"],
    specialties: ["residential plumbing"],
    hourlyRate: 220,
    description: "Kitchen and bathroom plumbing",
    tags: ["local"],
    embedding: [0.65, 0.22, 0.11],
  },
  {
    agentId: "agent-3",
    name: "Austin Leak Patrol",
    score: 0,
    relevance: 0,
    successCount: 95,
    rating: 4.6,
    yearsOnPlatform: 3,
    location: "Austin",
    services: ["plumbing"],
    specialties: ["leak detection"],
    hourlyRate: 210,
    description: "Detect and repair leaks quickly",
    tags: ["same-day"],
    embedding: [0.3, 0.7, 0.25],
  },
];

describe("RAGSearchService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns vector-ranked results from Supabase candidates", async () => {
    mockedListCandidates.mockResolvedValueOnce({
      candidates,
      source: "supabase",
      seeded: false,
      warnings: [],
      fallbacksUsed: [],
    });
    mockedGenerateEmbedding.mockResolvedValueOnce({ embedding: [1, 0, 0] });

    const result = await ragSearchService.search({
      query: "fix gutters",
      limit: 2,
    });

    expect(result.retrievalMode).toBe("vector");
    expect(result.source).toBe("supabase");
    expect(result.seeded).toBe(false);
    expect(result.results).toHaveLength(2);
    expect(result.results[0].agentId).toBe("agent-1");
    expect(result.results[0].relevance).toBeGreaterThanOrEqual(result.results[1].relevance);
    expect(result.fallbacksUsed).toEqual([]);
  });

  it("applies filters without relaxing them when no candidates match", async () => {
    mockedListCandidates.mockResolvedValueOnce({
      candidates,
      source: "supabase",
      seeded: false,
      warnings: [],
      fallbacksUsed: [],
    });
    mockedGenerateEmbedding.mockResolvedValueOnce({ embedding: [1, 0, 0] });

    const result = await ragSearchService.search({
      query: "fix gutters",
      filters: { location: "Seattle" },
    });

    expect(result.results).toEqual([]);
    expect(result.totalFound).toBe(0);
    expect(result.warnings).toEqual([]);
  });

  it("throws when embeddings are unavailable instead of falling back to keywords", async () => {
    mockedListCandidates.mockResolvedValueOnce({
      candidates,
      source: "supabase",
      seeded: false,
      warnings: [],
      fallbacksUsed: [],
    });
    mockedGenerateEmbedding.mockResolvedValueOnce({
      embedding: null,
      reason: "unconfigured",
    });

    await expect(ragSearchService.search({ query: "fix gutters" })).rejects.toThrow(
      "Embedding provider is not configured.",
    );
  });
});
