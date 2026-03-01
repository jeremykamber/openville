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
      return async (input: string | BaseMessage | BaseMessage[]) => {
        const content = Array.isArray(input) 
          ? input.map(m => m.content).join('\n')
          : typeof input === 'string' ? input : input.content;
        console.log('[Mock] Structured input:', content);
        return {} as unknown as z.infer<Z>;
      };
    }
  };
}

export * from './ChatModel';
export * from './OpenAIChatModel';
export * from './OpenRouterChatModel';
