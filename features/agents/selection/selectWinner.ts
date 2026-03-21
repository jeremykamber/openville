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

  if (options.providerType === 'mock') {
    const ranked = [...negotiations].sort((left, right) => {
      const leftAccepted = left.result.status === 'accepted' ? 1 : 0;
      const rightAccepted = right.result.status === 'accepted' ? 1 : 0;

      if (leftAccepted !== rightAccepted) {
        return rightAccepted - leftAccepted;
      }

      if (preferences.priority === 'cost') {
        return (left.result.finalPrice ?? Number.MAX_SAFE_INTEGER) - (right.result.finalPrice ?? Number.MAX_SAFE_INTEGER);
      }

      return (right.result.finalPrice ?? 0) - (left.result.finalPrice ?? 0);
    });

    const winner = ranked[0];

    return {
      winner: {
        candidateId: winner.candidateId,
        reasoning:
          preferences.priority === 'cost'
            ? 'Mock fallback selected the lowest accepted price.'
            : 'Mock fallback selected the strongest accepted negotiation outcome.',
        confidence: 0.6,
      },
      comparison: ranked.map((negotiation) => ({
        candidateId: negotiation.candidateId,
        strengths: negotiation.result.status === 'accepted' ? ['accepted proposal'] : ['active negotiation record'],
        weaknesses: negotiation.result.status === 'accepted' ? [] : ['proposal not accepted'],
        priorityAlignment:
          preferences.priority === 'cost' && negotiation.result.finalPrice
            ? Math.max(0, Math.min(1, 1 - negotiation.result.finalPrice / 1000))
            : 0.5,
      })),
      summary: 'Mock fallback winner selection used deterministic ranking because a live LLM provider was unavailable.',
    };
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
