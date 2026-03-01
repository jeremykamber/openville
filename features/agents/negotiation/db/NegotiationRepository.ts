import { Negotiation, NegotiationMessage, NegotiationResult } from '../types';

export interface NegotiationRepository {
  createNegotiation(
    buyerAgentId: string,
    providerAgentId: string,
    jobId?: string
  ): Promise<Negotiation>;

  getNegotiation(id: string): Promise<Negotiation | null>;

  addMessage(
    negotiationId: string,
    sender: string,
    senderType: 'buyer' | 'provider',
    content: string,
    messageType?: 'message' | 'proposal' | 'cancellation'
  ): Promise<NegotiationMessage>;

  getMessages(negotiationId: string): Promise<NegotiationMessage[]>;

  updateNegotiationStatus(
    id: string,
    status: 'active' | 'completed' | 'cancelled',
    summary?: string
  ): Promise<void>;

  createNegotiationResult(
    negotiationId: string,
    proposedBy: string,
    finalPrice?: number,
    scope?: { description?: string; rooms?: number; details?: Record<string, unknown> }
  ): Promise<NegotiationResult>;

  respondToResult(
    resultId: string,
    status: 'accepted' | 'rejected',
    responseMessage?: string
  ): Promise<NegotiationResult>;
}
