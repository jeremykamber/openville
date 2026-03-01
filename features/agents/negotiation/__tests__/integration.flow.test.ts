import { describe, it, expect, vi, beforeEach } from 'vitest';

// Reuse provider mock pattern supporting both invoke and structured output
vi.mock('../../reasoning/providers', () => {
  let responses: string[] = [];
  return {
    createChatModel: vi.fn(() => ({
      invoke: async () => {
        const content = responses.shift() ?? '';
        return { content, type: 'ai' } as any;
      },
      withStructuredOutput: vi.fn(() => async () => ({
        winner: { candidateId: 'tp-001', reasoning: 'Lowest final price', confidence: 0.9 },
        comparison: [],
        summary: 'Chose lowest price for cost priority',
      })),
    })),
    __setResponses: (arr: string[]) => { responses = arr.slice(); },
  };
});

// Mock DB repository to avoid external calls
vi.mock('../db/SupabaseNegotiationRepository', () => {
  const mockRepo = {
    createNegotiation: vi.fn(async (buyerAgentId: string, providerAgentId: string) => ({
      id: `neg-${Math.random()}`,
      buyerAgentId,
      providerAgentId,
      status: 'active',
      currentTurn: 'buyer',
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    addMessage: vi.fn(async (negotiationId: string, sender: string, senderType: any, content: string) => ({
      id: `m-${Math.random()}`,
      negotiationId,
      sender,
      senderType,
      content,
      messageType: 'message',
      createdAt: new Date(),
    })),
    getMessages: vi.fn(async () => ([])),
    getNegotiation: vi.fn(async (id: string) => ({
      id,
      buyerAgentId: 'buyer-1',
      providerAgentId: 'prov-1',
      status: 'active',
      currentTurn: 'buyer',
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    updateNegotiationStatus: vi.fn(async () => {}),
    createNegotiationResult: vi.fn(async (negotiationId: string, proposedBy: string, finalPrice?: number) => ({
      id: `res-${Math.random()}`,
      negotiationId,
      proposedBy,
      status: 'pending',
      finalPrice,
      scope: { description: 'scope' },
      createdAt: new Date(),
    })),
    respondToResult: vi.fn(async (id: string, status: any, msg?: string) => ({
      id,
      negotiationId: 'n',
      proposedBy: 'p',
      status,
      finalPrice: 400,
      scope: { description: 'scope' },
      createdAt: new Date(),
      respondedAt: new Date(),
      responseMessage: msg,
    })),
  };
  return { defaultNegotiationRepository: mockRepo };
});

import { runNegotiations } from '../runNegotiations';
import { selectWinner } from '../../selection/selectWinner';

describe('integration: full negotiation flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('runs negotiations for top3 and selects a winner via LLM', async () => {
    const providers = await import('../../reasoning/providers');

    // our mocked providers module exposes a test helper when imported via vi.mock above
    // but TypeScript doesn't know about it — cast to any to call the helper
    const providersAny = providers as any;

    // Sequence: for each candidate: buyer initial, provider reply, proposer acceptance check
    providersAny.__setResponses([
      'Buyer1 init', 'Provider1 reply', 'ACCEPT',
      'Buyer2 init', 'Provider2 reply', 'ACCEPT',
      'Buyer3 init', 'Provider3 reply', 'ACCEPT',
    ]);

    const selectedCandidates = [
      { candidate: { agentId: 'tp-001', name: 'A', score: 0.9 }, reasoning: '', matchScore: 90 },
      { candidate: { agentId: 'tp-002', name: 'B', score: 0.8 }, reasoning: '', matchScore: 80 },
      { candidate: { agentId: 'tp-003', name: 'C', score: 0.7 }, reasoning: '', matchScore: 70 },
    ];

    const outcomes = await runNegotiations({
      buyerAgentId: 'buyer-1',
      candidates: selectedCandidates as any,
      preferences: { priority: 'cost' } as any,
      scope: { jobType: 'Plumbing', description: 'Fix sink', estimatedPrice: 500 } as any,
    });

    expect(outcomes).toHaveLength(3);
    // All should have result objects (respondToResult returns an object)
    const negotiationsForSelection = outcomes.map(o => ({ candidateId: o.candidateId, result: o.result }));

    const winner = await selectWinner(negotiationsForSelection as any, { priority: 'cost' } as any, { providerType: 'mock' });

    expect(winner.winner.candidateId).toBe('tp-001');
    expect(winner.summary).toContain('Chose lowest price');
  });
});
