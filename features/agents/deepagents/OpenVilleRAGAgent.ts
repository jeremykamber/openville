import { createDeepAgent, SubAgent } from 'deepagents';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import {
  openVilleSearchAndSelectTool,
  openVilleSelectTop3Tool,
  openVilleNegotiateRunTool,
  openVilleNegotiateActionTool,
  openVilleSelectWinnerTool
} from '../tools';

const DEFAULT_MODEL = "gpt-4o";

export class OpenVilleRAGAgent {
  public agent: any;

  constructor(options: { model?: string } = {}) {
    const model = new ChatOpenAI({
      modelName: options.model || "minimax/minimax-m2.5",
      temperature: 0,
      apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY,
      configuration: {
        baseURL: "https://openrouter.ai/api/v1",
      },
    });

    const negotiationSubagent: SubAgent = {
      name: 'negotiation-handler',
      description: 'Specialized agent for handling a single negotiation with a candidate using negotiation tools (run, action, etc.)',
      systemPrompt: `You are a specialized negotiation subagent.
Your goal is to handle the negotiation process for a single candidate.
You have access to the openville-negotiate-run and openville-negotiate-action tools.

ID REQUIREMENTS:
- For buyerAgentId, you can use "buyer-001".
- For candidate objects, you MUST ensure they include "agentId" and "name".
- For scope objects, you MUST include "jobType" (e.g. plumbing) and "description".
- Use a UUID for jobId if not provided (e.g. "a1b2c3d4-e5f6-7890-abcd-ef1234567890").

WORKFLOW:
1. First start the negotiation using openville-negotiate-run.
2. Then use openville-negotiate-action with action="reply" to chat.
3. Once terms are discussed, use openville-negotiate-action with action="propose" to finalize.
   - For action="propose", you MUST provide "finalPrice" and "scope" (with a description).
4. Continue until the negotiation is completed (either accepted or rejected).
Return the final negotiation result.`,
      tools: [openVilleNegotiateRunTool as any, openVilleNegotiateActionTool as any],
      model: model as any,
    };

    const orchestratorTools = [
      openVilleSearchAndSelectTool,
      openVilleSelectTop3Tool,
      openVilleSelectWinnerTool
    ];

    this.agent = createDeepAgent({
      model: model as any,
      tools: orchestratorTools as any,
      subagents: [negotiationSubagent],
      systemPrompt: `You are the OpenVille RAG Agent Orchestrator.
Your job is to follow a specific workflow:
1. Use openville-search-and-select to find the top 10 candidates based on the job description.
2. Use openville-select-top3 to select the top 3 candidates.
3. For each of the top 3 candidates sequentially, spawn the "negotiation-handler" task to negotiate with them. Provide the candidate ID, name, and the job description to the negotiation-handler. Do this one at a time.
4. Once all 3 negotiations are complete, gather the direct outputs from those 3 subagents into a single array. Use the openville-select-winner tool, passing that array exactly as it is into the "negotiations" parameter.

When calling tools, you MUST strictly follow these schema rules:
- Any "budget" field in userPreferences MUST be a NUMBER (e.g., 200, not "200").
- Any "scope" object MUST include a "jobType" field (e.g., "plumbing", "painting") and a "description" field.
- Always pass the job description as part of the "scope" object.
- If "scope" or "userPreferences" are not clearly provided by the user, you must infer them from the description or pass an empty object {} if absolutely necessary, but DO NOT omit required fields like "jobType".
If you receive an error about "Received tool input did not match expected schema", look at the required fields carefully, fix the mistakes in your JSON geometry, and try calling the tool again with the corrected schema.
Return the final winner and the transaction details.`,
    });
  }

  async runWorkflow(jobDescription: string, userPreferences: any = {}) {
    const inputs = {
      messages: [
        new HumanMessage({
          content: `Please execute the OpenVille RAG workflow for the following job description: "${jobDescription}".
User Preferences: ${JSON.stringify(userPreferences)}`
        })
      ]
    };

    const result = await this.agent.invoke(inputs);
    return result;
  }
}

export const agent = new OpenVilleRAGAgent().agent;
