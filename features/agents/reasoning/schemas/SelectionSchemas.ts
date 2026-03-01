import { z } from 'zod';

export const SelectedCandidateSchema = z.object({
  agentId: z.string(),
  reasoning: z.string(),
  matchScore: z.number().min(0).max(100),
});

export const SelectTop3LLMResponseSchema = z.object({
  top3: z.array(SelectedCandidateSchema),
  summary: z.string(),
});

export type SelectTop3LLMResponse = z.infer<typeof SelectTop3LLMResponseSchema>;
