import { z } from 'zod';

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
