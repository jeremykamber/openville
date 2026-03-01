import { describe, it, expect } from 'vitest';
import { Negotiation, NegotiationStatus, NegotiationTurn } from '../Negotiation';
import { NegotiationMessage, SenderType, MessageType } from '../NegotiationMessage';
import { NegotiationResult, ResultStatus, NegotiationScope } from '../NegotiationResult';

describe('Negotiation Types', () => {
  it('Negotiation has required fields', () => {
    const n: Negotiation = {
      id: 'n1',
      buyerAgentId: 'b1',
      providerAgentId: 'p1',
      status: 'active',
      currentTurn: 'buyer',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(n.buyerAgentId).toBe('b1');
    expect(n.currentTurn).toBe('buyer');
  });

  it('NegotiationMessage supports types', () => {
    const m: NegotiationMessage = {
      id: 'm1',
      negotiationId: 'n1',
      sender: 'agent-1',
      senderType: 'provider',
      content: 'Hello',
      messageType: 'message',
      createdAt: new Date(),
    };

    expect(m.senderType).toBe('provider');
    expect(m.messageType).toBe('message');
  });

  it('NegotiationResult shape', () => {
    const scope: NegotiationScope = { description: 'Paint', rooms: 2 };
    const r: NegotiationResult = {
      id: 'r1',
      negotiationId: 'n1',
      proposedBy: 'agent-1',
      status: 'pending',
      finalPrice: 300,
      scope,
      createdAt: new Date(),
    };

    expect(r.scope?.rooms).toBe(2);
    expect(r.status).toBe('pending');
  });
});
