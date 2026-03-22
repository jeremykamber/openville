import { beforeEach, describe, expect, it, vi } from "vitest";

const { fromMock, updateChain } = vi.hoisted(() => ({
  fromMock: vi.fn(),
  updateChain: {
    eq: vi.fn(),
  },
}));

vi.mock("@/lib/supabase/server", () => ({
  supabaseAdmin: {
    from: fromMock,
  },
}));

vi.mock("@/features/search/services/embedding", () => ({
  embeddingService: {
    generateEmbedding: vi.fn(),
  },
}));

import { embeddingService } from "@/features/search/services/embedding";
import { SupabaseMarketCandidateRepository } from "../SupabaseMarketCandidateRepository";

const mockedGenerateEmbedding = vi.mocked(embeddingService.generateEmbedding);

describe("SupabaseMarketCandidateRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updateChain.eq.mockReset();
    fromMock.mockImplementation((table: string) => {
      if (table !== "market_candidates") {
        throw new Error(`Unexpected table: ${table}`);
      }

      return {
        select: vi.fn(),
        update: vi.fn(),
      };
    });
  });

  it("backfills missing embeddings before returning candidates", async () => {
    const selectMock = vi.fn().mockResolvedValue({
      data: [
        {
          agent_id: "agent-1",
          name: "Fast Pipes",
          description: "Emergency kitchen sink repairs",
          services: ["plumbing"],
          specialties: ["emergency plumbing"],
          location: "Austin",
          hourly_rate: 180,
          base_price: 225,
          success_count: 120,
          rating: 4.8,
          years_on_platform: 4,
          years_experience: 8,
          availability: "any",
          certifications: ["licensed"],
          response_time: "30 min",
          tags: ["fast"],
          embedding: null,
        },
      ],
      error: null,
    });
    const updateMock = vi.fn(() => updateChain);
    updateChain.eq.mockResolvedValue({ error: null });

    fromMock.mockReturnValue({
      select: selectMock,
      update: updateMock,
    });
    mockedGenerateEmbedding.mockResolvedValueOnce({ embedding: [0.1, 0.2, 0.3] });

    const repository = new SupabaseMarketCandidateRepository();
    const result = await repository.listCandidates();

    expect(mockedGenerateEmbedding).toHaveBeenCalledTimes(1);
    expect(updateMock).toHaveBeenCalledWith({ embedding: "[0.1,0.2,0.3]" });
    expect(updateChain.eq).toHaveBeenCalledWith("agent_id", "agent-1");
    expect(result.candidates[0].embedding).toEqual([0.1, 0.2, 0.3]);
  });

  it("throws a clear error when an existing row is missing embeddings and repair cannot run", async () => {
    const selectMock = vi.fn().mockResolvedValue({
      data: [
        {
          agent_id: "agent-1",
          name: "Fast Pipes",
          description: "Emergency kitchen sink repairs",
          services: ["plumbing"],
          embedding: null,
        },
      ],
      error: null,
    });

    fromMock.mockReturnValue({
      select: selectMock,
      update: vi.fn(() => updateChain),
    });
    mockedGenerateEmbedding.mockResolvedValueOnce({
      embedding: null,
      reason: "unconfigured",
    });

    const repository = new SupabaseMarketCandidateRepository();

    await expect(repository.listCandidates()).rejects.toThrow(
      "Market candidate agent-1 is missing a stored embedding and automatic repair failed. Embedding provider is not configured.",
    );
  });
});
