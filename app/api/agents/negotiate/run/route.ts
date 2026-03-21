import { NextRequest, NextResponse } from "next/server";

import { runNegotiations } from "@/features/agents/negotiation/runNegotiations";
import { RunNegotiationsRequestSchema } from "@/features/shared/schemas/WorkflowSchemas";
import { mergeExecutionMeta, resolveLlmProvider } from "@/features/workflow/server/runtime";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    const validated = RunNegotiationsRequestSchema.safeParse(rawBody);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validated.error.format() },
        { status: 400 },
      );
    }

    const body = validated.data;
    const llm = resolveLlmProvider(body.providerType);
    const outcomes = await runNegotiations({
      ...body,
      providerType: llm.providerType,
    });

    return NextResponse.json({
      outcomes: outcomes.map((outcome) => ({
        ...outcome,
        result: outcome.result
          ? {
              ...outcome.result,
              createdAt: outcome.result.createdAt.toISOString(),
              respondedAt: outcome.result.respondedAt?.toISOString(),
            }
          : undefined,
      })),
      meta: mergeExecutionMeta(llm.meta),
    });
  } catch (error) {
    console.error("Run negotiations error:", error);
    const message = error instanceof Error ? error.message : "Failed to run negotiations";

    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
