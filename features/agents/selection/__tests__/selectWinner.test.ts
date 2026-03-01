import { describe, it, expect, vi, beforeEach } from 'vitest';
import { selectWinner } from '../selectWinner';
import { NegotiationResult } from '../../negotiation/types/NegotiationResult';
import { UserPreferences } from '../types';

vi.mock('../../reasoning/providers', () => ({
  createChatModel: vi.fn(() => ({
    withStructuredOutput: vi.fn(() => async () => ({
      winner: { candidateId: 'tp-001', reasoning: 'Best cost', confidence: 0.95 },
      comparison: [
        { candidateId: 'tp-001', strengths: ['low price'], weaknesses: [], priorityAlignment: 1 },
        { candidateId: 'tp-002', strengths: ['quality'], weaknesses: ['higher price'], priorityAlignment: 0.5 },
      ],
      summary: 'Selected based on cost priority',
    })),
  })),
}));

describe('selectWinner', () => {
  const baseNegotiations: Array<{ result: NegotiationResult; candidateId: string }> = [
    {
      candidateId: 'tp-001',
      result: {
        id: 'r1',
        negotiationId: 'n1',
        proposedBy: 'tp-001',
        status: 'accepted',
        finalPrice: 400,
        scope: { description: 'Fix sink' },
        createdAt: new Date(),
      } as NegotiationResult,
    },
    {
      candidateId: 'tp-002',
      result: {
        id: 'r2',
        negotiationId: 'n2',
        proposedBy: 'tp-002',
        status: 'accepted',
        finalPrice: 500,
        scope: { description: 'Fix sink' },
        createdAt: new Date(),
      } as NegotiationResult,
    },
  ];

  const prefs: UserPreferences = { priority: 'cost' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('selects a winner and returns comparison data', async () => {
    const res = await selectWinner(baseNegotiations, prefs, { providerType: 'mock' });
    expect(res.winner.candidateId).toBe('tp-001');
    expect(res.comparison).toHaveLength(2);
    expect(res.summary).toContain('Selected based on cost priority');
  });

  it('throws if no negotiations provided', async () => {
    await expect(selectWinner([], prefs)).rejects.toThrow('At least one negotiation result required');
  });
});
