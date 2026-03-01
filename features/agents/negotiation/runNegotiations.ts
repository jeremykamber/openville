import { SelectedCandidate, UserPreferences, JobScope } from '../selection/types';
import { startNegotiation, NegotiateOptions, proposeNegotiationResult } from './negotiate';
import { NegotiationStatus } from './types';
import { NegotiationResult } from './types/NegotiationResult';

export interface RunNegotiationsOptions {
  buyerAgentId: string;
  candidates: SelectedCandidate[];
  preferences: UserPreferences;
  scope: JobScope;
  jobId?: string;
  providerType?: NegotiateOptions['providerType'];
  maxRounds?: number;
}

export interface NegotiationOutcome {
  negotiationId: string;
  candidateId: string;
  status: 'completed' | 'cancelled' | 'failed' | NegotiationStatus;
  result?: NegotiationResult;
  summary?: string;
}

export async function runNegotiations(
  options: RunNegotiationsOptions
): Promise<NegotiationOutcome[]> {
  const { buyerAgentId, candidates, preferences, scope, jobId, providerType } = options;
  const outcomes: NegotiationOutcome[] = [];

  for (const selected of candidates) {
    try {
      const negotiation = await startNegotiation(
        buyerAgentId,
        selected.candidate,
        preferences,
        scope,
        jobId,
        { providerType }
      );

      // Complete negotiation with proposal from buyer
      const estimatedPrice = (scope as { estimatedPrice?: number }).estimatedPrice || 500; // Assuming scope has estimatedPrice
      const proposalResult = await proposeNegotiationResult(
        negotiation.id,
        buyerAgentId,
        estimatedPrice,
        { description: (scope as { description?: string }).description, rooms: (scope as { rooms?: number }).rooms },
        { providerType }
      );

      outcomes.push({
        negotiationId: negotiation.id,
        candidateId: selected.candidate.agentId,
        status: proposalResult.accepted ? 'completed' : 'failed',
        result: proposalResult.result,
        summary: proposalResult.response,
      });
    } catch (error) {
      console.error(`Negotiation failed for candidate ${selected.candidate.agentId}:`, error);
      outcomes.push({
        negotiationId: '',
        candidateId: selected.candidate.agentId,
        status: 'failed',
        summary: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return outcomes;
}
