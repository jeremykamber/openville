import { z } from 'zod';
import {
  CandidateSchema,
  JobScopeSchema,
  TransportNegotiationResultSchema,
  TransportNegotiationScopeSchema,
  UserPreferencesSchema,
} from '@/features/shared/schemas/WorkflowSchemas';

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
  scope: TransportNegotiationScopeSchema,
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

export const NegotiationResultSchema = TransportNegotiationResultSchema.omit({
  id: true,
  status: true,
  createdAt: true,
  respondedAt: true,
  responseMessage: true,
}).extend({
  negotiationId: z.string().uuid(),
});

export const NegotiationResultResponseSchema = z.object({
  status: z.enum(['accepted', 'rejected']),
  responseMessage: z.string().optional(),
});

export type NegotiationMessageInput = z.infer<typeof NegotiationMessageSchema>;
export type NegotiationResultInput = z.infer<typeof NegotiationResultSchema>;
export type NegotiationResultResponse = z.infer<typeof NegotiationResultResponseSchema>;
