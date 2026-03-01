import { SystemMessage, HumanMessage, BaseMessage } from '@langchain/core/messages';
import { createChatModel } from '../reasoning/providers';
import { Candidate, UserPreferences, JobScope } from '../selection/types';
import { Negotiation, NegotiationMessage } from './types';
import { NegotiationRepository } from './db/NegotiationRepository';
import { defaultNegotiationRepository } from './db/SupabaseNegotiationRepository';
import {
  BUYER_AGENT_SYSTEM_PROMPT,
  buildBuyerInitialPrompt,
  buildBuyerTurnPrompt,
} from './prompts/buyerPrompts';
import {
  PROVIDER_AGENT_SYSTEM_PROMPT,
  buildProviderInitialPrompt,
  buildProviderTurnPrompt,
} from './prompts/providerPrompts';

export interface NegotiateOptions {
  providerType?: 'openai' | 'openrouter' | 'mock';
  temperature?: number;
  repository?: NegotiationRepository;
}

/**
 * Strategy for different participant roles in a negotiation
 */
interface NegotiationParticipant {
  getSystemPrompt(): string;
  getInitialPrompt(candidate: Candidate, scope: JobScope, preferences?: UserPreferences): string;
  getTurnPrompt(negotiation: Negotiation, messages: NegotiationMessage[], candidate: Candidate, preferences?: UserPreferences): string;
}

class BuyerParticipant implements NegotiationParticipant {
  getSystemPrompt() { return BUYER_AGENT_SYSTEM_PROMPT; }
  getInitialPrompt(candidate: Candidate, scope: JobScope, preferences: UserPreferences) {
    return buildBuyerInitialPrompt(candidate, scope, preferences);
  }
  getTurnPrompt(negotiation: Negotiation, messages: NegotiationMessage[], _candidate: Candidate, preferences: UserPreferences) {
    return buildBuyerTurnPrompt(negotiation, messages, preferences);
  }
}

class ProviderParticipant implements NegotiationParticipant {
  getSystemPrompt() { return PROVIDER_AGENT_SYSTEM_PROMPT; }
  getInitialPrompt(candidate: Candidate, scope: JobScope) {
    return buildProviderInitialPrompt(candidate, scope);
  }
  getTurnPrompt(negotiation: Negotiation, messages: NegotiationMessage[], candidate: Candidate) {
    return buildProviderTurnPrompt(negotiation, messages, candidate);
  }
}

const participants: Record<string, NegotiationParticipant> = {
  buyer: new BuyerParticipant(),
  provider: new ProviderParticipant(),
};

/**
 * Parser for LLM negotiation responses
 */
export const NegotiationResponseParser = {
  isAccepted(text: string): boolean {
    const upper = text.toUpperCase();
    return upper.includes('ACCEPT') && !upper.includes('REJECT') && !upper.includes('COUNTER');
  },
  isCancelled(text: string): boolean {
    return text.includes('CANCEL_NEGOTIATION');
  }
};

export async function startNegotiation(
  buyerAgentId: string,
  candidate: Candidate,
  preferences: UserPreferences,
  scope: JobScope,
  jobId?: string,
  options: NegotiateOptions = {}
): Promise<Negotiation> {
  const repo = options.repository ?? defaultNegotiationRepository;
  const negotiation = await repo.createNegotiation(buyerAgentId, candidate.agentId, jobId);
  
  const model = createChatModel(options.providerType ?? 'openai');
  
  const buyerParticipant = participants.buyer;
  const providerParticipant = participants.provider;

  const buyerInitial = buyerParticipant.getInitialPrompt(candidate, scope, preferences);
  const buyerResponse = await model.invoke([
    new SystemMessage(buyerParticipant.getSystemPrompt()),
    new HumanMessage(buyerInitial),
  ]);

  const buyerContent = buyerResponse.content as string;
  await repo.addMessage(negotiation.id, buyerAgentId, 'buyer', buyerContent);

  const providerInitial = providerParticipant.getInitialPrompt(candidate, scope);
  const providerResponse = await model.invoke([
    new SystemMessage(providerParticipant.getSystemPrompt()),
    new HumanMessage(providerInitial + `\n\nCustomer says: ${buyerContent}`),
  ]);

  await repo.addMessage(negotiation.id, candidate.agentId, 'provider', providerResponse.content as string);

  return { ...negotiation, currentTurn: 'buyer' };
}

