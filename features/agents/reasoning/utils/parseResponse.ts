import { z } from 'zod';
import type { ZodError } from 'zod';
import { SelectTop3LLMResponseSchema, SelectTop3LLMResponse } from '../schemas/SelectionSchemas';

export class ResponseParseError extends Error {
  constructor(
    message: string, 
    public readonly rawResponse: string,
    public readonly cause?: ZodError
  ) {
    super(message);
    this.name = 'ResponseParseError';
  }
}

export function parseSelectionResponse(rawResponse: string): SelectTop3LLMResponse {
  try {
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    return SelectTop3LLMResponseSchema.parse(parsed);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const zodErr = error as z.ZodError;
      throw new ResponseParseError(
        `Invalid response structure: ${zodErr.issues.map((e) => e.message).join(', ')}`,
        rawResponse,
        zodErr
      );
    }
    if (error instanceof ResponseParseError) {
      throw error;
    }
    throw new ResponseParseError(
      `Failed to parse response: ${error instanceof Error ? error.message : 'Unknown error'}`,
      rawResponse
    );
  }
}
