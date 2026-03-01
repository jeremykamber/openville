# Research: Frontend Contract-First Slice

## Goal

Establish the first frontend slice in a way that gives visible progress now and minimizes refactor cost when backend contracts arrive.

## Repo State

- The repo is a Next.js App Router project with strict TypeScript enabled.
- `@/*` path aliases are configured in `tsconfig.json`.
- Reusable UI primitives already exist under `components/ui/`.
- The feature structure exists but was mostly scaffolded:
  - `features/chat`
  - `features/search`
  - `features/shared`
  - `features/agents`
  - `features/transaction`
- The existing `Candidate` type in `features/agents/selection/types/Candidate.ts` was too loose because it used `[key: string]: any`.

## Docs Reviewed

- `context/user_flow.md`
- `context/responsbilities.md`
- `app/page.tsx`
- `app/layout.tsx`
- `components/ui/*`
- `features/agents/selection/types/Candidate.ts`

## Product Flow Findings

From `context/user_flow.md`, the highest-leverage first frontend slice is:

```text
request
  -> context gathering
  -> search
  -> ranked results
```

This covers:

- Step 1: The Request
- Step 2: Context Gathering
- Step 3: The Search
- Step 4: Ranking and Filtering

That is the best first frontend slice because it touches the main user loop and forces early contract alignment.

## Ownership Findings

From `context/responsbilities.md`:

- Dev 1 owns the user-facing request and context experience.
- Dev 2 owns search and ranking.
- Shared interfaces need to support parallel work with minimal merge conflicts.

This means Dev 1 should not hardcode transport-specific or mock-specific types into the UI.

## Existing Patterns To Follow

- Feature-oriented structure
- Shared UI primitives in `components/ui`
- Strict TypeScript
- App Router page entrypoint in `app/page.tsx`

## Problems Identified

### 1. No canonical shared contract boundary

Without a shared contract area, frontend UI would likely create local ad hoc types and drift from backend.

### 2. Existing `Candidate` shape is too weak

The loose index signature allows hidden type drift and weakens integration safety.

### 3. No repository boundary yet

If the UI consumes raw fixtures directly, later backend integration will force broader rewrites.

### 4. No realistic async behavior

If the mock layer is synchronous, loading/error states get deferred and then show up late as integration bugs.

## System Framing

### User journey

```text
user enters service request
  -> assistant responds
  -> preferences are inferred or clarified
  -> ranked candidates are shown
```

### Layers

- UI surface: request composer, message thread, context summary, candidate results
- State/orchestration: hooks that coordinate async flow
- Domain logic: shared contracts for messages, preferences, and candidates
- Integration boundary: repositories and adapters
- Reliability: explicit loading, error, empty, and success states

## Decision Direction

The frontend should use canonical domain contracts and keep mock-ness in repositories and fixtures.

### Chosen direction

```text
UI
  -> feature hook
  -> repository interface
  -> mock implementation now
  -> backend implementation later
```

### Why

- keeps components stable
- keeps data provenance out of UI contracts
- minimizes future backend swap cost

## Early Contract Targets

The first slice needs these shared contracts:

- `Candidate`
- `ChatMessage`
- `UserPreferences`
- `SearchRequest`
- `RankedSearchResponse`
- `InitialChatResponse`

## Risks and Assumptions

### Risks

- frontend guesses fields backend will change
- duplicate types spread across feature folders
- UI couples to fixtures
- loading/error states get postponed

### Assumptions

- `agentId` is the stable candidate identifier
- timestamps can be ISO strings
- `startingPrice` may be nullable
- user preferences can start as string unions
- async mock repositories are worth the upfront structure

## Recommended Next Step

Move from research into a decision-complete plan that defines:

- canonical contract location
- repository boundaries
- first flow scope
- UI states
- acceptance criteria
