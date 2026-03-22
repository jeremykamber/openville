import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/features/workflow/server/executeSearchAndSelect", () => ({
  executeSearchAndSelect: vi.fn(),
}));

vi.mock("@/features/agents/negotiation/runNegotiations", () => ({
  runNegotiations: vi.fn(),
}));

vi.mock("@/features/agents/selection/selectWinner", () => ({
  selectWinner: vi.fn(),
}));

import { runNegotiations } from "@/features/agents/negotiation/runNegotiations";
import { selectWinner } from "@/features/agents/selection/selectWinner";
import { executeSearchAndSelect } from "@/features/workflow/server/executeSearchAndSelect";
import { POST } from "../route";

const mockedExecuteSearchAndSelect = vi.mocked(executeSearchAndSelect);
const mockedRunNegotiations = vi.mocked(runNegotiations);
const mockedSelectWinner = vi.mocked(selectWinner);

const validBody = {
  query: "Need a plumber to fix a leaking kitchen sink today in Austin",
  userPreferences: {
    priority: "cost" as const,
    budget: 220,
    location: "Austin",
  },
  scope: {
    jobType: "plumbing",
    description: "Fix a leaking kitchen sink today",
    location: "Austin",
    urgency: "asap" as const,
  },
  buyerAgentId: "buyer-agent-openville",
  providerType: "openrouter" as const,
  maxRounds: 2,
};

const searchResponse = {
  searchResults: [
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
  ],
  selectionResult: {
    top3: [
      {
        candidate: {
          agentId: "agent-1",
          name: "Fast Pipes",
          score: 0.96,
          relevance: 0.91,
          successCount: 120,
          rating: 4.8,
          basePrice: 210,
        },
        reasoning: "Best price/speed balance.",
        matchScore: 92,
      },
      {
        candidate: {
          agentId: "agent-2",
          name: "Capital Plumbing",
          score: 0.92,
          relevance: 0.88,
          successCount: 102,
          rating: 4.7,
          basePrice: 205,
        },
        reasoning: "Strong local track record.",
        matchScore: 89,
      },
      {
        candidate: {
          agentId: "agent-3",
          name: "Austin Leak Patrol",
          score: 0.9,
          relevance: 0.86,
          successCount: 95,
          rating: 4.6,
          basePrice: 215,
        },
        reasoning: "Solid fallback candidate.",
        matchScore: 87,
      },
    ],
    summary: "Shortlist ready.",
  },
  meta: {
    mode: "live" as const,
    llmProvider: "mock" as const,
    fallbacksUsed: [],
    warnings: [],
    dataSource: "supabase" as const,
    retrievalMode: "vector" as const,
  },
};

