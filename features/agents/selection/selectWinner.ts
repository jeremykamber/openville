import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { createChatModel } from '../reasoning/providers';
import { NegotiationResult } from '../negotiation/types/NegotiationResult';
import { UserPreferences } from './types';
import { SELECT_WINNER_SYSTEM_PROMPT, buildWinnerSelectionPrompt } from '../reasoning/prompts/winnerPrompts';
import { SelectWinnerLLMResponseSchema } from '../reasoning/schemas/WinnerSchemas';

export interface SelectWinnerOptions {
  providerType?: 'openai' | 'openrouter' | 'mock';
  temperature?: number;
}

export interface WinnerSelectionResponse {
  winner: {
    candidateId: string;
    reasoning: string;
    confidence: number;
  };
  comparison: Array<{
    candidateId: string;
    strengths: string[];
    weaknesses: string[];
    priorityAlignment: number;
  }>;
  summary: string;
}

export async function selectWinner(
  negotiations: Array<{ result: NegotiationResult; candidateId: string }>,
  preferences: UserPreferences,
  options: SelectWinnerOptions = {}
): Promise<WinnerSelectionResponse> {
  if (negotiations.length === 0) {
    throw new Error('At least one negotiation result required');
  }

  const model = createChatModel(options.providerType ?? 'openai');
  const userPrompt = buildWinnerSelectionPrompt(negotiations, preferences);

  const structuredOutput = model.withStructuredOutput(SelectWinnerLLMResponseSchema, {
    temperature: options.temperature ?? 0.3, // Lower temperature for more consistent selection
  });

  const llmResponse = await structuredOutput([
    new SystemMessage(SELECT_WINNER_SYSTEM_PROMPT),
    new HumanMessage(userPrompt),
  ]);

  // Validate winner exists in negotiations
  const winnerExists = negotiations.some(n => n.candidateId === llmResponse.winner.candidateId);
  if (!winnerExists) {
    throw new Error(`Selected winner ${llmResponse.winner.candidateId} not found in negotiations`);
  }

  return llmResponse;
}