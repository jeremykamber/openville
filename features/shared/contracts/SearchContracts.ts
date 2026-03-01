import type { Candidate } from "@/features/shared/contracts/Candidate";
import type { ChatMessage } from "@/features/shared/contracts/ChatMessage";
import type { UserPreferences } from "@/features/shared/contracts/UserPreferences";

export interface SearchRequest {
  query: string;
  userPreferences: UserPreferences;
}

export interface RankedSearchResponse {
  candidates: Candidate[];
  followUpQuestion: string | null;
  appliedPreferences: UserPreferences;
  resultCount: number;
}

export interface InitialChatResponse {
  messages: ChatMessage[];
  suggestedPreferences: Partial<UserPreferences>;
  followUpQuestion: string | null;
}
