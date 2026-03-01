import { NextRequest, NextResponse } from 'next/server';
import { selectTop3 } from '@/features/agents/selection/selectTop3';
import { SelectTop3Request } from '@/features/agents/selection/types';

export async function POST(request: NextRequest) {
  try {
    const body: SelectTop3Request = await request.json();
    
    const { top10, userPreferences, scope } = body;

    if (!top10 || !Array.isArray(top10) || top10.length < 3) {
      return NextResponse.json(
        { error: 'top10 must be an array with at least 3 candidates' },
        { status: 400 }
      );
    }

    if (!userPreferences) {
      return NextResponse.json(
        { error: 'userPreferences is required' },
        { status: 400 }
      );
    }

    if (!scope) {
      return NextResponse.json(
        { error: 'scope is required' },
        { status: 400 }
      );
    }

    const providerType = process.env.USE_MOCK_LLM === 'true' 
      ? 'mock' 
      : (process.env.LLM_PROVIDER === 'openrouter' ? 'openrouter' : 'openai');
    
    const result = await selectTop3(top10, userPreferences, scope, {
      providerType,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Select top3 error:', error);
    
    const message = error instanceof Error ? error.message : 'Internal server error';
    
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
