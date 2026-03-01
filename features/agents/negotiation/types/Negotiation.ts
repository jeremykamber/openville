export type NegotiationStatus = 'active' | 'completed' | 'cancelled';
export type NegotiationTurn = 'buyer' | 'provider';

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
