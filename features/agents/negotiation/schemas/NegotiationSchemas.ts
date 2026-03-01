import { z } from 'zod';

export const CandidateSchema = z.object({
  agentId: z.string(),
  name: z.string(),
  hourlyRate: z.number().optional(),
  description: z.string().optional(),
  specialties: z.array(z.string()).optional(),
});

export const UserPreferencesSchema = z.object({
  budget: z.number().optional(),
  priority: z.enum(['price', 'quality', 'speed']).optional(),
  additionalRequirements: z.string().optional(),
});

export const JobScopeSchema = z.object({
  description: z.string(),
  rooms: z.number().optional(),
});

export const StartNegotiationSchema = z.object({
  buyerAgentId: z.string(),
  candidate: CandidateSchema,
  preferences: UserPreferencesSchema,
  scope: JobScopeSchema,
  jobId: z.string().optional(),
});

export const SendMessageSchema = z.object({
  buyerAgentId: z.string(),
  message: z.string().min(1),
  candidate: CandidateSchema,
  preferences: UserPreferencesSchema,
});

export const ProposeNegotiationSchema = z.object({
  proposerId: z.string(),
  finalPrice: z.number().int().positive(),
  scope: z.object({
    description: z.string().optional(),
    rooms: z.number().int().positive().optional(),
  }),
});

export const CancelNegotiationSchema = z.object({
  cancellerId: z.string(),
  reason: z.string().min(1),
});

export const NegotiationMessageSchema = z.object({
  negotiationId: z.string().uuid(),
  sender: z.string(),
  senderType: z.enum(['buyer', 'provider']),
  content: z.string().min(1),
  messageType: z.enum(['message', 'proposal', 'cancellation']).default('message'),
});

export const NegotiationResultSchema = z.object({
  negotiationId: z.string().uuid(),
  proposedBy: z.string(),
  finalPrice: z.number().int().positive().optional(),
  scope: z.object({
    description: z.string().optional(),
    rooms: z.number().int().positive().optional(),
    details: z.record(z.string(), z.unknown()).optional(),
  }).optional(),
});

export const NegotiationResultResponseSchema = z.object({
  status: z.enum(['accepted', 'rejected']),
  responseMessage: z.string().optional(),
});

export type NegotiationMessageInput = z.infer<typeof NegotiationMessageSchema>;
export type NegotiationResultInput = z.infer<typeof NegotiationResultSchema>;
export type NegotiationResultResponse = z.infer<typeof NegotiationResultResponseSchema>;
