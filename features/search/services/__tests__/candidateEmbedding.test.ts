import { describe, expect, it } from "vitest";
import {
  buildCandidateEmbeddingInput,
  serializeEmbedding,
} from "../candidateEmbedding";

describe("buildCandidateEmbeddingInput", () => {
  it("joins all present fields with pipe separator", () => {
    const result = buildCandidateEmbeddingInput({
      name: "Fast Pipes",
      description: "Emergency plumbing",
      services: ["plumbing", "repairs"],
      specialties: ["emergency"],
      location: "Austin",
      tags: ["fast"],
      availability: "immediate",
      certifications: ["licensed"],
      responseTime: "30min",
    });

    expect(result).toBe(
      "Fast Pipes | Emergency plumbing | plumbing, repairs | emergency | Austin | fast | immediate | licensed | 30min",
    );
  });

  it("filters out blank and undefined fields", () => {
    const result = buildCandidateEmbeddingInput({
      name: "Test Agent",
      description: "",
      services: undefined,
      location: "   ",
    });

    expect(result).toBe("Test Agent");
  });

  it("returns empty string for empty candidate", () => {
    expect(buildCandidateEmbeddingInput({})).toBe("");
  });

  it("filters empty strings from arrays", () => {
    const result = buildCandidateEmbeddingInput({
      name: "Agent",
      services: ["plumbing", "", "electrical"],
    });

    expect(result).toBe("Agent | plumbing, electrical");
  });
});

describe("serializeEmbedding", () => {
  it("serializes number array to bracketed string", () => {
    expect(serializeEmbedding([0.1, 0.2, 0.3])).toBe("[0.1,0.2,0.3]");
  });

  it("handles empty array", () => {
    expect(serializeEmbedding([])).toBe("[]");
  });

  it("preserves precision", () => {
    expect(serializeEmbedding([0.123456789])).toBe("[0.123456789]");
  });
});
