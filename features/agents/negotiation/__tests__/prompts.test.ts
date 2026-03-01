import { describe, it, expect } from 'vitest';
import { buildBuyerInitialPrompt, buildBuyerTurnPrompt, BUYER_AGENT_SYSTEM_PROMPT } from '../prompts/buyerPrompts';
import { buildProviderInitialPrompt, buildProviderTurnPrompt, PROVIDER_AGENT_SYSTEM_PROMPT } from '../prompts/providerPrompts';
import { Candidate } from '../../selection/types/Candidate';
import { JobScope } from '../../selection/types/JobScope';
import { UserPreferences } from '../../selection/types/UserPreferences';

describe('Negotiation prompts', () => {
  const candidate: Candidate = {
    agentId: 'a1',
    name: 'Alice',
    score: 0,
    relevance: 0,
    successCount: 0,
    rating: 4.5,
  } as Candidate;

  const scope: JobScope = {
    jobType: 'painting',
    description: 'Paint living room',
  } as JobScope;

  const prefs: UserPreferences = { budget: 500, priority: 'quality' } as UserPreferences;

  it('creates buyer initial prompt', () => {
    const s = buildBuyerInitialPrompt(candidate, scope, prefs);
    expect(typeof s).toBe('string');
    expect(s).toContain('Paint living room');
  });

  it('creates provider initial prompt', () => {
    const s = buildProviderInitialPrompt(candidate, scope, 'Bob');
    expect(typeof s).toBe('string');
    expect(s).toContain('Alice');
  });

  it('creates turn prompts with recent messages', () => {
    const messages = [
      { id: 'm1', negotiationId: 'n', sender: 'a', senderType: 'buyer', content: 'Hi', messageType: 'message', createdAt: new Date() },
    ] as any;

    const buyerTurn = buildBuyerTurnPrompt({} as any, messages, prefs);
    expect(buyerTurn).toContain('Conversation So Far');

    const providerTurn = buildProviderTurnPrompt({} as any, messages, candidate);
    expect(providerTurn).toContain('Conversation So Far');
  });

  it('has system prompts', () => {
    expect(BUYER_AGENT_SYSTEM_PROMPT).toContain('You are a helpful AI assistant');
    expect(PROVIDER_AGENT_SYSTEM_PROMPT).toContain('You are a helpful AI assistant representing a service provider');
  });
});
