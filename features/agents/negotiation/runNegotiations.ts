import { SelectedCandidate, UserPreferences, JobScope } from '../selection/types';
import { startNegotiation } from './negotiate';

export interface RunNegotiationsOptions {
  buyerAgentId: string;
  candidates: SelectedCandidate[];
  preferences: UserPreferences;
  scope: JobScope;
  jobId?: string;
  providerType?: 'openai' | 'openrouter' | 'mock';
  maxRounds?: number;
}

export interface NegotiationOutcome {
  negotiationId: string;
  candidateId: string;
  status: 'completed' | 'cancelled' | 'failed';
  finalPrice?: number;
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

      outcomes.push({
        negotiationId: negotiation.id,
        candidateId: selected.candidate.agentId,
        status: negotiation.status === 'active' ? 'completed' : (negotiation.status as any),
        summary: negotiation.summary,
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