describe("POST /api/workflow/run-all", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.stubEnv("LLM_PROVIDER", "openrouter");
    vi.stubEnv("OPENROUTER_API_KEY", "test-openrouter-key");
    vi.stubEnv("OPENROUTER_MODEL", "minimax/minimax-m2.5");
  });

  it("returns a completed composite payload", async () => {
    mockedExecuteSearchAndSelect.mockResolvedValueOnce(searchResponse);
    mockedRunNegotiations.mockResolvedValueOnce([
      {
        negotiationId: "neg-1",
        candidateId: "agent-1",
        status: "completed",
        summary: "Accepted proposal.",
        result: {
          id: "result-1",
          negotiationId: "neg-1",
          proposedBy: "buyer-agent-openville",
          status: "accepted",
          finalPrice: 210,
          createdAt: new Date("2026-03-14T12:00:00.000Z"),
        },
      },
    ]);
    mockedSelectWinner.mockResolvedValueOnce({
      winner: {
        candidateId: "agent-1",
        reasoning: "Best accepted outcome.",
        confidence: 0.78,
      },
      comparison: [
        {
          candidateId: "agent-1",
          strengths: ["accepted proposal"],
          weaknesses: [],
          priorityAlignment: 0.9,
        },
      ],
      summary: "Winner selected.",
    });

    const response = await POST(
      new NextRequest("http://localhost:3000/api/workflow/run-all", {
        method: "POST",
        body: JSON.stringify(validBody),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.completionState).toBe("completed");
    expect(payload.searchResults).toHaveLength(3);
    expect(payload.negotiationOutcomes).toHaveLength(1);
    expect(payload.winnerResult.winner.candidateId).toBe("agent-1");
    expect(payload.stageMeta.search).toEqual(searchResponse.meta);
    expect(payload.stageMeta.negotiation.llmProvider).toBe("openrouter");
    expect(payload.stageMeta.winner.llmProvider).toBe("openrouter");
    expect(payload.debug).toBeUndefined();
  });

  it("includes per-stage debug timings when requested", async () => {
    mockedExecuteSearchAndSelect.mockResolvedValueOnce(searchResponse);
    mockedRunNegotiations.mockResolvedValueOnce([
      {
        negotiationId: "neg-1",
        candidateId: "agent-1",
        status: "completed",
        summary: "Accepted proposal.",
        result: {
          id: "result-1",
          negotiationId: "neg-1",
          proposedBy: "buyer-agent-openville",
          status: "accepted",
          finalPrice: 210,
          createdAt: new Date("2026-03-14T12:00:00.000Z"),
        },
      },
    ]);
    mockedSelectWinner.mockResolvedValueOnce({
      winner: {
        candidateId: "agent-1",
        reasoning: "Best accepted outcome.",
        confidence: 0.78,
      },
      comparison: [
        {
          candidateId: "agent-1",
          strengths: ["accepted proposal"],
          weaknesses: [],
          priorityAlignment: 0.9,
        },
      ],
      summary: "Winner selected.",
    });

    const response = await POST(
      new NextRequest("http://localhost:3000/api/workflow/run-all", {
        method: "POST",
        headers: {
          "x-openville-debug": "timings",
        },
        body: JSON.stringify(validBody),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.debug.timingsMs.total).toBeGreaterThanOrEqual(0);
    expect(payload.debug.timingsMs.search).toBeGreaterThanOrEqual(0);
    expect(payload.debug.timingsMs.negotiation).toBeGreaterThanOrEqual(0);
    expect(payload.debug.timingsMs.winner).toBeGreaterThanOrEqual(0);
  });

  it("stops after search when no shortlist is available", async () => {
    mockedExecuteSearchAndSelect.mockResolvedValueOnce({
      ...searchResponse,
      selectionResult: null,
      meta: {
        ...searchResponse.meta,
        mode: "degraded",
        warnings: ["Search returned fewer than 3 candidates, so shortlist selection was skipped."],
      },
    });

    const response = await POST(
      new NextRequest("http://localhost:3000/api/workflow/run-all", {
        method: "POST",
        body: JSON.stringify(validBody),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.completionState).toBe("search_only");
    expect(payload.negotiationOutcomes).toEqual([]);
    expect(payload.winnerResult).toBeNull();
    expect(payload.debug).toBeUndefined();
    expect(mockedRunNegotiations).not.toHaveBeenCalled();
    expect(mockedSelectWinner).not.toHaveBeenCalled();
  });

  it("returns negotiation-only completion when no valid winner input remains", async () => {
    mockedExecuteSearchAndSelect.mockResolvedValueOnce(searchResponse);
    mockedRunNegotiations.mockResolvedValueOnce([
      {
        negotiationId: "",
        candidateId: "agent-1",
        status: "failed",
        summary: "Provider failed.",
      },
    ]);

    const response = await POST(
      new NextRequest("http://localhost:3000/api/workflow/run-all", {
        method: "POST",
        body: JSON.stringify(validBody),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.completionState).toBe("negotiation_only_no_winner");
    expect(payload.winnerResult).toBeNull();
    expect(payload.meta.warnings).toContain(
      "Negotiations completed, but no valid winner input remained for selection.",
    );
    expect(mockedSelectWinner).not.toHaveBeenCalled();
  });

  it("returns partial failure when winner selection fails without fallback", async () => {
    vi.stubEnv("ALLOW_MOCK_LLM_FALLBACK", "false");

    mockedExecuteSearchAndSelect.mockResolvedValueOnce(searchResponse);
    mockedRunNegotiations.mockResolvedValueOnce([
      {
        negotiationId: "neg-1",
        candidateId: "agent-1",
        status: "completed",
        summary: "Accepted proposal.",
        result: {
          id: "result-1",
          negotiationId: "neg-1",
          proposedBy: "buyer-agent-openville",
          status: "accepted",
          finalPrice: 210,
          createdAt: new Date("2026-03-14T12:00:00.000Z"),
        },
      },
    ]);
    mockedSelectWinner.mockRejectedValueOnce(new Error("winner timeout"));

    const response = await POST(
      new NextRequest("http://localhost:3000/api/workflow/run-all", {
        method: "POST",
        body: JSON.stringify(validBody),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.completionState).toBe("partial_failure");
    expect(payload.winnerResult).toBeNull();
    expect(payload.meta.warnings).toContain(
      "Winner selection failed: winner timeout",
    );
  });
});
