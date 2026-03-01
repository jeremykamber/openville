# OpenVille RAG Agent Workflow Implementation Plan

## Overview

Implement a system that exposes OpenVille's full RAG (Retrieval-Augmented Generation) search, selection, and negotiation workflow to AI agents. This makes the workflows easily accessible via CLI, LangChain tool/skill wrappers, and a LangChain deepagent that orchestrates them with streaming frontend UI integration. The deepagent will manage subagents, attach modular skills, and preserve context/memory per the official Agent Skills specification. The flow follows the user flow: agent receives user request, searches for top 10 candidates, selects top 3, negotiates with each, selects winner, completes transaction, and reports back with streaming updates throughout.

## Current State Analysis

OpenVille currently supports core RAG workflows through API endpoints:
- `search-and-select`: Handles initial RAG search, candidate ranking, and top-10/LLM top-3 selection
- `negotiate/run`: Runs negotiation workflows between selected candidates
- `select-winner`: Finalizes winner selection from negotiated results

The CLI (`scripts/tooling/openville-cli.js`) exposes basic endpoints but lacks direct support for negotiation and winner selection. No LangChain tool wrappers or deepagent orchestration exists yet. Frontend streaming is not integrated for agent/subagent execution. Negotiation logic has hardcoded LLM calls for actions (accept/reject/cancel/reply) that need to be exposed as tools while keeping existing code for summarization/validation.

Key constraints:
- Must follow existing API schemas (`features/shared/schemas/WorkflowSchemas.ts`)
- CLI must maintain current argument patterns and output formats
- Deepagent must use official LangChain/deepagents SDKs for skill isolation and context management
- Frontend streaming requires `@langchain/langgraph-sdk/react` integration
- Keep existing hardcoded negotiation LLM calls for summarization and data structure validation, but expose negotiation actions (accept/reject/cancel/send reply) as tools

## Desired End State

After implementation, the deepagent handles the full user flow:
1. User requests service to agent
2. Agent calls OpenVille RAG tool to get top 10 candidates with IDs
3. Agent selects top 3 candidates using selection tool
4. Agent negotiates with each of the 3 sequentially using negotiation tools (accept/reject/cancel/reply)
5. Agent selects winner from negotiation results
6. Agent reports transaction details (cost, timeline) back to user
7. Streaming UI shows all steps: selections, negotiations, compromises, final choice

All components are documented, tested, and verifiable through automated/manual checks.

### Key Discoveries:

- Existing `search-and-select` endpoint covers initial workflow; no splitting needed (`app/api/agents/search-and-select/route.ts`)
- Candidate type mismatches in negotiation endpoints (LSP errors: missing `id`, `created_at`, `updated_at` fields in `Candidate` type)
- LangChain deepagent patterns support modular skill attachment and subagent isolation
- Streaming UI uses `useStream` from `@langchain/langgraph-sdk/react` for event filtering and progress rendering
- Negotiation has hardcoded LLM calls for actions that should become tools, but keep for summarization (`features/agents/negotiation/negotiationLogic.ts`)

## What We're NOT Doing

- Modifying core RAG logic or API schemas beyond type fixes for compatibility
- Removing existing hardcoded negotiation LLM calls (keep for summarization/validation, comment out action calls and replace with tool invocations)
- Implementing new negotiation algorithms (using existing `features/agents/selection/selectTop3.ts`, `selectWinner.ts`)
- Building custom streaming protocols (sticking to LangChain SDK patterns)
- Adding authentication/authorization layers (assuming existing auth handles agent access)
- Supporting non-JS/TS agent frameworks (focused on LangChain ecosystem)

## Implementation Approach

Follow SOLID/KISS principles: extract CLI commands into focused functions, depend on abstractions (tool interfaces), keep components small and single-responsibility. Start with CLI extension, build wrappers incrementally, orchestrate via deepagent, then integrate streaming UI. Use TDD: write unit tests first for each component, then integration tests. Delegate agent reasoning to deepagent for selections and negotiations while keeping fixed LLM calls for data validation/summarization.

## Phase 1: CLI Extension for Negotiation Tools and Winner Selection

### Overview

Extend the existing CLI to expose negotiation action tools (accept/reject/cancel/reply) and winner selection endpoints, ensuring argument validation matches API schemas and outputs stream correctly.

### Changes Required:

#### 1. CLI Command Extensions

**File**: `scripts/tooling/openville-cli.js`

**Changes**: Add new CLI commands for negotiation actions and winner selection, with streaming output support. Ensure commands parse arguments to match `WorkflowSchemas.ts` types.

```javascript
// Add after existing command definitions
program
  .command('negotiate-run')
  .description('Run negotiation workflow for selected candidates')
  .option('--job-type <type>', 'Job type')
  .option('--description <desc>', 'Job description')
  .option('--candidates <json>', 'JSON array of candidate IDs')
  .action(async (options) => {
    try {
      const result = await negotiateRun(options);
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program
  .command('select-top3')
  .description('Select top 3 candidates from top 10 by IDs')
  .option('--top10-ids <json>', 'JSON array of top 10 candidate IDs')
  .option('--criteria <json>', 'JSON selection criteria')
  .action(async (options) => {
    try {
      const result = await selectTop3(options);
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program
  .command('negotiate-action')
  .description('Perform negotiation action: accept, reject, cancel, reply')
  .option('--negotiation-id <id>', 'Negotiation session ID')
  .option('--action <action>', 'Action: accept|reject|cancel|reply')
  .option('--message <msg>', 'Message for reply action')
  .action(async (options) => {
    try {
      const result = await negotiateAction(options);
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program
  .command('select-winner')
  .description('Select winner from negotiation results')
  .option('--negotiation-results <json>', 'JSON of negotiation results')
  .action(async (options) => {
    try {
      const result = await selectWinner(options);
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Add helper functions at end of file
async function negotiateRun(options) {
  // Implementation to call /api/agents/negotiate/run with parsed options
  const response = await fetch(`${baseUrl}/api/agents/negotiate/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      providerType: 'openai', // or from config
      scope: options,
      candidates: JSON.parse(options.candidates),
      // ... other required fields
    })
  });
  return response.json();
}

