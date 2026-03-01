import type { NegotiationOutcomeTransport, TransportNegotiationResult } from "@/features/agents/negotiation/types";
import type {
  Candidate,
  JobScope as DomainJobScope,
  SelectedCandidate,
  UserPreferences as DomainUserPreferences,
} from "@/features/agents/selection/types";
import type {
  WorkflowExecutionMeta,
  WorkflowStatusResponse,
} from "@/features/workflow/types";

export type WorkflowPriority = NonNullable<DomainUserPreferences["priority"]>;
export type WorkflowAvailability = NonNullable<DomainUserPreferences["availability"]>;
export type WorkflowUrgency = NonNullable<DomainJobScope["urgency"]>;
export type WorkflowProviderType = "openai" | "openrouter" | "mock";

export interface WorkflowUserPreferences extends DomainUserPreferences {
  additionalRequirements?: string;
}

export type WorkflowJobScope = DomainJobScope;

export interface WorkflowContextFormValues {
  jobType: string;
  description: string;
  location: string;
  urgency: "" | WorkflowUrgency;
  estimatedDuration: string;
  rooms: string;
  budget: string;
  priority: "" | WorkflowPriority;
  minRating: string;
  availability: "" | WorkflowAvailability;
  availabilityRequired: string;
  dealBreakers: string;
  preferredQualifications: string;
  additionalRequirements: string;
}

export interface SearchAndSelectRequest {
  query: string;
  userPreferences: WorkflowUserPreferences;
  scope: WorkflowJobScope;
  limit?: number;
}

export interface SearchAndSelectResponse {
  searchResults: Candidate[];
  selectionResult: {
    top3: SelectedCandidate[];
    summary: string;
    negotiationIds?: string[];
  } | null;
  meta: WorkflowExecutionMeta;
}

export interface RunNegotiationsRequest {
  buyerAgentId: string;
  candidates: SelectedCandidate[];
  preferences: WorkflowUserPreferences;
  scope: WorkflowJobScope;
  jobId?: string;
  providerType?: WorkflowProviderType;
  maxRounds?: number;
}

export interface RunNegotiationsResponse {
  outcomes: NegotiationOutcomeTransport[];
  meta: WorkflowExecutionMeta;
}

export interface SelectWinnerRequest {
  negotiations: Array<{
    candidateId: string;
    result: TransportNegotiationResult;
  }>;
  userPreferences: WorkflowUserPreferences;
  providerType?: WorkflowProviderType;
}

export interface SelectWinnerResponse {
  winner: {
    candidateId: string;
    reasoning: string;
    confidence: number;
  };
  comparison: Array<{
    candidateId: string;
    strengths: string[];
    weaknesses: string[];
    priorityAlignment: number;
  }>;
  summary: string;
  meta: Pick<
    WorkflowExecutionMeta,
    "mode" | "llmProvider" | "fallbacksUsed" | "warnings"
  >;
}

export interface OpenvilleWorkflowRepository {
  getStatus: () => Promise<WorkflowStatusResponse>;
  searchAndSelect: (request: SearchAndSelectRequest) => Promise<SearchAndSelectResponse>;
  runNegotiations: (
    request: RunNegotiationsRequest,
  ) => Promise<RunNegotiationsResponse>;
  selectWinner: (request: SelectWinnerRequest) => Promise<SelectWinnerResponse>;
}

export interface CandidateCardViewModel {
  agentId: string;
  name: string;
  headline: string;
  summary: string;
  specialties: string[];
  score: string;
  startingPrice: string;
  availabilityLabel: string;
  locationLabel: string;
  ratingLabel: string;
  trackRecordLabel: string;
}

export interface SearchResultsViewModel {
  candidates: CandidateCardViewModel[];
  resultCount: number;
  shortlistCount: number;
  summary: string | null;
  warnings: string[];
  meta: WorkflowExecutionMeta;
}

export interface ContextSummaryItem {
  label: string;
  value: string;
}

export interface ShortlistItemViewModel {
  agentId: string;
  name: string;
  reasoning: string;
  matchScore: string;
  serviceLabel: string;
  priceLabel: string;
}

export interface NegotiationOutcomeViewModel {
  candidateId: string;
  candidateName: string;
  status: NegotiationOutcomeTransport["status"];
  statusLabel: string;
  priceLabel: string;
  responseLabel: string;
  summary: string;
}

export interface WinnerSummaryViewModel {
  candidateName: string;
  reasoning: string;
  confidenceLabel: string;
  priceLabel: string;
  summary: string;
  comparison: Array<{
    candidateId: string;
    candidateName: string;
    strengths: string[];
    weaknesses: string[];
    priorityAlignmentLabel: string;
  }>;
}
