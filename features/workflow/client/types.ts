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
export type WorkflowSpeedPreset = "fastest" | "balanced" | "best_quality";

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

export interface WorkflowHomepageControls {
  speed: WorkflowSpeedPreset;
  budget: string;
  budgetTouched: boolean;
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

// ---------------------------------------------------------------------------
// Arena view-model types (Phase 1 — Agent Economy Redesign)
// ---------------------------------------------------------------------------

/** Candidate ranked 4–10 shown as a dimmed node with an inferred elimination reason. */
export interface EliminationCandidateViewModel {
  agentId: string;
  name: string;
  rank: number;
  score: string;
  relevance: string;
  ratingLabel: string;
  priceLabel: string;
  /** Frontend-derived reason this candidate didn't make the top 3. Always inferred, never backend truth. */
  eliminationReason: string;
}

/** Top-3 finalist shown in the agent pitch visualization with thought-bubble content. */
export interface FinalistShowdownViewModel {
  agentId: string;
  name: string;
  rank: number;
  survivalReason: string;
  negotiatedPriceLabel: string;
  scopeStance: string;
  strength: string;
  weakness: string;
  /** Short pitch summary rendered inside the thought bubble during the pitching phase. */
  pitchText: string;
  /** Central agent's assessment of this finalist, rendered during the evaluating phase. */
  evaluationNotes: string;
}

/** Tracks the visualization phase for the agent pitch scene. */
export type AgentPitchSceneState = "idle" | "pitching" | "evaluating" | "verdict";

// ---------------------------------------------------------------------------
// Negotiation detail types
// ---------------------------------------------------------------------------

/** A single message in a negotiation thread, with createdAt normalised to ISO string. */
export interface NegotiationThreadMessage {
  id: string;
  negotiationId: string;
  sender: string;
  senderType: "buyer" | "provider";
  content: string;
  messageType: "message" | "proposal" | "cancellation";
  createdAt: string;
}

/** View-model for the negotiation thread inspector. */
export interface NegotiationThreadViewModel {
  negotiationId: string;
  status: string;
  messages: NegotiationThreadMessage[];
}

/** Raw JSON response shape from GET /api/agents/negotiate/[id]. */
export interface NegotiationDetailResponse {
  negotiation: {
    id: string;
    buyerAgentId: string;
    providerAgentId: string;
    jobId?: string;
    status: string;
    currentTurn: string;
    createdAt: string;
    updatedAt: string;
    endedAt?: string;
    summary?: string;
  };
  messages: Array<{
    id: string;
    negotiationId: string;
    sender: string;
    senderType: string;
    content: string;
    messageType: string;
    createdAt: string;
  }>;
}

// ---------------------------------------------------------------------------
// Inspector artifact types
// ---------------------------------------------------------------------------

export type InspectorArtifactSource = "real" | "inferred";

/** A structured trace block rendered in the inspector rail. */
export interface InspectorArtifactViewModel {
  kind:
    | "ranking_signals"
    | "shortlist_reasoning"
    | "negotiation_excerpt"
    | "fallback_warning"
    | "decision_comparison"
    | "elimination_rationale";
  label: string;
  source: InspectorArtifactSource;
  content: string;
}
