### Developer Responsibilities Breakdown (v2 - Agent Negotiation Edition)

**Core Principle:** Each developer owns a self-contained module with clear input/output interfaces. Modules communicate via well-defined APIs, enabling parallel development with minimal merge conflicts.

---

## Dev 1: Chat Interface & Human Interaction
**Owner:** Frontend

**Scope:** All user-facing conversation and notification UI

- **Step 1: User Request UI** — Chat interface where user submits requests (e.g., "Fix my gutters")
- **Step 2: Context Gathering** — UI for agent to ask follow-up questions; display/edit user preferences
- **Step 9: Human Notification** — Display transaction confirmation to user; optional "human in the loop" approval step
- **Step 10: Review UI (Human side)** — Form for human to rate the tradesperson after job completion

**Deliverables:**
- React/Vue component for chat input and message display
- User preferences panel (budget, priorities)
- Notification toast/modal for transaction confirmation
- Rating form for human to review tradesperson

**Interface:** Exposes `POST /api/chat/message` and `GET /api/user/preferences`

---

## Dev 2: Search & Ranking Engine
**Owner:** Backend

**Scope:** RAG-powered search and candidate ranking (Steps 3-4)

- **Step 3: RAG Search** — Query vector database to retrieve top 50 relevant tradespeople/agents based on natural language query
- **Step 4: Ranking Algorithm** — Score and rank the 50 candidates by:
  - RAG relevance score
  - Number of successful services completed
  - Time on the platform
  - Customer ratings
- Return top 10 ranked results

**Deliverables:**
- RAG pipeline (embedding + vector search)
- Ranking logic / scoring function
- API endpoint: `POST /api/search/ranked` → returns top 10

**Interface:**
- Input: `{ query: string, userPreferences: object }`
- Output: `{ candidates: [{ agentId, name, score, relevance, successCount, rating, ... }] }`

---

## Dev 3: Agent Reasoning & Negotiation
**Owner:** Backend (AI/LLM)

**Scope:** Intelligent agent decision-making and inter-agent communication (Steps 5-7)

- **Step 5: Agent Selection** — LLM reasoner takes top 10, applies human priorities, narrows to top 3 candidates
- **Step 6: Agent-to-Agent Negotiation** — For each of the 3 candidates:
  - Send negotiation prompt to tradesperson agent (request discount, discuss scope, propose compromise)
  - Receive response from tradesperson agent
  - Store negotiation results
- **Step 7: Final Selection** — LLM reasoner compares negotiation outcomes, applies human priorities, selects winner

**Deliverables:**
- LLM prompt templates for reasoning and negotiation
- Tracesperson agent mock/handler (can be simple rule-based for MVP)
- API endpoints:
  - `POST /api/agents/select-top3` — narrow to 3
  - `POST /api/agents/negotiate` — run negotiation with candidate
  - `POST /api/agents/select-winner` — make final choice

**Interface:**
- Input (select-top3): `{ top10: [...], userPreferences: object }`
- Output: `{ top3: [...] }`
- Input (negotiate): `{ candidateId: string, scope: object, userPreferences: object }`
- Output: `{ discount: number|null, compromises: [...], refinedScope: object }`
- Input (select-winner): `{ negotiations: [...], userPreferences: object }`
- Output: `{ selectedAgentId: string, reasoning: string }`

---

## Dev 4: Transaction & Reviews
**Owner:** Frontend + Backend

**Scope:** Payment mock and two-way rating system (Steps 8, 10)

- **Step 8: Mock Payment UI** — Simple "Confirm Booking" button and success state (no real payment)
- **Step 8: Transaction Entity** — Create/store `Transaction` record (status: pending → completed)
- **Step 10: Reviews** — Two-way rating:
  - Human rates tradesperson (already in Dev 1)
  - Tradesperson rates human/agent (backend storage + optional UI)

**Deliverables:**
- Mock payment confirmation screen (one button: "Pay & Book")
- `Transaction` database model + CRUD API: `POST /api/transactions`
- Review submission: `POST /api/reviews`
- Review retrieval for tradesperson: `GET /api/users/{id}/reviews`

**Interface:**
- Input: `{ agentId: string, scope: object, price: number }`
- Output: `{ transactionId: string, status: "confirmed" }`

---

## Module Connection Diagram

```
[Dev 1: Chat UI] 
       |
       | POST /api/chat/message
       v
[Dev 2: Search API] -----> [Dev 3: Agent Reasoning]
       |                        |
       | POST /api/search       | POST /api/agents/*
       v                        v
[Dev 1: Display Results]   [Dev 3: Negotiation Loop]
       |                        |
       |                        | POST /api/agents/select-winner
       v                        v
[Dev 4: Payment UI] <------ [Dev 4: Transaction API]
       |
       v
[Dev 1: Notification + Review UI]
```

---

## Git-Friendly Module Structure

```
src/
├── chat/              # Dev 1: Chat UI components
│   ├── components/
│   ├── hooks/
│   └── api.ts
├── search/            # Dev 2: Search & ranking
│   ├── services/
│   ├── ranking/
│   └── api.ts
├── agents/            # Dev 3: Agent reasoning
│   ├── reasoning/
│   ├── negotiation/
│   └── api.ts
├── transaction/       # Dev 4: Payment & transactions
│   ├── components/
│   ├── services/
│   └── api.ts
└── shared/            # Shared types, utils
```

Each developer works in their own directory. Shared interfaces live in `shared/types.ts` — modify only when adding new fields, never breaking existing contracts.
