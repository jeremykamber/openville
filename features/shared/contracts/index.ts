/**
 * Shared contracts barrel export.
 *
 * Import from here for clean imports:
 *   import type { Candidate, UserPreferences } from "@/features/shared/contracts";
 */

export type { Candidate, SelectedCandidate } from "./Candidate";
export type { ChatMessage, ChatMessageRole, ChatMessageStatus } from "./ChatMessage";
export type { UserPreferences } from "./UserPreferences";
export type {
  SearchRequest,
  SearchFilters,
  SearchResult,
  SearchResponse,
  RankingWeights,
  RankedSearchResponse,
  InitialChatResponse,
} from "./SearchContracts";
export type {
  Negotiation,
  NegotiationStatus,
  NegotiationTurn,
  NegotiationResult,
  ResultStatus,
  NegotiationScope,
  NegotiationMessage,
} from "./Negotiation";
