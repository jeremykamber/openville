import { ProviderType } from "@/features/agents/reasoning/providers";
import {
  WorkflowExecutionMeta,
  WorkflowFallback,
  WorkflowLlmProvider,
  WorkflowReadiness,
  WorkflowStatusResponse,
} from "@/features/workflow/types";

export interface ResolvedLlmProvider {
  providerType: Exclude<ProviderType, "anthropic">;
  meta: Pick<WorkflowExecutionMeta, "mode" | "llmProvider" | "fallbacksUsed" | "warnings">;
}

export function isEmbeddingConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

export function getEmbeddingProviderLabel(): "openai" | "unconfigured" {
  return isEmbeddingConfigured() ? "openai" : "unconfigured";
}

export function isMockLlmFallbackAllowed(): boolean {
  return process.env.ALLOW_MOCK_LLM_FALLBACK !== "false";
}

export function getConfiguredLlmProvider(): WorkflowLlmProvider {
  const preferred = process.env.LLM_PROVIDER === "openrouter" ? "openrouter" : "openai";

  if (preferred === "openrouter" && process.env.OPENROUTER_API_KEY) {
    return "openrouter";
  }

  if (preferred === "openai" && process.env.OPENAI_API_KEY) {
    return "openai";
  }

  return "unconfigured";
}

export function resolveLlmProvider(
  requested?: "openai" | "openrouter" | "mock",
): ResolvedLlmProvider {
  if (requested === "mock") {
    return {
      providerType: "mock",
      meta: {
        mode: "degraded",
        llmProvider: "mock",
        fallbacksUsed: ["mock_llm"],
        warnings: ["Using explicit mock LLM fallback."],
      },
    };
  }

  const preferred = requested ?? (process.env.LLM_PROVIDER === "openrouter" ? "openrouter" : "openai");
  const hasPreferredKey =
    preferred === "openrouter"
      ? Boolean(process.env.OPENROUTER_API_KEY)
      : Boolean(process.env.OPENAI_API_KEY);

  if (hasPreferredKey) {
    return {
      providerType: preferred,
      meta: {
        mode: "live",
        llmProvider: preferred,
        fallbacksUsed: [],
        warnings: [],
      },
    };
  }

  if (!isMockLlmFallbackAllowed()) {
    throw new Error(`No configured ${preferred} provider and mock LLM fallback is disabled.`);
  }

  return {
    providerType: "mock",
    meta: {
      mode: "degraded",
      llmProvider: "mock",
      fallbacksUsed: ["mock_llm"],
      warnings: [
        `No configured ${preferred} provider was available. Using mock LLM fallback.`,
      ],
    },
  };
}

export function mergeExecutionMeta(
  ...parts: Array<Partial<WorkflowExecutionMeta>>
): WorkflowExecutionMeta {
  const fallbacks = new Set<WorkflowFallback>();
  const warnings = new Set<string>();

  let mode: WorkflowExecutionMeta["mode"] = "live";
  let llmProvider: WorkflowExecutionMeta["llmProvider"] = "mock";
  let dataSource: WorkflowExecutionMeta["dataSource"];
  let retrievalMode: WorkflowExecutionMeta["retrievalMode"];

  for (const part of parts) {
    if (part.mode === "degraded") {
      mode = "degraded";
    }

    if (part.llmProvider) {
      llmProvider = part.llmProvider;
    }

    if (part.dataSource) {
      dataSource = part.dataSource;
    }

    if (part.retrievalMode) {
      retrievalMode = part.retrievalMode;
    }

    for (const fallback of part.fallbacksUsed ?? []) {
      fallbacks.add(fallback);
    }

    for (const warning of part.warnings ?? []) {
      warnings.add(warning);
    }
  }

  return {
    mode,
    llmProvider,
    fallbacksUsed: [...fallbacks],
    warnings: [...warnings],
    dataSource,
    retrievalMode,
  };
}

export function buildWorkflowStatusResponse(input: {
  source: WorkflowStatusResponse["marketData"]["source"];
  candidateCount: number;
  seeded: boolean;
  marketWarnings?: string[];
}): WorkflowStatusResponse {
  const llmProvider = getConfiguredLlmProvider();
  const mockAllowed = isMockLlmFallbackAllowed();
  const embeddingProvider = getEmbeddingProviderLabel();
  const warnings = [...(input.marketWarnings ?? [])];

  const marketReady = input.candidateCount > 0;
  const llmReady = llmProvider !== "unconfigured";
  const retrievalReady = embeddingProvider !== "unconfigured";

  let readiness: WorkflowReadiness = "live";

  if (!marketReady) {
    readiness = "unavailable";
    warnings.push("No market candidates are available.");
  } else if (input.source !== "supabase" || !llmReady || !retrievalReady) {
    readiness = "degraded";
  }

  if (!llmReady && !mockAllowed) {
    readiness = "unavailable";
    warnings.push("No live LLM provider is configured and mock fallback is disabled.");
  } else if (!llmReady && mockAllowed) {
    warnings.push("No live LLM provider is configured. Mock fallback is available.");
  }

  if (!retrievalReady) {
    warnings.push("Embeddings are unavailable. Keyword retrieval fallback will be used.");
  }

  return {
    readiness,
    marketData: {
      source: input.source,
      candidateCount: input.candidateCount,
      seeded: input.seeded,
      ready: marketReady,
    },
    retrieval: {
      mode: retrievalReady ? "vector" : "keyword",
      embeddingProvider,
      ready: retrievalReady,
      fallbackAllowed: true,
    },
    llm: {
      provider: llmProvider === "unconfigured" && mockAllowed ? "mock" : llmProvider,
      ready: llmReady,
      fallbackAllowed: mockAllowed,
    },
    warnings,
  };
}
