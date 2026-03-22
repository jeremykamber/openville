import { NextRequest, NextResponse } from "next/server";
import { SearchAndSelectRequestSchema } from "@/features/shared/schemas/WorkflowSchemas";
import { executeSearchAndSelect } from "@/features/workflow/server/executeSearchAndSelect";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    const validated = SearchAndSelectRequestSchema.safeParse(rawBody);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid workflow request", details: validated.error.format() },
        { status: 400 },
      );
    }

    const body = validated.data;
    const response = await executeSearchAndSelect(body);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Search and select error:", error);

    const message = error instanceof Error ? error.message : "Internal server error";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
