import { NextRequest, NextResponse } from 'next/server';
import { sendBuyerMessage } from '@/features/agents/negotiation/negotiate';
import { Candidate, UserPreferences } from '@/features/agents/selection/types';

interface SendMessageRequest {
  buyerAgentId: string;
  message: string;
  candidate: Candidate;
  preferences: UserPreferences;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: negotiationId } = await params;
    const body: SendMessageRequest = await request.json();
    const { buyerAgentId, message, candidate, preferences } = body;

    if (!buyerAgentId) {
      return NextResponse.json({ error: 'buyerAgentId is required' }, { status: 400 });
    }
    if (!message) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    const providerType = process.env.USE_MOCK_LLM === 'true' 
      ? 'mock' 
      : (process.env.LLM_PROVIDER === 'openrouter' ? 'openrouter' : 'openai');

    const result = await sendBuyerMessage(
      negotiationId,
      buyerAgentId,
      message,
      candidate,
      preferences,
      { providerType: providerType as any }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Send message error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
