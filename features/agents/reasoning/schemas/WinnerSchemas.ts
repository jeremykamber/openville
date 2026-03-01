import { z } from 'zod';

export const SelectWinnerLLMResponseSchema = z.object({
  winner: z.object({
    candidateId: z.string(),
    reasoning: z.string(),
    confidence: z.number().min(0).max(1),
  }),
  comparison: z.array(z.object({
    candidateId: z.string(),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    priorityAlignment: z.number().min(0).max(1),
  })),
  summary: z.string(),
});

export type SelectWinnerLLMResponse = z.infer<typeof SelectWinnerLLMResponseSchema>;