import { z } from 'zod';

export const SelectedCandidateSchema = z.object({
  agentId: z.string(),
  reasoning: z.string(),
  matchScore: z.number().min(0).max(100),
});

export const SelectTop3LLMResponseSchema = z
  .object({
    top3: z.array(SelectedCandidateSchema).length(3, {
      message: 'top3 must contain exactly 3 candidates',
    }),
    summary: z.string(),
  })
  .superRefine((value, ctx) => {
    const seen = new Set<string>();
    value.top3.forEach((candidate, index) => {
      if (seen.has(candidate.agentId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'agentId values in top3 must be unique',
          path: ['top3', index, 'agentId'],
        });
      } else {
        seen.add(candidate.agentId);
      }
    });
  });

export type SelectTop3LLMResponse = z.infer<typeof SelectTop3LLMResponseSchema>;