export async function sendBuyerMessage(
  negotiationId: string,
  buyerAgentId: string,
  message: string,
  candidate: Candidate,
  preferences: UserPreferences,
  options: NegotiateOptions = {}
): Promise<{ messages: NegotiationMessage[]; buyerResponse: string; providerResponse: string }> {
  const repo = options.repository ?? defaultNegotiationRepository;
  const negotiation = await repo.getNegotiation(negotiationId);
  if (!negotiation || negotiation.status !== 'active') {
    throw new Error('Negotiation not found or not active');
  }

  await repo.addMessage(negotiationId, buyerAgentId, 'buyer', message);
  const allMessages = await repo.getMessages(negotiationId);

  const model = createChatModel(options.providerType ?? 'openai');
  const providerParticipant = participants.provider;
  
  // Provider responds to buyer's message
  const providerPrompt = providerParticipant.getTurnPrompt(negotiation, allMessages, candidate);
  const providerResponse = await model.invoke([
    new SystemMessage(providerParticipant.getSystemPrompt()),
    new HumanMessage(providerPrompt),
  ]);
  await repo.addMessage(negotiationId, candidate.agentId, 'provider', providerResponse.content as string);

  // Get updated messages and have buyer respond for multi-turn negotiation
  const messagesAfterProvider = await repo.getMessages(negotiationId);
  const buyerParticipant = participants.buyer;
  const buyerTurnPrompt = buyerParticipant.getTurnPrompt(negotiation, messagesAfterProvider, candidate, preferences);
  const buyerAutoResponse = await model.invoke([
    new SystemMessage(buyerParticipant.getSystemPrompt()),
    new HumanMessage(buyerTurnPrompt),
  ]);
  await repo.addMessage(negotiationId, buyerAgentId, 'buyer', buyerAutoResponse.content as string);

  const updatedMessages = await repo.getMessages(negotiationId);

  return {
    messages: updatedMessages,
    buyerResponse: buyerAutoResponse.content as string,
    providerResponse: providerResponse.content as string,
  };
}

export async function sendSingleMessage(
  negotiationId: string,
  senderId: string,
  senderType: 'buyer' | 'provider',
  message: string,
  candidate: Candidate,
  preferences: UserPreferences,
  options: NegotiateOptions = {}
): Promise<{ messages: NegotiationMessage[]; response: string }> {
  const repo = options.repository ?? defaultNegotiationRepository;
  const negotiation = await repo.getNegotiation(negotiationId);
  if (!negotiation || negotiation.status !== 'active') {
    throw new Error('Negotiation not found or not active');
  }

  await repo.addMessage(negotiationId, senderId, senderType, message);
  const allMessages = await repo.getMessages(negotiationId);

  const model = createChatModel(options.providerType ?? 'openai');
  
  const isBuyer = senderType === 'buyer';
  const responderType = isBuyer ? 'provider' : 'buyer';
  const participant = participants[responderType];

  const responderPrompt = participant.getTurnPrompt(negotiation, allMessages, candidate, preferences);
  const response = await model.invoke([
    new SystemMessage(participant.getSystemPrompt()),
    new HumanMessage(responderPrompt),
  ]);

  const responderId = isBuyer ? candidate.agentId : negotiation.buyerAgentId;
  await repo.addMessage(negotiationId, responderId, responderType, response.content as string);

  const updatedMessages = await repo.getMessages(negotiationId);

  return {
    messages: updatedMessages,
    response: response.content as string,
  };
}

export async function proposeNegotiationResult(
  negotiationId: string,
  proposerId: string,
  finalPrice: number,
  scope: { description?: string; rooms?: number },
  options: NegotiateOptions = {}
): Promise<{ resultId: string; response: string; accepted: boolean }> {
  const repo = options.repository ?? defaultNegotiationRepository;
  const negotiation = await repo.getNegotiation(negotiationId);
  if (!negotiation || negotiation.status !== 'active') {
    throw new Error('Negotiation not found or not active');
  }

  const result = await repo.createNegotiationResult(negotiationId, proposerId, finalPrice, scope);
  
  const isBuyer = proposerId === negotiation.buyerAgentId;
  const responderType = isBuyer ? 'provider' : 'buyer';
  const participant = participants[responderType];

  const model = createChatModel(options.providerType ?? 'openai');
  
  const prompt = `A negotiation result has been proposed:
- Price: $${finalPrice}
- Scope: ${scope.description ?? `${scope.rooms} rooms`}

Do you accept or reject this proposal? Respond with ACCEPT or REJECT and explain your reasoning.`;

  const response = await model.invoke([
    new SystemMessage(participant.getSystemPrompt()),
    new HumanMessage(prompt),
  ]);

  const responseText = response.content as string;
  const accepted = NegotiationResponseParser.isAccepted(responseText);
  
  await repo.respondToResult(result.id, accepted ? 'accepted' : 'rejected', responseText);

  if (accepted) {
    await repo.updateNegotiationStatus(negotiationId, 'completed', 
      `Agreed on price $${finalPrice} for ${scope.description ?? `${scope.rooms} rooms`}`);
  }

  return {
    resultId: result.id,
    response: responseText,
    accepted,
  };
}

export async function cancelNegotiation(
  negotiationId: string,
  cancellerId: string,
  reason: string,
  options: NegotiateOptions = {}
): Promise<Negotiation> {
  const repo = options.repository ?? defaultNegotiationRepository;
  const negotiation = await repo.getNegotiation(negotiationId);
  if (!negotiation || negotiation.status !== 'active') {
    throw new Error('Negotiation not found or not active');
  }

  await repo.addMessage(negotiationId, cancellerId, cancellerId === negotiation.buyerAgentId ? 'buyer' : 'provider', 
    `CANCEL_NEGOTIATION: ${reason}`, 'cancellation');
  
  await repo.updateNegotiationStatus(negotiationId, 'cancelled', reason);
  
  return (await repo.getNegotiation(negotiationId))!;
}
