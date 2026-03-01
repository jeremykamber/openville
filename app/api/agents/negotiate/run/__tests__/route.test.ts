import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { POST } from "../route";

const candidateA = {
  candidate: {
    agentId: "agent_011",
    name: "Drain Doctor Dispatch",
    score: 0.93,
    relevance: 0.88,
    successCount: 141,
    rating: 4.7,
    basePrice: 210,
    hourlyRate: 105,
  },
  reasoning: "Strong same-day fit for sink repair.",
  matchScore: 91,
};

const candidateB = {
  candidate: {
    agentId: "agent_012",
    name: "Blue Pipe Response",
    score: 0.9,
    relevance: 0.85,
    successCount: 116,
    rating: 4.6,
    basePrice: 195,
    hourlyRate: 98,
  },
  reasoning: "Competitive cost profile.",
  matchScore: 88,
};

const candidateC = {
  candidate: {
    agentId: "agent_013",
    name: "Capital City Plumbing Co.",
    score: 0.95,
    relevance: 0.9,
    successCount: 188,
    rating: 4.9,
    basePrice: 240,
    hourlyRate: 112,
  },
  reasoning: "Highest trust and track record.",
  matchScore: 94,
};

describe("POST /api/agents/negotiate/run", () => {
  it("runs negotiations with in-memory persistence when Supabase admin is unavailable", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/agents/negotiate/run",
      {
        method: "POST",
        body: JSON.stringify({
          buyerAgentId: "buyer-agent-openville",
          candidates: [candidateA, candidateB, candidateC],
          preferences: {
            priority: "cost",
            budget: 215,
          },
          scope: {
            jobType: "plumbing",
            description: "Fix a leaking kitchen sink today",
            location: "Austin",
            urgency: "asap",
          },
          providerType: "mock",
          maxRounds: 2,
        }),
      },
    );

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.outcomes).toHaveLength(3);
    expect(payload.outcomes.every((outcome: { result?: { status: string } }) => outcome.result?.status === "accepted")).toBe(true);
    expect(payload.meta.mode).toBe("degraded");
    expect(payload.meta.llmProvider).toBe("mock");
    expect(payload.meta.warnings).toContain(
      "Supabase admin is not configured. Using in-memory negotiation persistence fallback.",
    );
  });
});
