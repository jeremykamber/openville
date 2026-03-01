import { ResultStatus } from "./NegotiationResult";

export interface TransportNegotiationScope {
  description?: string;
  rooms?: number;
  details?: Record<string, unknown>;
}

export interface TransportNegotiationResult {
  id: string;
  negotiationId: string;
  proposedBy: string;
  status: ResultStatus;
  finalPrice?: number;
  scope?: TransportNegotiationScope;
  createdAt: string;
  respondedAt?: string;
  responseMessage?: string;
}

export interface NegotiationOutcomeTransport {
  negotiationId: string;
  candidateId: string;
  status: "completed" | "rejected" | "failed" | "cancelled";
  result?: TransportNegotiationResult;
  summary?: string;
}
