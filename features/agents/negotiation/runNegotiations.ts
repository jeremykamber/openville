import { SelectedCandidate, UserPreferences, JobScope } from '../selection/types';
import { startNegotiation, NegotiateOptions, proposeNegotiationResult, sendBuyerMessage } from './negotiate';
import { NegotiationOutcomeTransport, NegotiationResult } from './types';

export interface RunNegotiationsOptions {
  buyerAgentId: string;
  candidates: SelectedCandidate[];
  preferences: UserPreferences;
  scope: JobScope;
  jobId?: string;
  providerType?: NegotiateOptions['providerType'];
  maxRounds?: number;
}

export interface NegotiationOutcome extends Omit<NegotiationOutcomeTransport, 'result'> {
  result?: NegotiationResult;
}

function deriveProposalPrice(
  candidate: SelectedCandidate['candidate'],
  preferences: UserPreferences,
): number | null {
  const proposed = preferences.budget ?? candidate.basePrice ?? candidate.hourlyRate;

  if (typeof proposed !== 'number' || !Number.isFinite(proposed) || proposed <= 0) {
    return null;
  }

  return Math.round(proposed);
}

function buildRoundMessage(
  round: number,
  preferences: UserPreferences,
  scope: JobScope,
): string {
  const priority =
    preferences.priority === 'cost'
      ? 'keep the final price efficient'
      : preferences.priority === 'speed'
        ? 'keep the schedule fast'
        : 'protect quality';

  return `Round ${round}: please continue refining the offer for ${scope.description} and ${priority}.`;
}

export async function runNegotiations(
  options: RunNegotiationsOptions
): Promise<NegotiationOutcome[]> {
  const {
    buyerAgentId,
    candidates,
    preferences,
    scope,
    jobId,
    providerType,
    maxRounds = 1,
  } = options;
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

      for (let round = 2; round <= maxRounds; round += 1) {
        await sendBuyerMessage(
          negotiation.id,
          buyerAgentId,
          buildRoundMessage(round, preferences, scope),
          selected.candidate,
          preferences,
          { providerType },
        );
      }

      const proposalPrice = deriveProposalPrice(selected.candidate, preferences);

      if (proposalPrice === null) {
        outcomes.push({
          negotiationId: negotiation.id,
          candidateId: selected.candidate.agentId,
          status: 'failed',
          summary: 'Unable to derive a proposal price from preferences or candidate pricing.',
        });
        continue;
      }

      const proposalResult = await proposeNegotiationResult(
        negotiation.id,
        buyerAgentId,
        proposalPrice,
        { description: scope.description, rooms: scope.rooms },
        { providerType }
      );

      outcomes.push({
        negotiationId: negotiation.id,
        candidateId: selected.candidate.agentId,
        status: proposalResult.accepted ? 'completed' : 'rejected',
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