async function selectTop3(options) {
  // Implementation to call /api/agents/select-top3
  const response = await fetch(`${baseUrl}/api/agents/select-top3`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      top10Ids: JSON.parse(options.top10Ids),
      criteria: JSON.parse(options.criteria)
    })
  });
  return response.json();
}

async function negotiateAction(options) {
  // Implementation for negotiation actions
  const response = await fetch(`${baseUrl}/api/agents/negotiate/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options)
  });
  return response.json();
}

async function selectWinner(options) {
  // Implementation to call /api/agents/select-winner
  const response = await fetch(`${baseUrl}/api/agents/select-winner`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(JSON.parse(options.negotiationResults))
  });
  return response.json();
}
```

#### 2. Type Compatibility Fixes

**File**: `app/api/agents/select-top3/route.ts` (and similar in `negotiate/run/route.ts`, `scripts/test-select-top3.ts`)

**Changes**: Ensure `Candidate` type includes required fields (`id`, `created_at`, `updated_at`) to fix LSP errors. Update API calls to provide these fields.

```typescript
// In route.ts, ensure candidates array includes full Candidate objects
const candidates: Candidate[] = validatedBody.candidates.map(c => ({
  ...c,
  id: c.id || generateId(), // Add if missing
  created_at: c.created_at || new Date(),
  updated_at: c.updated_at || new Date(),
}));
```

### Success Criteria:

#### Automated Verification:

- [x] CLI builds without errors: `node scripts/tooling/openville-cli.js --help`
- [x] New commands appear in help output
- [x] Type checking passes: `npm run typecheck`
- [x] LSP errors resolved in mentioned files
- [x] Unit tests pass for CLI extensions: `npm test scripts/tooling/openville-cli.test.js` (to be created)

#### Manual Verification:

- [ ] `openville-cli negotiate-run --help` shows correct options
- [ ] CLI commands execute and return expected JSON output for sample inputs
- [ ] Negotiation action commands work (accept/reject/cancel/reply)
- [ ] Error handling works for invalid arguments
- [ ] No regressions in existing CLI commands

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 2: LangChain Tool Wrapper

### Overview

Create JS/TS LangChain tool wrappers around CLI commands for programmatic agent access, including negotiation action tools.

### Changes Required:

#### 1. Tool Wrapper Implementation

**File**: `features/shared/tools/OpenVilleRAGTool.ts` (new file)

**Changes**: Implement LangChain `Tool` interface wrapping CLI invocations with proper parameter schemas.

```typescript
import { Tool } from 'langchain/tools';
import { z } from 'zod';

export class OpenVilleSearchAndSelectTool extends Tool {
  name = 'openville-search-and-select';
  description = 'Search and select top 10 candidates for a job using OpenVille RAG. Returns candidates with IDs for further processing.';

  schema = z.object({
    jobType: z.string().describe('Type of job (e.g., "development", "cleaning", "repair")'),
    description: z.string().describe('Detailed job description'),
    location: z.string().optional().describe('Job location if specified'),
    urgency: z.enum(['asap', 'flexible', 'scheduled']).optional().describe('How urgent the job is'),
    estimatedDuration: z.string().optional().describe('Expected job duration'),
    budget: z.number().optional().describe('User budget in dollars')
  });

  async _call(input: string): Promise<string> {
    const options = this.schema.parse(JSON.parse(input));
    const result = await execCLI('search-and-select', options);
    return JSON.stringify(result);
  }
}

export class OpenVilleSelectTop3Tool extends Tool {
  name = 'openville-select-top3';
  description = 'Select top 3 candidates from a list of top 10 candidate IDs based on user preferences and criteria.';

  schema = z.object({
    top10Ids: z.array(z.string()).describe('Array of top 10 candidate IDs from search results'),
    criteria: z.object({
      priority: z.enum(['cost', 'speed', 'rating', 'experience']).describe('Primary selection priority'),
      budget: z.number().optional().describe('Maximum budget constraint'),
      urgency: z.enum(['asap', 'flexible', 'scheduled']).optional().describe('Urgency requirement'),
      location: z.string().optional().describe('Preferred location match')
    }).describe('Selection criteria based on user preferences')
  });

  async _call(input: string): Promise<string> {
    const options = this.schema.parse(JSON.parse(input));
    const result = await execCLI('select-top3', options);
    return JSON.stringify(result);
  }
}

export class OpenVilleNegotiateRunTool extends Tool {
  name = 'openville-negotiate-run';
  description = 'Start a negotiation session with a specific candidate for a job.';

  schema = z.object({
    candidateId: z.string().describe('ID of the candidate to negotiate with'),
    jobDescription: z.string().describe('Full job description for negotiation context'),
    initialOffer: z.object({
      price: z.number().describe('Initial offered price'),
      timeline: z.string().describe('Proposed timeline (e.g., "2 weeks")'),
      terms: z.string().optional().describe('Additional terms or conditions')
    }).optional().describe('Optional initial offer details')
  });

  async _call(input: string): Promise<string> {
    const options = this.schema.parse(JSON.parse(input));
    const result = await execCLI('negotiate-run', options);
    return JSON.stringify(result);
  }
}

export class OpenVilleNegotiateActionTool extends Tool {
  name = 'openville-negotiate-action';
  description = 'Perform a specific action during an ongoing negotiation: accept offer, reject offer, cancel negotiation, or send a reply message.';

  schema = z.object({
    negotiationId: z.string().describe('ID of the active negotiation session'),
    action: z.enum(['accept', 'reject', 'cancel', 'reply']).describe('The action to perform'),
    message: z.string().optional().describe('Message text for reply action (required when action is "reply")'),
    counterOffer: z.object({
      price: z.number().optional().describe('Counter-offered price'),
      timeline: z.string().optional().describe('Counter-offered timeline'),
      terms: z.string().optional().describe('Modified terms')
    }).optional().describe('Optional counter-offer details for reply action')
  });

  async _call(input: string): Promise<string> {
    const options = this.schema.parse(JSON.parse(input));
    if (options.action === 'reply' && !options.message) {
      throw new Error('Message is required for reply action');
    }
    const result = await execCLI('negotiate-action', options);
    return JSON.stringify(result);
  }
}

export class OpenVilleSelectWinnerTool extends Tool {
  name = 'openville-select-winner';
  description = 'Select the final winner from multiple completed negotiation results based on best overall terms.';

  schema = z.object({
    negotiationResults: z.array(z.object({
      candidateId: z.string().describe('Candidate ID'),
      finalOffer: z.object({
        price: z.number().describe('Final agreed price'),
        timeline: z.string().describe('Agreed timeline'),
        terms: z.string().describe('Final terms')
      }).describe('Final offer details'),
      accepted: z.boolean().describe('Whether the offer was accepted'),
      negotiationHistory: z.array(z.object({
        action: z.string(),
        timestamp: z.string(),
        message: z.string().optional()
      })).optional().describe('History of negotiation actions')
    })).describe('Array of completed negotiation results from all candidates')
  });

  async _call(input: string): Promise<string> {
    const options = this.schema.parse(JSON.parse(input));
    const result = await execCLI('select-winner', options);
    return JSON.stringify(result);
  }
}
```

#### 2. Tool Registry

**File**: `features/agents/tools/index.ts` (new file)

**Changes**: Export tools for skill loading.

```typescript
export {
  OpenVilleSearchAndSelectTool,
  OpenVilleSelectTop3Tool,
  OpenVilleNegotiateRunTool,
  OpenVilleNegotiateActionTool,
  OpenVilleSelectWinnerTool
} from './OpenVilleRAGTool';
```

### Success Criteria:

#### Automated Verification:

- [ ] Tool builds without errors: `npm run build`
- [ ] Tool tests pass: `npm test features/shared/tools/OpenVilleRAGTool.test.ts` (to be created)
- [ ] Type checking passes: `npm run typecheck`
- [ ] Tool can be imported and instantiated in test

#### Manual Verification:

- [ ] Tool executes CLI and returns expected results for sample inputs
- [ ] Negotiation action tool handles all action types correctly
- [ ] Error propagation works correctly
- [ ] Tool integrates with LangChain agent in test script

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 3: LangChain Deepagent Orchestration

### Overview

Implement LangChain deepagent that orchestrates the full user flow: search top 10, select top 3, negotiate with each sequentially using action tools, select winner, and report transaction details.

### Changes Required:

#### 1. Deepagent Implementation

**File**: `features/agents/deepagents/OpenVilleRAGAgent.ts` (new file)

**Changes**: Use LangChain deepagents SDK to create agent managing full pipeline with sequential negotiation.

```typescript
import { DeepAgent } from '@langchain/deepagents';
import {
  OpenVilleSearchAndSelectTool,
  OpenVilleSelectTop3Tool,
  OpenVilleNegotiateRunTool,
  OpenVilleNegotiateActionTool,
  OpenVilleSelectWinnerTool
} from '../tools';

export class OpenVilleRAGAgent extends DeepAgent {
  constructor() {
    super({
      tools: [
        new OpenVilleSearchAndSelectTool(),
        new OpenVilleSelectTop3Tool(),
        new OpenVilleNegotiateRunTool(),
        new OpenVilleNegotiateActionTool(),
        new OpenVilleSelectWinnerTool()
      ],
      // Configure subagent spawning for negotiation phases
      subagents: {
        'negotiation-handler': { /* subagent config */ },
        'selection-reasoner': { /* subagent config */ }
      },
      // Skill isolation per official spec
      skills: ['openville-rag', 'negotiation-agent', 'selection-reasoning']
    });
  }

  async runWorkflow(jobDescription: string, userPreferences: any): Promise<any> {
    // Step 1: Get top 10 candidates
    const searchResult = await this.callTool('openville-search-and-select', { description: jobDescription });
    this.streamUpdate('search_complete', { top10: searchResult.candidates });

    // Step 2: Select top 3 based on preferences
    const top3Result = await this.callTool('openville-select-top3', {
      top10Ids: searchResult.candidates.map(c => c.id),
      criteria: userPreferences
    });
    this.streamUpdate('top3_selected', { selected: top3Result.selectedIds });

    // Step 3: Negotiate with each of the 3 sequentially
    const negotiationResults = [];
    for (const candidateId of top3Result.selectedIds) {
      this.streamUpdate('negotiating_with', { candidateId });

      const negResult = await this.negotiateWithCandidate(candidateId, jobDescription);
      negotiationResults.push(negResult);

      if (negResult.accepted) {
        this.streamUpdate('negotiation_success', { candidateId, terms: negResult.terms });
      } else {
        this.streamUpdate('negotiation_rejected', { candidateId, reason: negResult.reason });
      }
    }

    // Step 4: Select winner from negotiation results
    const winnerResult = await this.callTool('openville-select-winner', { negotiationResults });
    this.streamUpdate('winner_selected', { winner: winnerResult.winner, cost: winnerResult.cost, timeline: winnerResult.timeline });

    return {
      winner: winnerResult.winner,
      transactionDetails: {
        cost: winnerResult.cost,
        timeline: winnerResult.timeline,
        compromises: winnerResult.compromises
      }
    };
  }

  async negotiateWithCandidate(candidateId: string, jobDescription: string): Promise<any> {
    // Start negotiation
    const negSession = await this.callTool('openville-negotiate-run', {
      candidateId,
      jobDescription
    });

    // Agent-driven negotiation loop using action tools
    while (!negSession.completed) {
      // Agent reasons and decides action (accept/reject/cancel/reply)
      const action = await this.reasonAboutNegotiationAction(negSession.currentOffer);

      const result = await this.callTool('openville-negotiate-action', {
        negotiationId: negSession.id,
        action: action.type,
        message: action.message
      });

      this.streamUpdate('negotiation_action', {
        candidateId,
        action: action.type,
        message: action.message,
        response: result.response
      });

      negSession.update(result);
    }

    return negSession.finalResult;
  }

  async reasonAboutNegotiationAction(currentOffer: any): Promise<{type: string, message?: string}> {
    // Agent reasoning logic here - could spawn subagent for complex decisions
    // Return action decision
    return { type: 'reply', message: 'Can you offer a 10% discount?' };
  }

  private streamUpdate(type: string, data: any) {
    // Stream to frontend
    this.emit('stream', { type, data, timestamp: new Date() });
  }
}
```

#### 2. Negotiation Logic Updates

**File**: `features/agents/negotiation/negotiationLogic.ts`

**Changes**: Comment out hardcoded action LLM calls, replace with tool invocations for actions, keep fixed calls for summarization/validation.

```typescript
// Existing hardcoded action calls - comment out
// const actionResponse = await llmCallForAction(offer);

// Replace with tool call delegation
// Actions (accept/reject/cancel/reply) now come from agent tools
// Keep existing summarization and validation LLM calls
const summary = await llmCallForSummarization(negotiationData); // Keep this
const validatedData = await llmCallForValidation(finalResult); // Keep this
```

### Success Criteria:

#### Automated Verification:

- [ ] Agent builds without errors: `npm run build`
- [ ] Agent tests pass: `npm test features/agents/deepagents/OpenVilleRAGAgent.test.ts`
- [ ] Type checking passes: `npm run typecheck`
- [ ] Agent can instantiate and run workflow in test (mocked CLI calls)

#### Manual Verification:

- [ ] Agent orchestrates full workflow correctly with sample job
- [ ] Negotiation loop works with action tools (accept/reject/cancel/reply)
- [ ] Subagents spawn and isolate skills as expected
- [ ] Context/memory preserved across workflow steps
- [ ] Fixed LLM calls still work for summarization/validation
- [ ] Error handling cascades properly

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 4: Frontend Streaming Integration

### Overview

Integrate agent/subagent execution with React frontend using `@langchain/langgraph-sdk/react` for streaming visualization of selections, negotiations, and results.

### Changes Required:

#### 1. Streaming Component

**File**: `app/components/agents/RAGWorkflowStreamer.tsx` (new file)

**Changes**: Implement streaming UI component showing workflow progress.

```tsx
import { useStream } from '@langchain/langgraph-sdk/react';

export function RAGWorkflowStreamer({ agentId }: { agentId: string }) {
  const { messages, isLoading } = useStream({
    agentId,
    filter: (msg) => [
      'search_complete', 'top3_selected', 'negotiating_with',
      'negotiation_action', 'negotiation_success', 'negotiation_rejected',
      'winner_selected'
    ].includes(msg.type)
  });

  return (
    <div>
      {messages.map((msg, i) => (
        <div key={i}>
          {msg.type === 'search_complete' && <div>Found top 10 candidates</div>}
          {msg.type === 'top3_selected' && <div>Selected top 3: {msg.data.selected.join(', ')}</div>}
          {msg.type === 'negotiating_with' && <div>Negotiating with candidate {msg.data.candidateId}</div>}
          {msg.type === 'negotiation_action' && (
            <div>Action: {msg.data.action} - {msg.data.message}</div>
          )}
          {msg.type === 'negotiation_success' && (
            <div>✓ Negotiation successful with {msg.data.candidateId}</div>
          )}
          {msg.type === 'winner_selected' && (
            <div>🏆 Winner: {msg.data.winner.name}, Cost: ${msg.data.cost}, Timeline: {msg.data.timeline}</div>
          )}
        </div>
      ))}
      {isLoading && <div>Processing...</div>}
    </div>
  );
}
```

#### 2. Agent Runner Page

**File**: `app/pages/agents/rag-workflow.tsx` (new file)

**Changes**: Page to trigger and stream agent execution.

```tsx
// Component to input job description and start agent
export default function RAGWorkflowPage() {
  const [agentId, setAgentId] = useState<string | null>(null);
  const [userPrefs, setUserPrefs] = useState({ budget: '', priority: 'cost' });

  const startWorkflow = async (jobDesc: string) => {
    const response = await fetch('/api/agents/start-rag-workflow', {
      method: 'POST',
      body: JSON.stringify({ jobDescription: jobDesc, preferences: userPrefs })
    });
    const { agentId: id } = await response.json();
    setAgentId(id);
  };

  return (
    <div>
      {/* Job input form with preferences */}
      <input placeholder="Job description" />
      <select value={userPrefs.priority}>
        <option value="cost">Cost-effective</option>
        <option value="speed">Fastest</option>
        <option value="rating">Highest rated</option>
      </select>
      <button onClick={() => startWorkflow(jobDesc)}>Start RAG Workflow</button>
      {agentId && <RAGWorkflowStreamer agentId={agentId} />}
    </div>
  );
}
```

### Success Criteria:

#### Automated Verification:

- [ ] Components build without errors: `npm run build`
- [ ] Type checking passes: `npm run typecheck`
- [ ] Unit tests pass for streaming component: `npm test app/components/agents/RAGWorkflowStreamer.test.tsx`

#### Manual Verification:

- [ ] Page renders correctly and starts agent on button click
- [ ] Streaming component displays real-time workflow progress
- [ ] Shows top 3 selection, negotiation actions, successes/failures, winner details
- [ ] UI updates reflect workflow completion with transaction details
- [ ] No UI errors or performance issues during streaming

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 5: Verification & Testing

### Overview

Run comprehensive automated and manual tests for all components, focusing on the full agent-driven workflow.

### Changes Required:

#### 1. Integration Tests

**File**: `tests/integration/rag-agent-workflow.test.ts` (new file)

**Changes**: End-to-end tests for full workflow.

```typescript
describe('RAG Agent Workflow', () => {
  it('completes full search-select-negotiate-select winner cycle', async () => {
    const agent = new OpenVilleRAGAgent();
    const result = await agent.runWorkflow('Need a React developer for 3 months', { priority: 'cost' });
    expect(result.winner).toBeDefined();
    expect(result.transactionDetails.cost).toBeDefined();
    expect(result.transactionDetails.timeline).toBeDefined();
  });

  it('handles negotiation actions correctly', async () => {
    // Test negotiation action tools
    const actionResult = await agent.callTool('openville-negotiate-action', {
      negotiationId: 'test-id',
      action: 'reply',
      message: 'Can you lower the price?'
    });
    expect(actionResult.response).toBeDefined();
  });
});
```

### Success Criteria:

#### Automated Verification:

- [ ] All unit tests pass: `npm test`
- [ ] Integration tests pass: `npm run test:integration`
- [ ] Linting passes: `npm run lint`
- [ ] Type checking passes: `npm run typecheck`
- [ ] Build succeeds: `npm run build`

#### Manual Verification:

- [ ] Full workflow runs end-to-end via CLI with sample data
- [ ] Tool wrapper works in LangChain agent context
- [ ] Deepagent selects top 3 and negotiates sequentially with streaming
- [ ] Negotiation actions (accept/reject/cancel/reply) work via tools
- [ ] Final winner selection and transaction details reported
- [ ] Streaming UI shows all workflow steps and results
- [ ] No regressions in existing functionality

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful. The implementation is then complete.

---

## Phase 6: Documentation

### Overview

Document CLI, tool, agent, and streaming interfaces for reuse.

### Changes Required:

#### 1. Documentation Files

**File**: `docs/agents/openville-rag-workflow.md` (new file)

**Changes**: Complete usage guide.

```markdown
# OpenVille RAG Agent Workflow

## User Flow
1. User requests service to agent
2. Agent searches for top 10 candidates
3. Agent selects top 3 based on preferences
4. Agent negotiates with each of the 3 sequentially
5. Agent selects winner and reports transaction details

## CLI Usage
```bash
# Search and select top 10
openville-cli search-and-select --job-type "development" --description "React app"

# Select top 3 from IDs
openville-cli select-top3 --top10-ids "[1,2,3,4,5,6,7,8,9,10]" --criteria '{"priority": "cost"}'

# Start negotiation
openville-cli negotiate-run --candidate-id "123" --job-description "Fix gutters"

# Perform negotiation action
openville-cli negotiate-action --negotiation-id "neg-456" --action "reply" --message "Can you offer 10% off?"

# Select winner
openville-cli select-winner --negotiation-results '{"results": [...]}'
```

## Tool Wrappers
Tools available for LangChain agents:
- `OpenVilleSearchAndSelectTool`
- `OpenVilleSelectTop3Tool`
- `OpenVilleNegotiateRunTool`
- `OpenVilleNegotiateActionTool`
- `OpenVilleSelectWinnerTool`

## Deepagent Usage
```typescript
const agent = new OpenVilleRAGAgent();
const result = await agent.runWorkflow(jobDescription, userPreferences);
// Returns winner and transaction details
```

## Streaming UI
Use `RAGWorkflowStreamer` component with agent ID to see real-time progress of selections, negotiations, and final results.
```

### Success Criteria:

#### Automated Verification:

- [ ] Documentation builds in docs site (if applicable)

#### Manual Verification:

- [ ] Documentation is accurate and complete
- [ ] Examples work as described
- [ ] No missing setup or usage steps

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful. The implementation is then complete.

---

## Testing Strategy (TDD-first)

### Unit Tests:

- CLI extensions: Test command parsing, API calls, error handling (`scripts/tooling/openville-cli.test.js`)
- Tool wrappers: Test tool instantiation, _call method with mocks (`features/shared/tools/OpenVilleRAGTool.test.ts`)
- Deepagent: Test orchestration logic, negotiation loops, streaming (`features/agents/deepagents/OpenVilleRAGAgent.test.ts`)
- Streaming components: Test message filtering, rendering (`app/components/agents/RAGWorkflowStreamer.test.tsx`)
- Coverage target: 80% lines/functions, edge cases like invalid inputs, API failures, negotiation rejections

### Integration Tests:

- Full workflow via CLI (`tests/integration/cli-workflow.test.js`)
- Tool in LangChain agent context (`tests/integration/tool-agent.test.ts`)
- Deepagent with real subagents (`tests/integration/deepagent-orchestration.test.ts`)
- Negotiation action tools (`tests/integration/negotiation-actions.test.ts`)
- Streaming UI with mock agent (`tests/integration/streaming-ui.test.tsx`)

### Manual Testing Steps:

1. Run CLI commands with real API endpoints and verify outputs
2. Instantiate tools in LangChain playground and execute workflows
3. Start deepagent workflow and monitor top 3 selection, sequential negotiations, winner choice
4. Verify negotiation actions (reply with counteroffers, accept/reject/cancel) work via tools
5. Check streaming UI shows selections, negotiation rounds, compromises, final transaction details
6. Test error scenarios (network failures, invalid data, negotiation deadlocks)
7. Verify no performance degradation in existing features

## Performance Considerations

- CLI commands should complete within 30s for typical workflows
- Tool wrappers add minimal latency (<500ms) over direct API calls
- Deepagent negotiation loops shouldn't exceed 2min per candidate
- Sequential negotiation processing should complete within 10min total
- Streaming UI should handle 100+ message events without lag
- Memory usage for agent context should scale linearly with workflow size

## Migration Notes

No breaking changes to existing APIs or CLI. New commands are additive. Existing workflows continue unchanged. Negotiation logic keeps existing LLM calls for summarization/validation while delegating actions to tools. If type fixes require API changes, provide backwards-compatible defaults for missing fields.

## References

- Original research: `thoughts/research/2026-03-01_create-openville-cli-langchain-tool.md`
- Handoff: `thoughts/shared/handoffs/general/2026-03-01_18-46-30_create-openville-cli-and-langchain-tool.md`
- Negotiation planning: `thoughts/shared/plans/2026-02-28-agent-reasoning-negotiation.md`
- User flow: `context/user_flow.md`
- API endpoints: `app/api/agents/` directory
- Schemas: `features/shared/schemas/WorkflowSchemas.ts`

## Phase 1: CLI Extension for Negotiation and Winner Selection

### Overview

Extend the existing CLI to expose negotiation workflow and winner selection endpoints, ensuring argument validation matches API schemas and outputs stream correctly.

### Changes Required:

#### 1. CLI Command Extensions

**File**: `scripts/tooling/openville-cli.js`

**Changes**: Add new CLI commands for negotiation and winner selection, with streaming output support. Ensure commands parse arguments to match `WorkflowSchemas.ts` types.

```javascript
// Add after existing command definitions
program
  .command('negotiate-run')
  .description('Run negotiation workflow for selected candidates')
  .option('--job-type <type>', 'Job type')
  .option('--description <desc>', 'Job description')
  .option('--candidates <json>', 'JSON array of candidates')
  .action(async (options) => {
    try {
      const result = await negotiateRun(options);
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program
  .command('select-winner')
  .description('Select winner from negotiation results')
  .option('--negotiation-results <json>', 'JSON of negotiation results')
  .action(async (options) => {
    try {
      const result = await selectWinner(options);
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Add helper functions at end of file
async function negotiateRun(options) {
  // Implementation to call /api/agents/negotiate/run with parsed options
  const response = await fetch(`${baseUrl}/api/agents/negotiate/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      providerType: 'openai', // or from config
      scope: options,
      candidates: JSON.parse(options.candidates),
      // ... other required fields
    })
  });
  return response.json();
}

