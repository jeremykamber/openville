import { NextRequest, NextResponse } from 'next/server';
import { cancelNegotiation } from '@/features/agents/negotiation/negotiate';
import { CancelNegotiationSchema } from '@/features/agents/negotiation/schemas/NegotiationSchemas';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: negotiationId } = await params;
    const rawBody = await request.json();
    const validated = CancelNegotiationSchema.safeParse(rawBody);

    if (!validated.success) {
      return NextResponse.json({ error: 'Invalid request body', details: validated.error.format() }, { status: 400 });
    }

    const { cancellerId, reason } = validated.data;

    const negotiation = await cancelNegotiation(negotiationId, cancellerId, reason);

    return NextResponse.json({ negotiation });
  } catch (error) {
    console.error('Cancel negotiation error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
