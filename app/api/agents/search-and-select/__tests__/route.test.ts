import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { POST } from "../route";

describe("POST /api/agents/search-and-select", () => {
  it("returns a shortlist from the seeded fallback market for plumbing", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/agents/search-and-select",
      {
        method: "POST",
        body: JSON.stringify({
          query: "Need a plumber to fix a leaking kitchen sink today in Austin",
          userPreferences: {
            priority: "cost",
            location: "Austin",
          },
          scope: {
            jobType: "plumbing",
            description: "Fix a leaking kitchen sink today",
            location: "Austin",
            urgency: "asap",
          },
          limit: 10,
        }),
      },
    );

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.searchResults.length).toBeGreaterThanOrEqual(3);
    expect(payload.selectionResult).not.toBeNull();
    expect(payload.selectionResult.top3).toHaveLength(3);
    expect(payload.meta.mode).toBe("degraded");
    expect(payload.meta.fallbacksUsed).toContain("seed_market");
  });
});
