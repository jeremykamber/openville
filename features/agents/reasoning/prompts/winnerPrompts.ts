import { NegotiationResult } from '../../negotiation/types/NegotiationResult';
import { UserPreferences } from '../../selection/types';

export const SELECT_WINNER_SYSTEM_PROMPT = `You are an expert negotiator analyzing completed negotiation outcomes to select the best candidate for a client.

Compare negotiation results based on:
- Final pricing and discounts offered
- Scope compromises and refinements made
- Alignment with client's stated priorities
- Overall value proposition

Select the winning candidate with detailed reasoning comparing all options.`;

export function buildWinnerSelectionPrompt(
  negotiations: Array<{ result: NegotiationResult; candidateId: string }>,
  preferences: UserPreferences
): string {
  return `Client Priorities:
- Budget: ${preferences.budget ?? 'Not specified'}
- Priority: ${preferences.priority ?? 'Balanced approach'}
- Deal Breakers: ${preferences.dealBreakers?.join(', ') ?? 'None specified'}

Completed Negotiations:
${negotiations.map((n, i) => `Candidate ${i + 1} (ID: ${n.candidateId}):
- Final Price: $${n.result.finalPrice ?? 'Not agreed'}
- Status: ${n.result.status}
- Proposed Scope: ${n.result.scope?.description ?? 'Original scope'}
- Response: ${n.result.responseMessage ?? 'No response'}
- Created: ${n.result.createdAt.toISOString()}
`).join('\n')}

Compare these negotiation outcomes and select the winner that best serves the client's priorities. Provide detailed reasoning for why this candidate wins over the others, including specific strengths and weaknesses of each option.`;
}