import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  isEmbeddingConfigured,
  getEmbeddingProviderLabel,
  isMockLlmFallbackAllowed,
  isKeywordSearchFallbackAllowed,
  getConfiguredLlmProvider,
  resolveConfiguredLlmModel,
  resolveLlmProvider,
  mergeExecutionMeta,
  buildWorkflowStatusResponse,
} from "../runtime";

describe("runtime", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  describe("isEmbeddingConfigured", () => {
    it("returns false with no keys", () => {
      vi.stubEnv("OPENAI_API_KEY", "");
      vi.stubEnv("OPENROUTER_API_KEY", "");
      expect(isEmbeddingConfigured()).toBe(false);
    });

    it("returns true with OpenAI key", () => {
      vi.stubEnv("OPENAI_API_KEY", "sk-test");
      expect(isEmbeddingConfigured()).toBe(true);
    });
  });

  describe("getEmbeddingProviderLabel", () => {
    it("returns openai when OpenAI key set", () => {
      vi.stubEnv("OPENAI_API_KEY", "sk-test");
      expect(getEmbeddingProviderLabel()).toBe("openai");
    });

    it("returns openrouter when only OpenRouter key set", () => {
      vi.stubEnv("OPENAI_API_KEY", "");
      vi.stubEnv("OPENROUTER_API_KEY", "sk-or-test");
      expect(getEmbeddingProviderLabel()).toBe("openrouter");
    });

    it("returns unconfigured with no keys", () => {
      vi.stubEnv("OPENAI_API_KEY", "");
      vi.stubEnv("OPENROUTER_API_KEY", "");
      expect(getEmbeddingProviderLabel()).toBe("unconfigured");
    });
  });

  describe("isMockLlmFallbackAllowed", () => {
    it("returns true when env is 'true'", () => {
      vi.stubEnv("ALLOW_MOCK_LLM_FALLBACK", "true");
      expect(isMockLlmFallbackAllowed()).toBe(true);
    });

    it("returns false otherwise", () => {
      vi.stubEnv("ALLOW_MOCK_LLM_FALLBACK", "");
      expect(isMockLlmFallbackAllowed()).toBe(false);
    });
  });

  describe("isKeywordSearchFallbackAllowed", () => {
    it("returns true when env is 'true'", () => {
      vi.stubEnv("ALLOW_KEYWORD_SEARCH_FALLBACK", "true");
      expect(isKeywordSearchFallbackAllowed()).toBe(true);
    });
  });

  describe("getConfiguredLlmProvider", () => {
    it("returns openai when preferred and key present", () => {
      vi.stubEnv("LLM_PROVIDER", "");
      vi.stubEnv("OPENAI_API_KEY", "sk-test");
      expect(getConfiguredLlmProvider()).toBe("openai");
    });

    it("returns openrouter when preferred and key present", () => {
      vi.stubEnv("LLM_PROVIDER", "openrouter");
      vi.stubEnv("OPENROUTER_API_KEY", "sk-or-test");
      expect(getConfiguredLlmProvider()).toBe("openrouter");
    });

    it("returns unconfigured when no key matches preference", () => {
      vi.stubEnv("LLM_PROVIDER", "openrouter");
      vi.stubEnv("OPENROUTER_API_KEY", "");
      vi.stubEnv("OPENAI_API_KEY", "");
      expect(getConfiguredLlmProvider()).toBe("unconfigured");
    });
  });

  describe("resolveConfiguredLlmModel", () => {
    it("returns default OpenAI model", () => {
      const original = process.env.OPENAI_MODEL;
      try {
        delete process.env.OPENAI_MODEL;
        expect(resolveConfiguredLlmModel("openai")).toBe("gpt-4o-mini");
      } finally {
        if (original !== undefined) {
          process.env.OPENAI_MODEL = original;
        }
      }
    });

    it("returns custom OpenRouter model from env", () => {
      vi.stubEnv("OPENROUTER_MODEL", "anthropic/claude-3-haiku");
      expect(resolveConfiguredLlmModel("openrouter")).toBe(
        "anthropic/claude-3-haiku",
      );
    });
  });

  describe("resolveLlmProvider", () => {
    it("returns mock provider when explicitly requested", () => {
      const result = resolveLlmProvider("mock");
      expect(result.providerType).toBe("mock");
      expect(result.meta.mode).toBe("degraded");
      expect(result.meta.fallbacksUsed).toContain("mock_llm");
    });

    it("returns live provider when key is available", () => {
      vi.stubEnv("OPENAI_API_KEY", "sk-test");
      const result = resolveLlmProvider("openai");
      expect(result.providerType).toBe("openai");
      expect(result.meta.mode).toBe("live");
    });

    it("throws when no key and mock not allowed", () => {
      vi.stubEnv("OPENAI_API_KEY", "");
      vi.stubEnv("ALLOW_MOCK_LLM_FALLBACK", "");
      expect(() => resolveLlmProvider("openai")).toThrow(
        "No configured openai provider and mock LLM fallback is disabled.",
      );
    });

    it("falls back to mock when allowed", () => {
      vi.stubEnv("OPENAI_API_KEY", "");
      vi.stubEnv("ALLOW_MOCK_LLM_FALLBACK", "true");
      const result = resolveLlmProvider("openai");
      expect(result.providerType).toBe("mock");
      expect(result.meta.mode).toBe("degraded");
    });
  });

  describe("mergeExecutionMeta", () => {
    it("merges two parts and deduplicates", () => {
      const result = mergeExecutionMeta(
        {
          mode: "live",
          llmProvider: "openai",
          fallbacksUsed: ["mock_llm"],
          warnings: ["warn1"],
        },
        {
          mode: "degraded",
          llmProvider: "openai",
          fallbacksUsed: ["mock_llm"],
          warnings: ["warn1", "warn2"],
        },
      );

      expect(result.mode).toBe("degraded");
      expect(result.fallbacksUsed).toEqual(["mock_llm"]);
      expect(result.warnings).toEqual(["warn1", "warn2"]);
    });

    it("skips undefined parts", () => {
      const result = mergeExecutionMeta(undefined, {
        mode: "live",
        llmProvider: "openai",
        fallbacksUsed: [],
        warnings: [],
      });

      expect(result.mode).toBe("live");
      expect(result.llmProvider).toBe("openai");
    });

    it("promotes to degraded if any part is degraded", () => {
      const result = mergeExecutionMeta(
        { mode: "live" },
        { mode: "live" },
        { mode: "degraded" },
      );

      expect(result.mode).toBe("degraded");
    });
  });

  describe("buildWorkflowStatusResponse", () => {
    it("returns live when everything is configured", () => {
      vi.stubEnv("OPENAI_API_KEY", "sk-test");
      vi.stubEnv("LLM_PROVIDER", "");

      const result = buildWorkflowStatusResponse({
        source: "supabase",
        candidateCount: 10,
        seeded: false,
      });

      expect(result.readiness).toBe("live");
      expect(result.warnings).toEqual([]);
    });

    it("returns unavailable when no candidates", () => {
      vi.stubEnv("OPENAI_API_KEY", "sk-test");

      const result = buildWorkflowStatusResponse({
        source: "supabase",
        candidateCount: 0,
        seeded: false,
      });

      expect(result.readiness).toBe("unavailable");
      expect(result.warnings).toContain(
        "No market candidates are available.",
      );
    });

    it("returns unavailable when no LLM and mock not allowed", () => {
      vi.stubEnv("OPENAI_API_KEY", "");
      vi.stubEnv("OPENROUTER_API_KEY", "");
      vi.stubEnv("ALLOW_MOCK_LLM_FALLBACK", "");

      const result = buildWorkflowStatusResponse({
        source: "supabase",
        candidateCount: 10,
        seeded: false,
      });

      expect(result.readiness).toBe("unavailable");
      expect(result.warnings).toContain(
        "No live LLM provider is configured.",
      );
    });

    it("returns degraded when source is not supabase", () => {
      vi.stubEnv("OPENAI_API_KEY", "sk-test");

      const result = buildWorkflowStatusResponse({
        source: "seed",
        candidateCount: 10,
        seeded: true,
      });

      expect(result.readiness).toBe("degraded");
    });
  });
});
