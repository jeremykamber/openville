import { NextRequest, NextResponse } from 'next/server';
import { startNegotiation, NegotiateOptions } from '@/features/agents/negotiation/negotiate';
import { defaultNegotiationRepository as repo } from '@/features/agents/negotiation/db/SupabaseNegotiationRepository';
import { StartNegotiationSchema } from '@/features/agents/negotiation/schemas/NegotiationSchemas';
import { Candidate, UserPreferences, JobScope } from '@/features/agents/selection/types';
import { resolveLlmProvider } from '@/features/workflow/server/runtime';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    const validated = StartNegotiationSchema.safeParse(rawBody);
    
    if (!validated.success) {
      return NextResponse.json({ error: 'Invalid request body', details: validated.error.format() }, { status: 400 });
    }

    const { buyerAgentId, candidate, preferences, scope, jobId } = validated.data;

    const llm = resolveLlmProvider();

    const negotiation = await startNegotiation(
      buyerAgentId, 
      candidate as Candidate, 
      preferences as UserPreferences, 
      scope as JobScope, 
      jobId,
      { providerType: llm.providerType as NegotiateOptions['providerType'] }
    );

    const messages = await repo.getMessages(negotiation.id);

    return NextResponse.json({ negotiation, messages });
  } catch (error) {
    console.error('Start negotiation error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