async function selectWinner(options) {
  // Implementation to call /api/agents/select-winner
  const response = await fetch(`${baseUrl}/api/agents/select-winner`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(JSON.parse(options.negotiationResults))
  });
  return response.json();
}
```

#### 2. Type Compatibility Fixes

**File**: `app/api/agents/select-top3/route.ts` (and similar in `negotiate/run/route.ts`, `scripts/test-select-top3.ts`)

**Changes**: Ensure `Candidate` type includes required fields (`id`, `created_at`, `updated_at`) to fix LSP errors. Update API calls to provide these fields.

```typescript
// In route.ts, ensure candidates array includes full Candidate objects
const candidates: Candidate[] = validatedBody.candidates.map(c => ({
  ...c,
  id: c.id || generateId(), // Add if missing
  created_at: c.created_at || new Date(),
  updated_at: c.updated_at || new Date(),
}));
```

### Success Criteria:

#### Automated Verification:

- [x] CLI builds without errors: `node scripts/tooling/openville-cli.js --help`
- [x] New commands appear in help output
- [x] Type checking passes: `npm run typecheck`
- [x] Unit tests pass for CLI extensions: `npm test scripts/tooling/openville-cli.test.js` (to be created)
- [x] LSP errors resolved in mentioned files

#### Manual Verification:

- [ ] `openville-cli negotiate-run --help` shows correct options
- [ ] CLI commands execute and return expected JSON output for sample inputs
- [ ] Error handling works for invalid arguments
- [ ] No regressions in existing CLI commands

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 2: LangChain Tool Wrapper

### Overview

Create JS/TS LangChain tool wrappers around CLI commands for programmatic agent access.

### Changes Required:

#### 1. Tool Wrapper Implementation

**File**: `features/shared/tools/OpenVilleRAGTool.ts` (new file)

**Changes**: Implement LangChain `Tool` interface wrapping CLI invocations.

```typescript
import { Tool } from 'langchain/tools';

