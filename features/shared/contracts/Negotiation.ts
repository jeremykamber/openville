/**
 * Negotiation contracts — Types for the agent-to-agent negotiation phase.
 *
 * Aligned with dev branch: features/agents/negotiation/types/
 *
 * The frontend uses these to render the negotiation visualization
 * (Section 5: "Agents Negotiate. You Win.") and the workspace mode
 * negotiation status.
 */

export type NegotiationStatus = "active" | "completed" | "cancelled";
export type NegotiationTurn = "buyer" | "provider";

/**
 * Negotiation — An active negotiation session between the buyer's
 * AI agent and a provider's AI agent.
 */
export interface Negotiation {
  id: string;
  buyerAgentId: string;
  providerAgentId: string;
  jobId?: string;
  status: NegotiationStatus;
  currentTurn: NegotiationTurn;
  createdAt: Date;
  updatedAt: Date;
  endedAt?: Date;
  summary?: string;
}

export type ResultStatus = "pending" | "accepted" | "rejected";

export interface NegotiationScope {
  description?: string;
  rooms?: number;
  [key: string]: unknown;
}

/**
 * NegotiationResult — The outcome of a negotiation session.
 * Contains the final agreed price, scope, and status.
 */
export interface NegotiationResult {
  id: string;
  negotiationId: string;
  proposedBy: string;
  status: ResultStatus;
  finalPrice?: number;
  scope?: NegotiationScope;
  createdAt: Date;
  respondedAt?: Date;
  responseMessage?: string;
}

/**
 * NegotiationMessage — A single turn in the negotiation dialogue.
 * Used to render the negotiation transcript in the UI.
 */
export interface NegotiationMessage {
  id: string;
  negotiationId: string;
  sender: NegotiationTurn;
  content: string;
  createdAt: Date;
}
