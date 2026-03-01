# Plan: Frontend Contract-First Slice

## Summary

Build the first visible frontend milestone as a contract-first vertical slice:

```text
user request
  -> context gathering
  -> ranked candidate results
```

The implementation must give visible frontend progress now while preserving a clean backend handoff later.

## Scope

### In scope

- canonical shared contracts for the first flow
- async mock fixtures and repositories
- request input
- message thread
- follow-up prompt / preferences summary
- ranked candidate results
- loading, empty, error, and success states

### Out of scope

- real backend APIs
- negotiation flow
- booking and transactions
- notifications
- reviews
- persistence

## Canonical Locations

Use these paths:

```text
features/shared/contracts/
features/shared/mocks/
features/shared/repositories/
features/chat/components/
features/chat/hooks/
features/search/components/
features/search/hooks/
```

## Contract Decisions

### `Candidate`

Purpose:

- shared ranked search entity used by frontend

Required fields:

- `agentId: string`
- `name: string`
- `headline: string`
- `specialties: string[]`
- `rating: number`
- `reviewCount: number`
- `successCount: number`
- `relevance: number`
- `score: number`
- `startingPrice: number | null`
- `availabilityLabel: string`
- `locationLabel: string`
- `summary: string`

### `ChatMessage`

Required fields:

- `id: string`
- `role: "user" | "assistant" | "system"`
- `content: string`
- `timestamp: string`
- `status?: "sent" | "pending" | "error"`

### `UserPreferences`

Required fields:

- `budgetPriority: "low_cost" | "balanced" | "premium"`
- `timeline: "asap" | "this_week" | "flexible"`
- `qualityPriority: "standard" | "high"`
- `notes: string`
- `maxBudget: number | null`

### Search contracts

- `SearchRequest`
- `RankedSearchResponse`
- `InitialChatResponse`

## Boundary Rules

- Components must not import raw fixtures directly.
- Components should consume canonical contracts or explicit view models only.
- Mock-ness belongs in fixture and repository names, not in domain type names.
- Backend integration later should happen through repository replacement or adapters.

Preferred flow:

```text
UI component
  -> feature hook
  -> repository interface
  -> mock repository now
  -> backend repository later
```

If backend payloads differ:

```text
backend payload
  -> adapter
  -> canonical contract
  -> UI
```

## Repository Interfaces

### `ChatRepository`

Method:

- `sendInitialMessage(input: { message: string }): Promise<InitialChatResponse>`

Responsibilities:

- return assistant messages
- infer partial user preferences
- optionally return a follow-up question

### `SearchRepository`

Method:

- `getRankedCandidates(request: SearchRequest): Promise<RankedSearchResponse>`

Responsibilities:

- return ranked candidates
- support success, empty, and error outcomes

## UI Deliverables

### Request composer

- text input
- submit button
- disabled state during submission

### Message list

- show system intro
- show user request
- show assistant response

### Follow-up / context card

- show inferred preferences
- show optional follow-up question

### Candidate results

- idle state
- loading state
- error state
- empty state
- success state with ranked cards

## Implementation Order

### Phase 1

- create shared contracts
- stop forwarding the old loose `Candidate` pattern

### Phase 2

- create fixtures and async mock repositories
- simulate latency and error conditions

### Phase 3

- create orchestration hooks for request and results flow
- build presentational components against canonical contracts

### Phase 4

- replace placeholder homepage with the new flow
- verify state handling and boundary clarity

## Acceptance Criteria

- a user can submit a request and see one of:
  - loading
  - error
  - empty
  - ranked results
- no domain type is named with a `Mock` prefix
- shared contracts do not use `any`
- presentational components do not import raw fixtures
- the old `Candidate` path does not define a competing shape

## Test and Validation Scenarios

- normal request returns assistant response and ranked results
- request with insufficient specificity produces a follow-up question
- request containing `error` triggers the mock error state
- request containing `empty` triggers the empty results state
- long candidate content wraps correctly
- submit is blocked while async work is in flight

## Handoff Notes

Backend teammates should confirm:

- candidate identifier format
- enum values for preferences
- nullable fields such as `startingPrice`
- shape of search result payloads
- timestamp format expectations

The implementation should be easy to explain as:

```text
canonical contracts for the domain
mock repositories for current development
repository/adapters as the future backend swap boundary
```
