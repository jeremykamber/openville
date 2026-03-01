import { ChatModel } from './ChatModel';
import { OpenAIChatModel } from './OpenAIChatModel';
import { OpenRouterChatModel } from './OpenRouterChatModel';
import { BaseMessage } from '@langchain/core/messages';
import { z } from 'zod';

export type ProviderType = 'openai' | 'openrouter' | 'anthropic' | 'mock';

export function createChatModel(type: ProviderType = 'openai'): ChatModel {
  switch (type) {
    case 'openai':
      return new OpenAIChatModel();
    case 'openrouter':
      return new OpenRouterChatModel();
    case 'mock':
      return createMockChatModel();
    default:
      return new OpenAIChatModel();
  }
}

function createMockChatModel(): ChatModel {
  return {
    async invoke(input: BaseMessage | BaseMessage[]): Promise<BaseMessage> {
      console.log('[Mock] Input:', 
        Array.isArray(input) 
          ? input.map(m => m.content).join('\n')
          : input.content
      );
      return { 
        content: '{"error": "Mock - implement for tests"}',
        type: 'ai' 
      } as unknown as BaseMessage;
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    withStructuredOutput<Z extends z.ZodSchema>(_schema: Z) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      return async (_input: string | BaseMessage | BaseMessage[]) => {
        throw new Error(
          "MockChatModel.withStructuredOutput is not implemented. " +
          "Avoid using the 'mock' provider for structured output, or provide a test-specific implementation."
        );
      };
    }
  };
}

export * from './ChatModel';
export * from './OpenAIChatModel';
export * from './OpenRouterChatModel';
