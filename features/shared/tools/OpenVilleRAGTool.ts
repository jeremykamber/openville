import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function execCLI(command: string, options: any, baseUrl?: string): Promise<any> {
  const cliPath = 'node scripts/tooling/openville-cli.js';
  const dataJson = JSON.stringify(options);
  const baseArg = baseUrl ? `--base ${baseUrl}` : '';
  const fullCommand = `${cliPath} ${command} --data '${dataJson.replace(/'/g, "'\\''")}' ${baseArg}`;

  try {
    const { stdout } = await execAsync(fullCommand, { maxBuffer: 10 * 1024 * 1024 });
    return JSON.parse(stdout.trim());
  } catch (error: any) {
    if (error.stderr) {
      try {
        return JSON.parse(error.stderr.trim());
      } catch {
        throw new Error(`CLI error: ${error.stderr || error.message}`);
      }
    }
    throw error;
  }
}

export const openVilleSearchAndSelectTool = tool(
  async ({ query, userPreferences, scope }) => {
    const options = { query, userPreferences, scope };
    const result = await execCLI('search-and-select', options);
    return JSON.stringify(result);
  },
  {
    name: 'openville-search-and-select',
    description: 'Search and select top 10 candidates for a job using OpenVille RAG. Returns candidates for further processing.',
    schema: z.object({
      query: z.string().describe('Search query string'),
      userPreferences: z.record(z.any()).optional().describe('User preferences object. budget MUST be a number.'),
      scope: z.record(z.any()).optional().describe('Job scope object. MUST include "jobType" (e.g., plumbing) and "description".')
    })
  }
);

export const openVilleSelectTop3Tool = tool(
  async ({ top10, userPreferences, scope }) => {
    const options = { top10, userPreferences, scope };
    const result = await execCLI('select-top3', options);
    return JSON.stringify(result);
  },
  {
    name: 'openville-select-top3',
    description: 'Select top 3 candidates from a list of top 10 candidates based on user preferences and scope.',
    schema: z.object({
      top10: z.array(z.record(z.any())).describe('Array of full candidate objects from search results'),
      userPreferences: z.record(z.any()).optional().describe('User preferences object. budget MUST be a number.'),
      scope: z.record(z.any()).optional().describe('Job scope object. MUST include "jobType" (e.g., plumbing) and "description".')
    })
  }
);

export const openVilleNegotiateRunTool = tool(
  async ({ buyerAgentId, candidate, preferences, scope, jobId }) => {
    const options = { buyerAgentId, candidate, preferences, scope, jobId };
    const result = await execCLI('negotiate-run', options);
    return JSON.stringify(result);
  },
  {
    name: 'openville-negotiate-run',
    description: 'Start a negotiation session with a specific candidate for a job. Returns a negotiation session and initial messages.',
    schema: z.object({
      buyerAgentId: z.string().describe('ID of the buyer agent (you)'),
      candidate: z.record(z.any()).describe('Full candidate object to negotiate with. MUST include agentId and name.'),
      preferences: z.record(z.any()).optional().describe('User preferences for the negotiation'),
      scope: z.record(z.any()).optional().describe('Job scope description. MUST include jobType and description.'),
      jobId: z.string().optional()
    })
  }
);

export const openVilleNegotiateActionTool = tool(
  async ({ negotiationId, action, buyerAgentId, message, candidate, preferences, finalPrice, scope }) => {
    const options: any = { negotiationId, action, candidate, preferences, finalPrice, scope };

    // Map buyerAgentId to the specific field the backend expects for each action
    if (action === 'reply') options.buyerAgentId = buyerAgentId;
    else if (action === 'propose') options.proposerId = buyerAgentId;
    else if (action === 'cancel') options.cancellerId = buyerAgentId;
    // Add message/reason if applicable
    if (message) {
      if (action === 'cancel') options.reason = message;
      else options.message = message;
    }

    const result = await execCLI('negotiate-action', options);
    return JSON.stringify(result);
  },
  {
    name: 'openville-negotiate-action',
    description: 'Perform a specific action during an ongoing negotiation: reply (message), propose (accept/reject), or cancel.',
    schema: z.object({
      negotiationId: z.string().describe('ID of the active negotiation session'),
      action: z.enum(['reply', 'propose', 'cancel']).describe('The action to perform'),
      buyerAgentId: z.string().describe('Your buyer agent ID (used as proposerId or cancellerId if needed)'),
      message: z.string().optional().describe('Message text (required for reply/cancel)'),
      candidate: z.record(z.any()).optional().describe('Full candidate object (required for reply)'),
      preferences: z.record(z.any()).optional().describe('User preferences (required for reply)'),
      finalPrice: z.number().optional().describe('Final price (required for propose)'),
      scope: z.record(z.any()).optional().describe('Proposed scope (required for propose)')
    }).passthrough()
  }
);

export const openVilleSelectWinnerTool = tool(
  async ({ negotiations, userPreferences }) => {
    const options = { negotiations, userPreferences };
    const result = await execCLI('select-winner', options);
    return JSON.stringify(result);
  },
  {
    name: 'openville-select-winner',
    description: 'Select the final winner from completed negotiation results.',
    schema: z.object({
      negotiations: z.array(z.record(z.any())).describe('Array of the final negotiation result objects returned from the negotiation subagents'),
      userPreferences: z.record(z.any()).optional().describe('User preferences used for selection')
    }).passthrough()
  }
);
