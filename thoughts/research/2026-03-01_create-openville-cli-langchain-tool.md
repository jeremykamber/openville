---
date: 2026-03-01T10:58:29-08:00
researcher: opencode
git_commit: bd4e7f69edc70e4e5b8a1076c9fb24902c5dcd7f
branch: feat/tool-calling-api-expose
repository: openville
topic: "How to create an Openville CLI and LangChain tool compatible with LangChain deepagents"
tags: [research, codebase, api, cli, langchain, tool]
status: complete
---

# Research: How to create an Openville CLI and LangChain tool compatible with LangChain deepagents

## Research Question

How to create an Openville CLI that exposes Next.js backend API routes as an HTTP CLI, and a LangChain tool that maps to that CLI for agent integration, ensuring compatibility with LangChain deepagents. Include reading LangChain documentation for tool creation and deepagent compatibility.

## Summary

The Openville codebase already contains a partially implemented CLI tool (`scripts/tooling/openville-cli.js`) that interacts with three API endpoints: `POST /api/agents/search-and-select`, `POST /api/agents/select-top3`, and `GET /api/workflow/status`. The API routes use Zod schemas for validation, support LLM provider resolution with fallback to mock implementations, and follow consistent error handling patterns. Existing patterns show Node.js CLI implementations with shebang execution, HTTP clients using native fetch, and TypeScript tooling scripts. LangChain tool creation involves inheriting from `BaseTool` and using subprocess for shell execution, with full compatibility for deepagents since they use the same agent architecture.

## Detailed Findings

### Openville API Endpoints and Schemas

The codebase implements three API endpoints in Next.js App Router format located at `app/api/agents/search-and-select/route.ts`, `app/api/agents/select-top3/route.ts`, and `app/api/workflow/status/route.ts`. These endpoints handle workflow-related requests with built-in validation using Zod schemas from `features/shared/schemas/WorkflowSchemas.ts`.

**Key Components:**
- `SearchAndSelectRequestSchema`: Requires query, userPreferences, scope, optional limit (1-10)
- `SelectTop3RequestSchema`: Requires top10 candidates array (min 3), userPreferences, scope
- `WorkflowSchemas.ts`: Contains all request/response schema definitions

**S:** Single responsibility - each schema validates one specific request type (file:features/shared/schemas/WorkflowSchemas.ts:63-87)
**O:** Open for extension - schemas use passthrough for additional fields (file:features/shared/schemas/WorkflowSchemas.ts:25)
**L:** Liskov substitution - schemas inherit from base types without changing expected behavior
**I:** Interface segregation - each schema defines only necessary fields for its endpoint
**D:** Dependency inversion - schemas depend on abstract Zod types, not concrete implementations

### API Route Implementations

The API routes follow a consistent pattern of request validation, processing, and response construction with error handling and fallback mechanisms.

**Request Flow:**
1. JSON parsing and Zod validation (returns 400 on failure)
2. Service/repository calls with LLM provider resolution
3. Response construction with merged execution metadata
4. Graceful degradation to mock fallbacks on errors

**Provider Resolution:** Uses `resolveLlmProvider()` from `features/workflow/server/runtime.ts:49-97` based on environment variables (`LLM_PROVIDER`, API keys) with fallback hierarchy.

**S:** Single responsibility - each route handles one endpoint's request/response cycle (file:app/api/agents/search-and-select/route.ts:20-132)
**O:** Open for extension - routes can be extended with additional processing without modifying core validation
**L:** Liskov substitution - all routes implement the same Next.js handler interface
**I:** Interface segregation - routes only expose the HTTP method they handle
**D:** Dependency inversion - routes depend on abstract service interfaces, not concrete implementations

### Existing CLI Implementation

A Node.js CLI tool exists at `scripts/tooling/openville-cli.js` that supports subcommands for the three API endpoints with JSON input/output and environment-based configuration.

**Features:**
- Subcommand-based interface (`workflow-status`, `search-and-select`, `select-top3`)
- Environment variable fallbacks (`OPENVILLE_API_BASE`, `OPENVILLE_API_KEY`)
- JSON input via `--data` flag or stdin
- HTTP requests using native fetch with proper headers
- Structured error output and exit codes

**S:** Single responsibility - CLI handles HTTP requests to specific endpoints (file:scripts/tooling/openville-cli.js:32-95)
**O:** Open for extension - new subcommands can be added without modifying existing logic
**L:** Liskov substitution - all subcommands follow the same input/output interface
**I:** Interface segregation - CLI provides separate functions for different concerns (parsing, requesting)
**D:** Dependency inversion - CLI depends on environment abstractions, not hardcoded values

### LangChain Tool Creation and Deepagents Compatibility

LangChain tools can be created by inheriting from `BaseTool` and implementing shell command execution via subprocess. Deepagents are fully compatible since they use the same agent architecture as standard LangChain agents.

**Tool Creation Pattern:**
- Inherit from `BaseTool` with `name`, `description`, and `_run` method
- Use `subprocess.run` for shell execution in `_run`
- Implement `_arun` for async support
- Pass tool instance to `create_agent(tools=[tool])`

**Deepagents Compatibility:**
- Deepagents use identical tool interfaces as LangChain agents
- No special modifications needed for tool compatibility
- Tools work with deepagent features like conversation compression and subagent spawning

**S:** Single responsibility - each tool handles one specific command execution (conceptual, as tools are composable)
**O:** Open for extension - tools can be subclassed for custom behavior
**L:** Liskov substitution - all tools implement the BaseTool interface
**I:** Interface segregation - tools define only the methods they need
**D:** Dependency inversion - tools depend on abstract BaseTool, not concrete agent implementations

## Code References

- `app/api/agents/search-and-select/route.ts:20-30` - Zod validation and error handling pattern
- `features/shared/schemas/WorkflowSchemas.ts:63-87` - Schema definitions for API requests
- `scripts/tooling/openville-cli.js:32-85` - CLI subcommand implementation with HTTP requests
- `features/workflow/server/runtime.ts:49-97` - LLM provider resolution logic
- `langchain_core.tools.BaseTool` - Abstract base class for custom tools (external)
- `subprocess.run` - Python standard library for shell command execution (external)

## Architecture Documentation

The codebase follows a layered architecture with API routes handling HTTP requests, service layers for business logic, and repository layers for data access. CLI tools provide external interfaces to the API layer, while LangChain tools enable agent integration. Configuration is environment-driven with fallback hierarchies, and error handling includes graceful degradation to mock implementations.

Existing patterns include:
- Native fetch for HTTP clients with wrapper functions
- Environment variable fallbacks for configuration flexibility
- Zod schemas for type-safe validation
- Lazy initialization with caching for external clients
- Structured JSON output for CLI tools and typed exceptions for libraries

## Historical Context (from thoughts/)

- `thoughts/shared/handoffs/general/2026-03-01_18-46-30_create-openville-cli-and-langchain-tool.md` - Original planning document for CLI and LangChain tool implementation, specifying requirements and artifacts

## Related Research

- `thoughts/shared/research/2026-02-28-ENG-agent-negotiation-step6.md` - Research on agent negotiation implementation and LLM integration patterns
- `thoughts/shared/plans/2026-02-28-agent-reasoning-negotiation.md` - Implementation plan for agent reasoning and negotiation features

## Open Questions

- How to handle authentication tokens securely in CLI environment variables?
- What additional API endpoints should be exposed in future CLI versions?
- How to implement streaming responses for long-running agent operations?
- Should the CLI support batch operations or remain focused on individual requests?