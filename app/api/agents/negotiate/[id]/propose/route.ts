import { NextRequest, NextResponse } from 'next/server';
import { proposeNegotiationResult, NegotiateOptions } from '@/features/agents/negotiation/negotiate';
import { ProposeNegotiationSchema } from '@/features/agents/negotiation/schemas/NegotiationSchemas';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: negotiationId } = await params;
    const rawBody = await request.json();
    const validated = ProposeNegotiationSchema.safeParse(rawBody);

    if (!validated.success) {
      return NextResponse.json({ error: 'Invalid request body', details: validated.error.format() }, { status: 400 });
    }

    const { proposerId, finalPrice, scope } = validated.data;

    const providerType = process.env.USE_MOCK_LLM === 'true' 
      ? 'mock' 
      : (process.env.LLM_PROVIDER === 'openrouter' ? 'openrouter' : 'openai');

    const result = await proposeNegotiationResult(
      negotiationId,
      proposerId,
      finalPrice,
      scope,
      { providerType: providerType as NegotiateOptions['providerType'] }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Propose result error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
