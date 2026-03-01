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
