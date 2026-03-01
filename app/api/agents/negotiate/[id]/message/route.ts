import { NextRequest, NextResponse } from 'next/server';
import { sendBuyerMessage, NegotiateOptions } from '@/features/agents/negotiation/negotiate';
import { SendMessageSchema } from '@/features/agents/negotiation/schemas/NegotiationSchemas';
import { Candidate, UserPreferences } from '@/features/agents/selection/types';
import { resolveLlmProvider } from '@/features/workflow/server/runtime';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: negotiationId } = await params;
    const rawBody = await request.json();
    const validated = SendMessageSchema.safeParse(rawBody);

    if (!validated.success) {
      return NextResponse.json({ error: 'Invalid request body', details: validated.error.format() }, { status: 400 });
    }

    const { buyerAgentId, message, candidate, preferences } = validated.data;

    const llm = resolveLlmProvider();

    const result = await sendBuyerMessage(
      negotiationId,
      buyerAgentId,
      message,
      candidate as Candidate,
      preferences as UserPreferences,
      { providerType: llm.providerType as NegotiateOptions['providerType'] }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Send message error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
