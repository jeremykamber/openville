import { BaseMessage } from '@langchain/core/messages';
import { z } from 'zod';

export interface ChatModelOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatModel {
  invoke(
    input: BaseMessage | BaseMessage[],
    options?: ChatModelOptions
  ): Promise<BaseMessage>;
  
  withStructuredOutput<Z extends z.ZodSchema>(
    schema: Z,
    options?: ChatModelOptions
  ): (input: string | BaseMessage | BaseMessage[]) => Promise<z.infer<Z>>;
}
