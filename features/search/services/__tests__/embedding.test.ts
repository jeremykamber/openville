import { beforeEach, describe, expect, it, vi } from "vitest";

const createMock = vi.fn();

vi.mock("openai", () => {
  return {
    default: class MockOpenAI {
      embeddings = { create: createMock };
    },
  };
});

import { EmbeddingService } from "../embedding";

describe("EmbeddingService", () => {
  let service: EmbeddingService;

  beforeEach(() => {
    service = new EmbeddingService();
    vi.unstubAllEnvs();
    createMock.mockReset();
  });

  describe("isConfigured", () => {
    it("returns false when no API keys are set", () => {
      vi.stubEnv("OPENAI_API_KEY", "");
      vi.stubEnv("OPENROUTER_API_KEY", "");
      expect(service.isConfigured()).toBe(false);
    });

    it("returns true when OPENAI_API_KEY is set", () => {
      vi.stubEnv("OPENAI_API_KEY", "sk-test");
      expect(service.isConfigured()).toBe(true);
    });

    it("returns true when OPENROUTER_API_KEY is set", () => {
      vi.stubEnv("OPENAI_API_KEY", "");
      vi.stubEnv("OPENROUTER_API_KEY", "sk-or-test");
      expect(service.isConfigured()).toBe(true);
    });
  });

  describe("generateEmbedding", () => {
    it("returns unconfigured when no API keys exist", async () => {
      vi.stubEnv("OPENAI_API_KEY", "");
      vi.stubEnv("OPENROUTER_API_KEY", "");
      const result = await service.generateEmbedding("test text");
      expect(result).toEqual({ embedding: null, reason: "unconfigured" });
    });

    it("returns embedding array on successful API call", async () => {
      vi.stubEnv("OPENAI_API_KEY", "sk-test");
      createMock.mockResolvedValueOnce({
        data: [{ embedding: [0.1, 0.2, 0.3] }],
      });

      const result = await service.generateEmbedding("test text");
      expect(result).toEqual({ embedding: [0.1, 0.2, 0.3] });
    });

    it("returns error when API throws", async () => {
      vi.stubEnv("OPENAI_API_KEY", "sk-test");
      createMock.mockRejectedValueOnce(new Error("API rate limit"));

      const result = await service.generateEmbedding("test text");
      expect(result).toEqual({
        embedding: null,
        reason: "error",
        message: "API rate limit",
      });
    });

    it("returns error when API returns no embedding", async () => {
      vi.stubEnv("OPENAI_API_KEY", "sk-test");
      createMock.mockResolvedValueOnce({ data: [{}] });

      const result = await service.generateEmbedding("test text");
      expect(result).toEqual({
        embedding: null,
        reason: "error",
        message: "No embedding returned from API",
      });
    });
  });
});
