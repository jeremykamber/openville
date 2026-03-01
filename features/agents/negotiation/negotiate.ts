import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { createChatModel } from '../reasoning/providers';
import { Candidate, UserPreferences, JobScope } from '../selection/types';
import { Negotiation, NegotiationMessage } from './types';
import { defaultNegotiationRepository as repo } from './db/SupabaseNegotiationRepository';
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
}

export async function startNegotiation(
  buyerAgentId: string,
  candidate: Candidate,
  preferences: UserPreferences,
  scope: JobScope,
  jobId?: string,
  options: NegotiateOptions = {}
): Promise<Negotiation> {
  const negotiation = await repo.createNegotiation(buyerAgentId, candidate.agentId, jobId);
  
  const model = createChatModel(options.providerType ?? 'openai');
  
  const buyerPrompt = buildBuyerInitialPrompt(candidate, scope, preferences);
  const providerPrompt = buildProviderInitialPrompt(candidate, scope);

  const buyerResponse = await model.invoke([
    new SystemMessage(BUYER_AGENT_SYSTEM_PROMPT),
    new HumanMessage(buyerPrompt),
  ]);

  await repo.addMessage(negotiation.id, buyerAgentId, 'buyer', buyerResponse.content as string);

  const providerResponse = await model.invoke([
    new SystemMessage(PROVIDER_AGENT_SYSTEM_PROMPT),
    new HumanMessage(providerPrompt + `\n\nCustomer says: ${buyerResponse.content}`),
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
  const negotiation = await repo.getNegotiation(negotiationId);
  if (!negotiation || negotiation.status !== 'active') {
    throw new Error('Negotiation not found or not active');
  }

  await repo.addMessage(negotiationId, buyerAgentId, 'buyer', message);
  const allMessages = await repo.getMessages(negotiationId);

  const model = createChatModel(options.providerType ?? 'openai');
  
  // Provider responds to buyer's message
  const providerPrompt = buildProviderTurnPrompt(negotiation, allMessages, candidate);
  const providerResponse = await model.invoke([
    new SystemMessage(PROVIDER_AGENT_SYSTEM_PROMPT),
    new HumanMessage(providerPrompt),
  ]);
  await repo.addMessage(negotiationId, candidate.agentId, 'provider', providerResponse.content as string);

  // Get updated messages and have buyer respond for multi-turn negotiation
  const messagesAfterProvider = await repo.getMessages(negotiationId);
  const buyerTurnPrompt = buildBuyerTurnPrompt(negotiation, messagesAfterProvider, preferences);
  const buyerAutoResponse = await model.invoke([
    new SystemMessage(BUYER_AGENT_SYSTEM_PROMPT),
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
  const negotiation = await repo.getNegotiation(negotiationId);
  if (!negotiation || negotiation.status !== 'active') {
    throw new Error('Negotiation not found or not active');
  }

  await repo.addMessage(negotiationId, senderId, senderType, message);
  const allMessages = await repo.getMessages(negotiationId);

  const model = createChatModel(options.providerType ?? 'openai');
  
  const isBuyer = senderType === 'buyer';
  const responderPrompt = isBuyer 
    ? buildProviderTurnPrompt(negotiation, allMessages, candidate)
    : buildBuyerTurnPrompt(negotiation, allMessages, preferences);
  
  const responderSystemPrompt = isBuyer 
    ? PROVIDER_AGENT_SYSTEM_PROMPT 
    : BUYER_AGENT_SYSTEM_PROMPT;

  const response = await model.invoke([
    new SystemMessage(responderSystemPrompt),
    new HumanMessage(responderPrompt),
  ]);

  const responderId = isBuyer ? candidate.agentId : negotiation.buyerAgentId;
  await repo.addMessage(negotiationId, responderId, isBuyer ? 'provider' : 'buyer', response.content as string);

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
  const negotiation = await repo.getNegotiation(negotiationId);
  if (!negotiation || negotiation.status !== 'active') {
    throw new Error('Negotiation not found or not active');
  }

  const result = await repo.createNegotiationResult(negotiationId, proposerId, finalPrice, scope);
  
  const isBuyer = proposerId === negotiation.buyerAgentId;
  const responderSystemPrompt = isBuyer ? PROVIDER_AGENT_SYSTEM_PROMPT : BUYER_AGENT_SYSTEM_PROMPT;

  const model = createChatModel(options.providerType ?? 'openai');
  
  const prompt = `A negotiation result has been proposed:
- Price: $${finalPrice}
- Scope: ${scope.description ?? `${scope.rooms} rooms`}

Do you accept or reject this proposal? Respond with ACCEPT or REJECT and explain your reasoning.`;

  const response = await model.invoke([
    new SystemMessage(responderSystemPrompt),
    new HumanMessage(prompt),
  ]);

  const responseText = response.content as string;
  const accepted = /\bACCEPT\b/i.test(responseText);
  
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
  reason: string
): Promise<Negotiation> {
  const negotiation = await repo.getNegotiation(negotiationId);
  if (!negotiation || negotiation.status !== 'active') {
    throw new Error('Negotiation not found or not active');
  }

  await repo.addMessage(negotiationId, cancellerId, cancellerId === negotiation.buyerAgentId ? 'buyer' : 'provider', 
    `CANCEL_NEGOTIATION: ${reason}`, 'cancellation');
  
  await repo.updateNegotiationStatus(negotiationId, 'cancelled', reason);
  
  return (await repo.getNegotiation(negotiationId))!;
}
