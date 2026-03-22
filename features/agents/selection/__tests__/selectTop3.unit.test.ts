import { describe, expect, it, vi } from "vitest";
import { selectTop3 } from "../selectTop3";
import type { Candidate, UserPreferences, JobScope } from "../types";

vi.mock("../../reasoning/providers", () => ({
  createChatModel: vi.fn(() => ({
    withStructuredOutput: vi.fn(() => vi.fn()),
  })),
}));

const makeCandidates = (count: number): Candidate[] =>
  Array.from({ length: count }, (_, i) => ({
    agentId: `agent-${i}`,
    name: `Agent ${i}`,
    score: 0.9 - i * 0.1,
    relevance: 0.8,
    successCount: 100 - i * 10,
    rating: 4.5,
  }));

const prefs: UserPreferences = { priority: "cost" };
const scope: JobScope = { jobType: "plumbing", urgency: "asap" };

describe("selectTop3", () => {
  it("throws when fewer than 3 candidates", async () => {
    await expect(
      selectTop3(makeCandidates(2), prefs, scope, { providerType: "mock" }),
    ).rejects.toThrow("At least 3 candidates required for selection");
  });

  describe("mock provider path", () => {
    it("returns top 3 by score in deterministic order", async () => {
      const candidates = makeCandidates(5);
      const result = await selectTop3(candidates, prefs, scope, {
        providerType: "mock",
      });

      expect(result.top3).toHaveLength(3);
      expect(result.top3[0].candidate.agentId).toBe("agent-0");
      expect(result.top3[1].candidate.agentId).toBe("agent-1");
      expect(result.top3[2].candidate.agentId).toBe("agent-2");
    });

    it("includes reasoning that references priority", async () => {
      const result = await selectTop3(makeCandidates(4), prefs, scope, {
        providerType: "mock",
      });

      expect(result.top3[0].reasoning).toContain("cost priority");
    });

    it("includes match scores that decrease", async () => {
      const result = await selectTop3(makeCandidates(4), prefs, scope, {
        providerType: "mock",
      });

      expect(result.top3[0].matchScore).toBeGreaterThanOrEqual(
        result.top3[1].matchScore,
      );
      expect(result.top3[1].matchScore).toBeGreaterThanOrEqual(
        result.top3[2].matchScore,
      );
    });

    it("includes summary with job type", async () => {
      const result = await selectTop3(makeCandidates(4), prefs, scope, {
        providerType: "mock",
      });

      expect(result.summary).toContain("plumbing");
    });
  });
});
