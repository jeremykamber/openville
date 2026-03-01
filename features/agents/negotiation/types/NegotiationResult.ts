export type ResultStatus = 'pending' | 'accepted' | 'rejected';

export interface NegotiationScope {
  description?: string;
  rooms?: number;
  [key: string]: unknown;
}

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