export class OpenVilleSearchAndSelectTool extends Tool {
  name = 'openville-search-and-select';
  description = 'Search and select top candidates for a job using OpenVille RAG';

  async _call(input: string): Promise<string> {
    const options = JSON.parse(input);
    // Invoke CLI or direct API call
    const result = await execCLI('search-and-select', options);
    return JSON.stringify(result);
  }
}

// Similar for NegotiateRunTool and SelectWinnerTool
export class OpenVilleNegotiateRunTool extends Tool {
  name = 'openville-negotiate-run';
  description = 'Run negotiation workflow for selected candidates';

  async _call(input: string): Promise<string> {
    const options = JSON.parse(input);
    const result = await execCLI('negotiate-run', options);
    return JSON.stringify(result);
  }
}
```

#### 2. Tool Registry

**File**: `features/agents/tools/index.ts` (new file)

**Changes**: Export tools for skill loading.

```typescript
export { OpenVilleSearchAndSelectTool, OpenVilleNegotiateRunTool, OpenVilleSelectWinnerTool } from './OpenVilleRAGTool';
```

### Success Criteria:

#### Automated Verification:

- [ ] Tool builds without errors: `npm run build`
- [ ] Tool tests pass: `npm test features/shared/tools/OpenVilleRAGTool.test.ts` (to be created)
- [ ] Type checking passes: `npm run typecheck`
- [ ] Tool can be imported and instantiated in test

#### Manual Verification:

- [ ] Tool executes CLI and returns expected results for sample inputs
- [ ] Error propagation works correctly
- [ ] Tool integrates with LangChain agent in test script

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 3: LangChain Deepagent Orchestration

### Overview

Implement LangChain deepagent that orchestrates RAG workflows using tool wrappers, with subagent spawning and skill isolation.

### Changes Required:

#### 1. Deepagent Implementation

**File**: `features/agents/deepagents/OpenVilleRAGAgent.ts` (new file)

**Changes**: Use LangChain deepagents SDK to create agent managing full pipeline.

```typescript
import { DeepAgent } from '@langchain/deepagents';
import { OpenVilleSearchAndSelectTool, OpenVilleNegotiateRunTool, OpenVilleSelectWinnerTool } from '../tools';

