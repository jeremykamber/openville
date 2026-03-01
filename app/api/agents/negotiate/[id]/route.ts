import { NextRequest, NextResponse } from 'next/server';
import { getNegotiation, getMessages } from '@/features/agents/negotiation/db/negotiations';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: negotiationId } = await params;
    const negotiation = await getNegotiation(negotiationId);

    if (!negotiation) {
      return NextResponse.json({ error: 'Negotiation not found' }, { status: 404 });
    }

    const messages = await getMessages(negotiationId);

    return NextResponse.json({ negotiation, messages });
  } catch (error) {
    console.error('Get negotiation error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
