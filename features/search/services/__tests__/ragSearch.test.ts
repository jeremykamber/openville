import { beforeEach, describe, expect, it, vi } from "vitest";
import { ragSearchService } from "../ragSearch";
import { marketCandidateRepository } from "../../repositories/SupabaseMarketCandidateRepository";
import { embeddingService } from "../embedding";

vi.mock("../../repositories/SupabaseMarketCandidateRepository", () => ({
  marketCandidateRepository: {
    searchByVector: vi.fn(),
  },
}));

vi.mock("../embedding", () => ({
  embeddingService: {
    generateEmbedding: vi.fn(),
  },
}));

const mockedSearchByVector = vi.mocked(marketCandidateRepository.searchByVector);
const mockedGenerateEmbedding = vi.mocked(embeddingService.generateEmbedding);

const candidates = [
  {
    agentId: "agent-1",
    name: "Fast Pipes",
    score: 0,
    relevance: 0.92,
    successCount: 120,
    rating: 4.8,
    yearsOnPlatform: 4,
    location: "Austin",
    services: ["plumbing"],
    specialties: ["emergency plumbing"],
    hourlyRate: 180,
    description: "Emergency kitchen sink repairs",
    tags: ["fast", "reliable"],
  },
  {
    agentId: "agent-2",
    name: "Capital Plumbing",
    score: 0,
    relevance: 0.65,
    successCount: 102,
    rating: 4.7,
    yearsOnPlatform: 5,
    location: "Austin",
    services: ["plumbing"],
    specialties: ["residential plumbing"],
    hourlyRate: 220,
    description: "Kitchen and bathroom plumbing",
    tags: ["local"],
  },
  {
    agentId: "agent-3",
    name: "Austin Leak Patrol",
    score: 0,
    relevance: 0.30,
    successCount: 95,
    rating: 4.6,
    yearsOnPlatform: 3,
    location: "Austin",
    services: ["plumbing"],
    specialties: ["leak detection"],
    hourlyRate: 210,
    description: "Detect and repair leaks quickly",
    tags: ["same-day"],
  },
];

describe("RAGSearchService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns vector-ranked results from pgvector search", async () => {
    mockedSearchByVector.mockResolvedValueOnce({
      candidates: candidates.slice(0, 2),
      source: "supabase",
      totalFound: 2,
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
    expect(mockedSearchByVector).toHaveBeenCalledWith([1, 0, 0], 2, undefined);
  });

  it("passes filters to searchByVector and applies service category filter in JS", async () => {
    mockedSearchByVector.mockResolvedValueOnce({
      candidates,
      source: "supabase",
      totalFound: 3,
    });
    mockedGenerateEmbedding.mockResolvedValueOnce({ embedding: [1, 0, 0] });

    const result = await ragSearchService.search({
      query: "fix gutters",
      filters: { location: "Austin", serviceCategories: ["plumbing"] },
    });

    expect(mockedSearchByVector).toHaveBeenCalledWith(
      [1, 0, 0],
      50,
      { location: "Austin", serviceCategories: ["plumbing"] },
    );
    expect(result.results).toHaveLength(3);
  });

  it("filters out candidates that don't match service categories", async () => {
    const mixed = [
      ...candidates,
      {
        agentId: "agent-4",
        name: "Sparky Electric",
        score: 0,
        relevance: 0.80,
        services: ["electrical"],
        specialties: ["wiring"],
      },
    ];
    mockedSearchByVector.mockResolvedValueOnce({
      candidates: mixed,
      source: "supabase",
      totalFound: 4,
    });
    mockedGenerateEmbedding.mockResolvedValueOnce({ embedding: [1, 0, 0] });

    const result = await ragSearchService.search({
      query: "fix gutters",
      filters: { serviceCategories: ["plumbing"] },
    });

    expect(result.results).toHaveLength(3);
    expect(result.results.every((r) => r.services?.includes("plumbing"))).toBe(true);
  });

  it("returns empty when searchByVector returns no results", async () => {
    mockedSearchByVector.mockResolvedValueOnce({
      candidates: [],
      source: "supabase",
      totalFound: 0,
    });
    mockedGenerateEmbedding.mockResolvedValueOnce({ embedding: [1, 0, 0] });

    const result = await ragSearchService.search({
      query: "fix gutters",
      filters: { location: "Seattle" },
    });

    expect(result.results).toEqual([]);
    expect(result.totalFound).toBe(0);
  });

  it("throws when embeddings are unavailable", async () => {
    mockedGenerateEmbedding.mockResolvedValueOnce({
      embedding: null,
      reason: "unconfigured",
    });

    await expect(ragSearchService.search({ query: "fix gutters" })).rejects.toThrow(
      "Embedding provider is not configured.",
    );
    expect(mockedSearchByVector).not.toHaveBeenCalled();
  });
});