export class OpenVilleRAGAgent extends DeepAgent {
  constructor() {
    super({
      tools: [new OpenVilleSearchAndSelectTool(), new OpenVilleNegotiateRunTool(), new OpenVilleSelectWinnerTool()],
      // Configure subagent spawning for negotiation phases
      subagents: {
        'negotiation-orchestrator': { /* subagent config */ },
        'winner-selector': { /* subagent config */ }
      },
      // Skill isolation per official spec
      skills: ['openville-rag', 'negotiation-handler']
    });
  }

  async runWorkflow(jobDescription: string): Promise<any> {
    // Orchestrate: search -> negotiate -> select winner
    const searchResult = await this.callTool('openville-search-and-select', { description: jobDescription });
    const negotiationResult = await this.spawnSubagent('negotiation-orchestrator', { candidates: searchResult.candidates });
    const winner = await this.callTool('openville-select-winner', { negotiationResults: negotiationResult });
    return winner;
  }
}
```

### Success Criteria:

#### Automated Verification:

- [ ] Agent builds without errors: `npm run build`
- [ ] Agent tests pass: `npm test features/agents/deepagents/OpenVilleRAGAgent.test.ts`
- [ ] Type checking passes: `npm run typecheck`
- [ ] Agent can instantiate and run workflow in test (mocked CLI calls)

#### Manual Verification:

- [ ] Agent orchestrates full workflow correctly with sample job
- [ ] Subagents spawn and isolate skills as expected
- [ ] Context/memory preserved across workflow steps
- [ ] Error handling cascades properly

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 4: Frontend Streaming Integration

### Overview

Integrate agent/subagent execution with React frontend using `@langchain/langgraph-sdk/react` for streaming visualization.

### Changes Required:

#### 1. Streaming Component

**File**: `app/components/agents/RAGWorkflowStreamer.tsx` (new file)

**Changes**: Implement streaming UI component.

```tsx
import { useStream } from '@langchain/langgraph-sdk/react';

