import { NextRequest, NextResponse } from 'next/server';
import { selectWinner } from '@/features/agents/selection/selectWinner';
import { NegotiationResult } from '@/features/agents/negotiation/types/NegotiationResult';
import { UserPreferences } from '@/features/agents/selection/types';

interface SelectWinnerRequest {
  negotiations: Array<{ result: NegotiationResult; candidateId: string }>;
  userPreferences: UserPreferences;
  providerType?: 'openai' | 'openrouter' | 'mock';
}

export async function POST(request: NextRequest) {
  try {
    const body: SelectWinnerRequest = await request.json();
    const { negotiations, userPreferences, providerType } = body;

    const result = await selectWinner(negotiations, userPreferences, { providerType });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Select winner error:', error);
    return NextResponse.json(
      { error: 'Failed to select winner' },
      { status: 500 }
    );
  }
}