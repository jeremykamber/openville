import { describe, it, expect } from 'vitest';
import {
  NegotiationMessageSchema,
  NegotiationResultSchema,
  NegotiationResultResponseSchema,
} from '@/features/agents/negotiation/schemas/NegotiationSchemas';

describe('Negotiation Zod Schemas', () => {
  it('validates a negotiation message', () => {
    const input = {
      negotiationId: '00000000-0000-0000-0000-000000000000',
      sender: 'agent-1',
      senderType: 'buyer',
      content: 'Hello, I propose $100',
    };

    const parsed = NegotiationMessageSchema.parse(input);
    expect(parsed.sender).toBe('agent-1');
    expect(parsed.messageType).toBeDefined();
  });

  it('rejects invalid negotiation message', () => {
    expect(() =>
      NegotiationMessageSchema.parse({
        negotiationId: 'not-a-uuid',
        sender: '',
        senderType: 'buyer',
        content: '',
      })
    ).toThrow();
  });

  it('validates a negotiation result', () => {
    const input = {
      negotiationId: '00000000-0000-0000-0000-000000000000',
      proposedBy: 'agent-1',
      finalPrice: 200,
      scope: { description: 'Paint 2 rooms', rooms: 2 },
    };

    const parsed = NegotiationResultSchema.parse(input);
    expect(parsed.proposedBy).toBe('agent-1');
    expect(parsed.scope?.rooms).toBe(2);
  });

  it('validates result response', () => {
    const input = { status: 'accepted', responseMessage: 'Sounds good' };
    const parsed = NegotiationResultResponseSchema.parse(input);
    expect(parsed.status).toBe('accepted');
  });
});
