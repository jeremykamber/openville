export type WorkflowReadiness = "live" | "degraded" | "unavailable";
export type WorkflowDataSource = "supabase" | "seed";
export type WorkflowRetrievalMode = "vector" | "keyword";
export type WorkflowLlmProvider = "openai" | "openrouter" | "mock" | "unconfigured";
export type WorkflowFallback = "seed_market" | "keyword_search" | "mock_llm";

export interface WorkflowExecutionMeta {
  mode: Exclude<WorkflowReadiness, "unavailable">;
  llmProvider: Exclude<WorkflowLlmProvider, "unconfigured">;
  fallbacksUsed: WorkflowFallback[];
  warnings: string[];
  dataSource?: WorkflowDataSource;
  retrievalMode?: WorkflowRetrievalMode;
}

export interface WorkflowStatusResponse {
  readiness: WorkflowReadiness;
  marketData: {
    source: WorkflowDataSource | "none";
    candidateCount: number;
    seeded: boolean;
    ready: boolean;
  };
  retrieval: {
    mode: WorkflowRetrievalMode;
    embeddingProvider: "openai" | "unconfigured";
    ready: boolean;
    fallbackAllowed: boolean;
  };
  llm: {
    provider: WorkflowLlmProvider;
    ready: boolean;
    fallbackAllowed: boolean;
  };
  warnings: string[];
}