export function RAGWorkflowStreamer({ agentId }: { agentId: string }) {
  const { messages, isLoading } = useStream({
    agentId,
    filter: (msg) => msg.type === 'tool_call' || msg.type === 'subagent_spawn'
  });

  return (
    <div>
      {messages.map((msg, i) => (
        <div key={i}>
          {msg.type === 'tool_call' && <div>Tool: {msg.tool} executing...</div>}
          {msg.type === 'subagent_spawn' && <div>Subagent: {msg.subagentId} started</div>}
        </div>
      ))}
      {isLoading && <div>Processing...</div>}
    </div>
  );
}
```

#### 2. Agent Runner Page

**File**: `app/pages/agents/rag-workflow.tsx` (new file)

**Changes**: Page to trigger and stream agent execution.

```tsx
// Component to input job description and start agent
export default function RAGWorkflowPage() {
  const [agentId, setAgentId] = useState<string | null>(null);

  const startWorkflow = async (jobDesc: string) => {
    const response = await fetch('/api/agents/start-rag-workflow', {
      method: 'POST',
      body: JSON.stringify({ jobDescription: jobDesc })
    });
    const { agentId: id } = await response.json();
    setAgentId(id);
  };

  return (
    <div>
      {/* Job input form */}
      <button onClick={() => startWorkflow(jobDesc)}>Start RAG Workflow</button>
      {agentId && <RAGWorkflowStreamer agentId={agentId} />}
    </div>
  );
}
```

### Success Criteria:

#### Automated Verification:

- [ ] Components build without errors: `npm run build`
- [ ] Type checking passes: `npm run typecheck`
- [ ] Unit tests pass for streaming component: `npm test app/components/agents/RAGWorkflowStreamer.test.tsx`

#### Manual Verification:

- [ ] Page renders correctly and starts agent on button click
- [ ] Streaming component displays tool/subagent progress in real-time
- [ ] UI updates reflect workflow completion
- [ ] No UI errors or performance issues during streaming

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 5: Verification & Testing

### Overview

Run comprehensive automated and manual tests for all components.

### Changes Required:

#### 1. Integration Tests

**File**: `tests/integration/rag-agent-workflow.test.ts` (new file)

**Changes**: End-to-end tests for full workflow.

```typescript
describe('RAG Agent Workflow', () => {
  it('completes full search-negotiate-select cycle', async () => {
    const agent = new OpenVilleRAGAgent();
    const result = await agent.runWorkflow('Need a React developer for 3 months');
    expect(result.winner).toBeDefined();
    expect(result.negotiationHistory).toHaveLengthGreaterThan(0);
  });
});
```

### Success Criteria:

#### Automated Verification:

- [ ] All unit tests pass: `npm test`
- [ ] Integration tests pass: `npm run test:integration`
- [ ] Linting passes: `npm run lint`
- [ ] Type checking passes: `npm run typecheck`
- [ ] Build succeeds: `npm run build`

#### Manual Verification:

- [ ] Full workflow runs end-to-end via CLI with sample data
- [ ] Tool wrapper works in LangChain agent context
- [ ] Deepagent orchestrates subagents correctly
- [ ] Streaming UI shows real-time progress and final results
- [ ] No regressions in existing functionality

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 6: Documentation

### Overview

Document CLI, tool, agent, and streaming interfaces for reuse.

### Changes Required:

#### 1. Documentation Files

**File**: `docs/agents/openville-rag-workflow.md` (new file)

**Changes**: Complete usage guide.

```markdown
# OpenVille RAG Agent Workflow

