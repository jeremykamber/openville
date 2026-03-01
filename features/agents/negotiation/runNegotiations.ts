import { SelectedCandidate, UserPreferences, JobScope } from '../selection/types';
import { startNegotiation } from './negotiate';

export interface RunNegotiationsOptions {
  buyerAgentId: string;
  candidates: SelectedCandidate[];
  preferences: UserPreferences;
  scope: JobScope;
  jobId?: string;
  providerType?: 'openai' | 'openrouter' | 'mock';
}

export interface NegotiationOutcome {
  negotiationId: string;
  candidateId: string;
  status: 'initiated' | 'failed';
  error?: string;
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
        status: 'initiated',
      });
    } catch (error) {
      console.error(`Failed to start negotiation for candidate ${selected.candidate.agentId}:`, error);
      outcomes.push({
        negotiationId: '',
        candidateId: selected.candidate.agentId,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return outcomes;
}
