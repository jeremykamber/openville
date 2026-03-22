import { describe, expect, it, vi } from "vitest";
import { selectWinner } from "../selectWinner";
import type { UserPreferences } from "../types";
import type { NegotiationResult } from "../../negotiation/types/NegotiationResult";

vi.mock("../../reasoning/providers", () => ({
  createChatModel: vi.fn(() => ({
    withStructuredOutput: vi.fn(() => vi.fn()),
  })),
}));

const makeNegotiation = (
  id: string,
  status: "accepted" | "rejected" | "pending",
  price: number | null,
) => ({
  candidateId: id,
  result: {
    id: `result-${id}`,
    negotiationId: `neg-${id}`,
    proposedBy: "buyer",
    status,
    finalPrice: price,
    scopeDescription: "Full job",
    createdAt: new Date(),
  } as NegotiationResult,
});

const prefs: UserPreferences = { priority: "cost" };

describe("selectWinner", () => {
  it("throws when no negotiations provided", async () => {
    await expect(
      selectWinner([], prefs, { providerType: "mock" }),
    ).rejects.toThrow("At least one negotiation result required");
  });

  describe("mock provider path", () => {
    it("prefers accepted over rejected", async () => {
      const negotiations = [
        makeNegotiation("a", "rejected", 100),
        makeNegotiation("b", "accepted", 200),
      ];

      const result = await selectWinner(negotiations, prefs, {
        providerType: "mock",
      });

      expect(result.winner.candidateId).toBe("b");
    });

    it("picks lowest price when priority is cost", async () => {
      const negotiations = [
        makeNegotiation("a", "accepted", 300),
        makeNegotiation("b", "accepted", 150),
        makeNegotiation("c", "accepted", 250),
      ];

      const result = await selectWinner(negotiations, prefs, {
        providerType: "mock",
      });

      expect(result.winner.candidateId).toBe("b");
      expect(result.winner.reasoning).toContain("lowest accepted price");
    });

    it("picks highest price when priority is quality", async () => {
      const negotiations = [
        makeNegotiation("a", "accepted", 300),
        makeNegotiation("b", "accepted", 150),
      ];

      const result = await selectWinner(negotiations, { priority: "quality" }, {
        providerType: "mock",
      });

      expect(result.winner.candidateId).toBe("a");
    });

    it("returns comparison for all candidates", async () => {
      const negotiations = [
        makeNegotiation("a", "accepted", 200),
        makeNegotiation("b", "rejected", 100),
      ];

      const result = await selectWinner(negotiations, prefs, {
        providerType: "mock",
      });

      expect(result.comparison).toHaveLength(2);
      expect(result.comparison[0].strengths).toContain("accepted proposal");
      expect(result.comparison[1].weaknesses).toContain(
        "proposal not accepted",
      );
    });

    it("returns mock summary", async () => {
      const result = await selectWinner(
        [makeNegotiation("a", "accepted", 200)],
        prefs,
        { providerType: "mock" },
      );

      expect(result.summary).toContain("Mock fallback");
    });
  });
});