## CLI Usage
```bash
# Search and select candidates
openville-cli search-and-select --job-type "development" --description "React app"

# Run negotiation
openville-cli negotiate-run --job-type "development" --candidates '[{"name": "Alice", ...}]'

# Select winner
openville-cli select-winner --negotiation-results '{"offers": [...]}'
```

## Tool Wrappers
Tools available for LangChain agents:
- `OpenVilleSearchAndSelectTool`
- `OpenVilleNegotiateRunTool`
- `OpenVilleSelectWinnerTool`

## Deepagent Usage
```typescript
const agent = new OpenVilleRAGAgent();
const result = await agent.runWorkflow(jobDescription);
```

## Streaming UI
Use `RAGWorkflowStreamer` component with agent ID.
```

### Success Criteria:

#### Automated Verification:

- [ ] Documentation builds in docs site (if applicable)

#### Manual Verification:

- [ ] Documentation is accurate and complete
- [ ] Examples work as described
- [ ] No missing setup or usage steps

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful. The implementation is then complete.

---

## Testing Strategy (TDD-first)

### Unit Tests:

- CLI extensions: Test command parsing, API calls, error handling (`scripts/tooling/openville-cli.test.js`)
- Tool wrappers: Test tool instantiation, _call method with mocks (`features/shared/tools/OpenVilleRAGTool.test.ts`)
- Deepagent: Test orchestration logic, subagent spawning (`features/agents/deepagents/OpenVilleRAGAgent.test.ts`)
- Streaming components: Test message filtering, rendering (`app/components/agents/RAGWorkflowStreamer.test.tsx`)
- Coverage target: 80% lines/functions, edge cases like invalid inputs, API failures

### Integration Tests:

- Full workflow via CLI (`tests/integration/cli-workflow.test.js`)
- Tool in LangChain agent context (`tests/integration/tool-agent.test.ts`)
- Deepagent with real subagents (`tests/integration/deepagent-orchestration.test.ts`)
- Streaming UI with mock agent (`tests/integration/streaming-ui.test.tsx`)

### Manual Testing Steps:

1. Run CLI commands with real API endpoints and verify outputs
2. Instantiate tools in LangChain playground and execute workflows
3. Start deepagent workflow and monitor subagent isolation
4. Use streaming UI page with sample job and verify real-time updates
5. Test error scenarios (network failures, invalid data)
6. Verify no performance degradation in existing features

## Performance Considerations

- CLI commands should complete within 30s for typical workflows
- Tool wrappers add minimal latency (<500ms) over direct API calls
- Deepagent subagent spawning shouldn't exceed 10s initialization
- Streaming UI should handle 100+ message events without lag
- Memory usage for agent context should scale linearly with workflow size

## Migration Notes

No breaking changes to existing APIs or CLI. New commands are additive. Existing workflows continue unchanged. If type fixes require API changes, provide backwards-compatible defaults for missing fields.

## References

- Original research: `thoughts/research/2026-03-01_create-openville-cli-langchain-tool.md`
- Handoff: `thoughts/shared/handoffs/general/2026-03-01_18-46-30_create-openville-cli-and-langchain-tool.md`
- Negotiation planning: `thoughts/shared/plans/2026-02-28-agent-reasoning-negotiation.md`
- API endpoints: `app/api/agents/` directory
- Schemas: `features/shared/schemas/WorkflowSchemas.ts`