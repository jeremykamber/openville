import { NextRequest, NextResponse } from 'next/server';
import { cancelNegotiation } from '@/features/agents/negotiation/negotiate';

interface CancelRequest {
  cancellerId: string;
  reason: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: negotiationId } = await params;
    const body: CancelRequest = await request.json();
    const { cancellerId, reason } = body;

    if (!cancellerId) {
      return NextResponse.json({ error: 'cancellerId is required' }, { status: 400 });
    }
    if (!reason) {
      return NextResponse.json({ error: 'reason is required' }, { status: 400 });
    }

    const negotiation = await cancelNegotiation(negotiationId, cancellerId, reason);

    return NextResponse.json({ negotiation });
  } catch (error) {
    console.error('Cancel negotiation error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
