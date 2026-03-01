import { NextRequest, NextResponse } from 'next/server';
import { startNegotiation } from '@/features/agents/negotiation/negotiate';
import { getMessages } from '@/features/agents/negotiation/db/negotiations';
import { Candidate, UserPreferences, JobScope } from '@/features/agents/selection/types';

interface StartNegotiationRequest {
  buyerAgentId: string;
  candidate: Candidate;
  preferences: UserPreferences;
  scope: JobScope;
  jobId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: StartNegotiationRequest = await request.json();
    const { buyerAgentId, candidate, preferences, scope, jobId } = body;

    if (!buyerAgentId) {
      return NextResponse.json({ error: 'buyerAgentId is required' }, { status: 400 });
    }
    if (!candidate?.agentId) {
      return NextResponse.json({ error: 'candidate with agentId is required' }, { status: 400 });
    }
    if (!preferences) {
      return NextResponse.json({ error: 'preferences is required' }, { status: 400 });
    }
    if (!scope) {
      return NextResponse.json({ error: 'scope is required' }, { status: 400 });
    }

    const providerType = (process.env.USE_MOCK_LLM === 'true' 
      ? 'mock' 
      : (process.env.LLM_PROVIDER === 'openrouter' ? 'openrouter' : 'openai')) as 'openai' | 'openrouter' | 'mock';

    const negotiation = await startNegotiation(
      buyerAgentId, 
      candidate, 
      preferences, 
      scope, 
      jobId,
      { providerType }
    );

    const messages = await getMessages(negotiation.id);

    return NextResponse.json({ negotiation, messages });
  } catch (error) {
    console.error('Start negotiation error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
