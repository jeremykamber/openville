import { NextRequest, NextResponse } from 'next/server';
import { proposeNegotiationResult } from '@/features/agents/negotiation/negotiate';

interface ProposeResultRequest {
  proposerId: string;
  finalPrice: number;
  scope: {
    description?: string;
    rooms?: number;
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: negotiationId } = await params;
    const body: ProposeResultRequest = await request.json();
    const { proposerId, finalPrice, scope } = body;

    if (!proposerId) {
      return NextResponse.json({ error: 'proposerId is required' }, { status: 400 });
    }
    if (!finalPrice || finalPrice <= 0) {
      return NextResponse.json({ error: 'finalPrice must be a positive number' }, { status: 400 });
    }

    const providerType = (process.env.USE_MOCK_LLM === 'true' 
      ? 'mock' 
      : (process.env.LLM_PROVIDER === 'openrouter' ? 'openrouter' : 'openai')) as 'openai' | 'openrouter' | 'mock';

    const result = await proposeNegotiationResult(
      negotiationId,
      proposerId,
      finalPrice,
      scope,
      { providerType }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Propose result error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
