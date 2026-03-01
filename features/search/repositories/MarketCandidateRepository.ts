import { SearchResult } from "../types";
import { WorkflowFallback } from "@/features/workflow/types";

export interface MarketCandidateRepositoryResult {
  candidates: SearchResult[];
  source: "supabase" | "seed";
  seeded: boolean;
  warnings: string[];
  fallbacksUsed: WorkflowFallback[];
}

export interface MarketCandidateRepository {
  listCandidates(): Promise<MarketCandidateRepositoryResult>;
}
