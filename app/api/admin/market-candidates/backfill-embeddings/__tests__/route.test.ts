import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/search/repositories/SupabaseMarketCandidateRepository", () => ({
  marketCandidateRepository: {
    syncMissingEmbeddings: vi.fn(),
  },
}));

import { marketCandidateRepository } from "@/features/search/repositories/SupabaseMarketCandidateRepository";
import { POST } from "../route";

const mockedSyncMissingEmbeddings = vi.mocked(
  marketCandidateRepository.syncMissingEmbeddings,
);

const ADMIN_TOKEN = "test-admin-token";

function makeRequest(): NextRequest {
  return new NextRequest("http://localhost/api/admin/market-candidates/backfill-embeddings", {
    method: "POST",
    headers: { "x-admin-token": ADMIN_TOKEN },
  });
}

describe("POST /api/admin/market-candidates/backfill-embeddings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.MARKET_ADMIN_TOKEN = ADMIN_TOKEN;
  });

  it("returns 401 without a valid admin token", async () => {
    const request = new NextRequest("http://localhost/api/admin/market-candidates/backfill-embeddings", {
      method: "POST",
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it("returns repaired candidate counts", async () => {
    mockedSyncMissingEmbeddings.mockResolvedValueOnce({
      repairedCount: 7,
      candidateCount: 42,
    });

    const response = await POST(makeRequest());
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      success: true,
      repairedCount: 7,
      candidateCount: 42,
    });
  });

  it("returns a JSON error when the sync fails", async () => {
    mockedSyncMissingEmbeddings.mockRejectedValueOnce(
      new Error("Embedding provider is not configured."),
    );

    const response = await POST(makeRequest());
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload).toEqual({
      error: "Embedding provider is not configured.",
    });
  });
});
