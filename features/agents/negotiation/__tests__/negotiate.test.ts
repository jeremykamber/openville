import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the providers module so we can control LLM outputs per test
vi.mock('../../reasoning/providers', () => {
  let responses: string[] = [];
  return {
    createChatModel: () => ({
      invoke: async () => {
        const content = responses.shift() ?? '';
        return { content, type: 'ai' } as any;
      },
    }),
    // helper to set responses in tests
    __setResponses: (arr: string[]) => { responses = arr.slice(); },
  };
});

// Mock the negotiation DB module to avoid calling supabase in these tests
// Use a relative path that matches how negotiate.ts imports the db module
vi.mock('../db/SupabaseNegotiationRepository', () => {
  const mockRepo = {
    createNegotiation: vi.fn(async (buyerAgentId: string, providerAgentId: string) => ({
      id: 'neg-1',
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
    createNegotiationResult: vi.fn(async (negotiationId: string) => ({ id: 'res-1', negotiationId })),
    respondToResult: vi.fn(async (id: string, status: any, msg?: string) => ({ id, status, responseMessage: msg })),
  };
  return {
    defaultNegotiationRepository: mockRepo,
  };
});

import { startNegotiation, sendBuyerMessage, proposeNegotiationResult } from '../negotiate';
import * as providers from '../../reasoning/providers';
import { defaultNegotiationRepository as db } from '../db/SupabaseNegotiationRepository';

describe('negotiate engine (unit)', () => {
  beforeEach(() => {
    // reset mocks
    vi.clearAllMocks();
  });

  it('startNegotiation calls model and persists initial messages', async () => {
    // arrange: set model responses (buyer then provider)
    (providers as any).__setResponses(['Buyer initial message', 'Provider reply']);

    const negotiation = await startNegotiation('buyer-1', { agentId: 'prov-1', name: 'P' } as any, {} as any, {} as any);

    expect(negotiation).toHaveProperty('id');
    // db.createNegotiation should have been called
    expect(db.createNegotiation).toHaveBeenCalled();
    // addMessage should be called at least twice (buyer and provider initial)
    expect(db.addMessage).toHaveBeenCalledTimes(2);
  });

  it('sendBuyerMessage produces provider and buyer auto responses', async () => {
    (providers as any).__setResponses(['Provider auto reply', 'Buyer auto reply']);

    const res = await sendBuyerMessage('neg-1', 'buyer-1', 'Hello', { agentId: 'prov-1' } as any, {} as any);

    expect(res).toHaveProperty('messages');
    expect(res.providerResponse).toBeDefined();
    expect(res.buyerResponse).toBeDefined();
    // messages persisted via addMessage
    expect(db.addMessage).toHaveBeenCalled();
  });

  it('proposeNegotiationResult triggers acceptance flow', async () => {
    // model will accept
    (providers as any).__setResponses(['ACCEPT: happy to accept']);

    const result = await proposeNegotiationResult('neg-1', 'buyer-1', 123, { description: 'scope' });

    expect(result.accepted).toBe(true);
    expect(db.respondToResult).toHaveBeenCalled();
    expect(db.updateNegotiationStatus).toHaveBeenCalled();
  });
});
