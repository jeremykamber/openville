import type { Candidate } from "./Candidate";
import type { UserPreferences } from "./UserPreferences";
import type { ChatMessage } from "./ChatMessage";

/* ═══════════════════════════════════════════════════════════════════════════
   Search Pipeline Contracts
   Aligned with dev branch: features/search/types/index.ts
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * SearchRequest — Input to the search pipeline.
 * The query is the natural language request from the user.
 */
export interface SearchRequest {
  query: string;
  userPreferences?: UserPreferences;
  filters?: SearchFilters;
  limit?: number;
}

/**
 * SearchFilters — Hard filters applied before ranking.
 * These prune the candidate pool before scoring.
 */
export interface SearchFilters {
  serviceCategories?: string[];
  minRating?: number;
  minSuccessCount?: number;
  maxHourlyRate?: number;
  location?: string;
}

/**
 * SearchResult — A single result from RAG search + ranking.
 * Structurally identical to Candidate (same index signature pattern).
 */
export interface SearchResult {
  agentId: string;
  name: string;
  score: number;
  relevance: number;
  successCount: number;
  rating: number;
  yearsOnPlatform?: number;
  yearsExperience?: number;
  location?: string;
  services?: string[];
  specialties?: string[];
  hourlyRate?: number;
  basePrice?: number;
  description?: string;
  tags?: string[];
  embedding?: number[];
  availability?: string;
  certifications?: string[];
  responseTime?: string;
  [key: string]: unknown;
}

/**
 * SearchResponse — Full response from the search pipeline.
 */
export interface SearchResponse {
  candidates: SearchResult[];
  totalFound: number;
  query: string;
  rankingWeights: RankingWeights;
}

/**
 * RankingWeights — The weights used to compute composite scores.
 * Exposed so the UI can show "how we ranked" transparency.
 */
export interface RankingWeights {
  relevance: number;
  successCount: number;
  rating: number;
  timeOnPlatform: number;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Chat Flow Contracts (frontend-only for now)
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * RankedSearchResponse — What the frontend receives after
 * the full search → rank → select pipeline completes.
 */
export interface RankedSearchResponse {
  candidates: Candidate[];
  followUpQuestion: string | null;
  appliedPreferences: UserPreferences;
  resultCount: number;
}

/**
 * InitialChatResponse — Response from initial chat analysis.
 * The agent extracts preferences and may ask follow-ups.
 */
export interface InitialChatResponse {
  messages: ChatMessage[];
  suggestedPreferences: Partial<UserPreferences>;
  followUpQuestion: string | null;
}
