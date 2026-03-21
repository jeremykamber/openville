import { describe, it, expect, vi } from 'vitest';
import { OpenVilleRAGAgent } from './OpenVilleRAGAgent';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage } from '@langchain/core/messages';

vi.mock('@langchain/openai', () => {
  return {
    ChatOpenAI: vi.fn().mockImplementation(function(this: any, args: any) {
      this.modelName = args?.modelName;
      this.invoke = vi.fn().mockResolvedValue({
        content: 'Mocked response'
      });
    })
  };
});

describe('OpenVilleRAGAgent', () => {
  it('instantiates successfully with default model', () => {
    const agent = new OpenVilleRAGAgent();
    expect(agent).toBeDefined();
    expect(agent.agent).toBeDefined();
  });

  it('instantiates with custom model option', () => {
    const agent = new OpenVilleRAGAgent({ model: 'gpt-4' });
    expect(agent).toBeDefined();
    expect(ChatOpenAI).toHaveBeenCalledWith(expect.objectContaining({
      modelName: 'gpt-4'
    }));
  });

  it('runs workflow with given job description', async () => {
    const agent = new OpenVilleRAGAgent();
    
    // Mock the invoke method on the deepagent instance
    agent.agent.invoke = vi.fn().mockResolvedValue({
      messages: [
        new HumanMessage('Please execute...'),
        {
          role: 'assistant',
          content: 'The final winner is Mock Candidate.'
        }
      ]
    });

    const result = await agent.runWorkflow('Need a React developer', { budget: 100 });
    
    expect(agent.agent.invoke).toHaveBeenCalled();
    expect(result.messages.length).toBe(2);
    expect(result.messages[1].content).toContain('Mock Candidate');
  });
});
