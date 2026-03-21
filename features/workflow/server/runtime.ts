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
  meta: Pick<
    WorkflowExecutionMeta,
    "mode" | "llmProvider" | "model" | "fallbacksUsed" | "warnings"
  >;
}

type ExecutionMetaPart =
  | Partial<WorkflowExecutionMeta>
  | {
      mode?: WorkflowExecutionMeta["mode"];
      llmProvider?: WorkflowExecutionMeta["llmProvider"];
      model?: WorkflowExecutionMeta["model"];
      dataSource?: WorkflowExecutionMeta["dataSource"];
      retrievalMode?: WorkflowExecutionMeta["retrievalMode"];
      fallbacksUsed?: readonly WorkflowFallback[];
      warnings?: readonly string[];
    };

const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";
const DEFAULT_OPENROUTER_MODEL = "openai/gpt-4o-mini";

export function isEmbeddingConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY);
}

export function getEmbeddingProviderLabel(): "openai" | "openrouter" | "unconfigured" {
  if (process.env.OPENAI_API_KEY) {
    return "openai";
  }

  if (process.env.OPENROUTER_API_KEY) {
    return "openrouter";
  }

  return "unconfigured";
}

export function isMockLlmFallbackAllowed(): boolean {
  return process.env.ALLOW_MOCK_LLM_FALLBACK === "true";
}

export function isKeywordSearchFallbackAllowed(): boolean {
  return process.env.ALLOW_KEYWORD_SEARCH_FALLBACK === "true";
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

export function resolveConfiguredLlmModel(
  provider: Exclude<ProviderType, "anthropic" | "mock">,
): string {
  if (provider === "openrouter") {
    return process.env.OPENROUTER_MODEL ?? DEFAULT_OPENROUTER_MODEL;
  }

  return process.env.OPENAI_MODEL ?? DEFAULT_OPENAI_MODEL;
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
        model: resolveConfiguredLlmModel(preferred),
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
  ...parts: Array<ExecutionMetaPart | undefined>
): WorkflowExecutionMeta {
  const fallbacks = new Set<WorkflowFallback>();
  const warnings = new Set<string>();

  let mode: WorkflowExecutionMeta["mode"] = "live";
  let llmProvider: WorkflowExecutionMeta["llmProvider"] = "mock";
  let model: WorkflowExecutionMeta["model"];
  let dataSource: WorkflowExecutionMeta["dataSource"];
  let retrievalMode: WorkflowExecutionMeta["retrievalMode"];

  for (const part of parts) {
    if (!part) {
      continue;
    }

    if (part.mode === "degraded") {
      mode = "degraded";
    }

    if (part.llmProvider) {
      llmProvider = part.llmProvider;
    }

    if ("model" in part) {
      model = part.model;
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
    model,
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
    warnings.push("No live LLM provider is configured.");
  } else if (!llmReady && mockAllowed) {
    warnings.push("No live LLM provider is configured.");
  }

  if (!retrievalReady) {
    warnings.push("Embeddings are unavailable. Retrieval is disabled.");
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
      fallbackAllowed: false,
    },
    llm: {
      provider: llmProvider,
      ready: llmReady,
      fallbackAllowed: false,
    },
    warnings,
  };
}
