import type {
  Candidate as WorkflowCandidate,
  UserPreferences as WorkflowUserPreferences,
} from "@/features/agents/selection/types";

/* INPUT TYPES */
export type UserPreferences = WorkflowUserPreferences;

export interface SearchRequest {
    query: string;
    userPreferences?: UserPreferences;
    filters?: SearchFilters;
    limit?: number;
}

export interface SearchFilters {
    serviceCategories?: string[];
    minRating?: number;
    minSuccessCount?: number;
    maxHourlyRate?: number;
    location?: string;
}

/* OUTPUT TYPES - canonical candidate shape shared with selection */
export type SearchResult = WorkflowCandidate;

export interface SearchResponse {
    candidates: SearchResult[];
    totalFound: number;
    query: string;
    rankingWeights: RankingWeights;
    meta?: {
      mode: 'live' | 'degraded';
      llmProvider: 'openai' | 'openrouter' | 'mock';
      fallbacksUsed: string[];
      warnings: string[];
      dataSource?: 'supabase' | 'seed';
      retrievalMode?: 'vector' | 'keyword';
    };
}

export interface RankingWeights {
    relevance: number;
    successCount: number;
    rating: number;
    timeOnPlatform: number;
}
