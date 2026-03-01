import { NextRequest, NextResponse } from 'next/server';
import { selectTop3 } from '@/features/agents/selection/selectTop3';
import { SelectTop3RequestSchema } from '@/features/shared/schemas/WorkflowSchemas';
import { resolveLlmProvider } from '@/features/workflow/server/runtime';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    const validated = SelectTop3RequestSchema.safeParse(rawBody);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validated.error.format() },
        { status: 400 }
      );
    }

    const { top10, userPreferences, scope } = validated.data;
    const llm = resolveLlmProvider();

    const result = await selectTop3(top10, userPreferences, scope, {
      providerType: llm.providerType,
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
