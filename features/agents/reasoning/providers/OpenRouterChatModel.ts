import OpenAI from 'openai';
import { BaseMessage, HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';
import { ChatModel, ChatModelOptions } from './ChatModel';
import { z } from 'zod';
import type { ChatCompletionMessageParam } from 'openai/resources/index';

export class OpenRouterChatModel implements ChatModel {
  private client: OpenAI;
  private model: string;

  constructor(apiKey?: string, model = 'qwen/qwen3-30b-a3b') {
    this.client = new OpenAI({
      apiKey: apiKey ?? process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
    });
    this.model = model;
  }

  async invoke(
    input: BaseMessage | BaseMessage[],
    options?: ChatModelOptions
  ): Promise<BaseMessage> {
    const messages = Array.isArray(input) 
      ? input 
      : [input];
    
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: messages.map(m => ({
        role: m instanceof SystemMessage ? 'system' 
          : m instanceof HumanMessage ? 'user'
          : m instanceof AIMessage ? 'assistant'
          : 'user',
        content: m.content,
      })) as ChatCompletionMessageParam[],
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 1000,
    });

    const content = response.choices[0]?.message?.content ?? '';
    return new AIMessage(content);
  }

  withStructuredOutput<Z extends z.ZodSchema>(
    schema: Z,
    options?: ChatModelOptions
  ): (input: string | BaseMessage | BaseMessage[]) => Promise<z.infer<Z>> {
    return async (input: string | BaseMessage | BaseMessage[]): Promise<z.infer<Z>> => {
      let messages: { role: string; content: string }[];
      
      if (Array.isArray(input)) {
        messages = input.map(m => ({
          role: m instanceof SystemMessage ? 'system' 
            : m instanceof HumanMessage ? 'user'
            : m instanceof AIMessage ? 'assistant'
            : 'user',
          content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
        }));
      } else if (typeof input === 'string') {
        messages = [{ role: 'user', content: input }];
      } else {
        messages = [{
          role: input instanceof SystemMessage ? 'system' 
            : input instanceof HumanMessage ? 'user'
            : 'assistant',
          content: typeof input.content === 'string' ? input.content : JSON.stringify(input.content),
        }];
      }
      
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: messages as ChatCompletionMessageParam[],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content ?? '{}';
      return JSON.parse(content) as z.infer<Z>;
    };
  }
}
