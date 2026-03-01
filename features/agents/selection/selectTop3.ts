import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { createChatModel } from '../reasoning/providers';
import { 
  Candidate, 
  UserPreferences, 
  JobScope, 
  SelectTop3Response,
  SelectedCandidate 
} from './types';
import { 
  SELECT_TOP3_SYSTEM_PROMPT, 
  buildSelectionUserPrompt 
} from '../reasoning/prompts/selectionPrompts';
import { SelectTop3LLMResponseSchema } from '../reasoning/schemas/SelectionSchemas';

export interface SelectTop3Options {
  providerType?: 'openai' | 'openrouter' | 'mock';
  temperature?: number;
}

export async function selectTop3(
  candidates: Candidate[],
  preferences: UserPreferences,
  scope: JobScope,
  options: SelectTop3Options = {}
): Promise<SelectTop3Response> {
  if (candidates.length < 3) {
    throw new Error('At least 3 candidates required for selection');
  }

  if (options.providerType === 'mock') {
    const top3 = [...candidates]
      .sort((left, right) => right.score - left.score)
      .slice(0, 3)
      .map((candidate, index) => ({
        candidate,
        reasoning:
          preferences.priority === 'cost'
            ? `${candidate.name} stayed near the top because their pricing signals align with the cost priority.`
            : `${candidate.name} remained in the shortlist because they score strongly for the requested job scope.`,
        matchScore: Math.max(60, Math.round((candidate.score || 0) * 100) - index * 3),
      }));

    return {
      top3,
      summary: `Mock fallback selected the top ${top3.length} candidates using deterministic score ordering for ${scope.jobType}.`,
    };
  }

  const model = createChatModel(options.providerType ?? 'openai');
  const userPrompt = buildSelectionUserPrompt(candidates, preferences, scope);

  const structuredOutput = model.withStructuredOutput(SelectTop3LLMResponseSchema, {
    temperature: options.temperature ?? 0.7,
  });

  const llmResponse = await structuredOutput([
    new SystemMessage(SELECT_TOP3_SYSTEM_PROMPT),
    new HumanMessage(userPrompt),
  ]);

  const candidateMap = new Map(candidates.map(c => [c.agentId, c]));
  
  const top3: SelectedCandidate[] = llmResponse.top3.map(item => {
    const candidate = candidateMap.get(item.agentId);
    if (!candidate) {
      throw new Error(`Invalid agentId in LLM response: ${item.agentId}`);
    }
    return {
      candidate,
      reasoning: item.reasoning,
      matchScore: item.matchScore,
    };
  });

  return {
    top3,
    summary: llmResponse.summary,
  };
}
