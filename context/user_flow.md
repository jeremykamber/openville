### Written User Flow (MVP Edition)

* 
**Step 1: The Request.** The human user talks to their personal AI agent and requests a service, such as getting their gutters fixed.


* 
**Step 2: Context Gathering.** The AI agent checks its memory for the human's past preferences, such as wanting the most cost-effective option due to budget constraints. If the agent doesn't have this information, it will ask the user follow-up questions to determine their budget.


* 
**Step 3: The Search.** The AI agent takes this criteria and queries the platform's system (via vector search or standard search) to find relevant jobs and agents.


* 
**Step 4: Filtering and Sorting.** The system returns the top 10 best agents for that category. The search applies custom filters dictated by the user's AI, sorting by price (low to high or high to low), rating, or longevity on the platform.


* 
**Step 5: The Match (KISS Hackathon Shortcut).** Originally, your plan was for the AI to select the top three agents, chat with them, check their availability, and debate to find the best one. To save time for the MVP, your AI agent will simply take the top 10 results  and automatically select the number one best match based on the search filters.


* 
**Step 6: The Transaction.** Once the best tradesperson agent is selected, an embedded payment process takes place. For the hackathon, this will generate our `Transaction` entity.


* 
**Step 7: Two-Way Review.** After the physical job is completed, the system prompts a two-way rating system. The human leaves a review for the tradesperson they hired. In return, the tradesperson leaves a review for the human and their AI agent to rate how good of a customer they were.



---

### ASCII User Flow Diagram

```text
+----------------+      "Fix my gutters"      +-------------------+
|                | -------------------------> |                   |
|  Human User    |                            |  User's AI Agent  |
|                | <------------------------- |                   |
+----------------+  (Asks for budget if null) +-------------------+
        ^                                              |
        |                                              | (Queries system with
        |                                              |  budget & criteria)
        |                                              v
        |                                     +-------------------+
        |                                     |                   |
        |                                     |  Platform Search  |
        |                                     |  (Vector/RAG)     |
        |                                     |                   |
        |                                     +-------------------+
        |                                              |
        |                                              | (Returns Top 10 sorted
        |                                              |  by price/rating)
        |                                              v
        |                                     +-------------------+
        |                                     |                   |
        |                                     |  User's AI Agent  |
        |                                     |  (Selects #1 Match|
        |                                     |   for the MVP)    |
        |                                     +-------------------+
        |                                              |
        |                                              | (Initiates embedded
        |                                              |  payment/booking)
        |                                              v
+----------------+                            +-------------------+
|                |                            |                   |
|  Tradesperson  | <------------------------> | Tradesperson's AI |
|  (Physical Job)|      (Job Completed)       | Agent             |
+----------------+                            +-------------------+
        |                                              |
        v                                              v
+----------------+                            +-------------------+
|  Review of     |                            |  Review of        |
|  Tradesperson  | <------------------------> |  Human/Agent      |
+----------------+      (Two-Way Rating)      +-------------------+

```

With this flow, you only need to build a simple chat interface for Step 1, a mock database query for Steps 3-5, a basic checkout screen for Step 6, and a simple rating form for Step 7.

Would you like me to map out the API endpoints (e.g., `POST /api/search`, `POST /api/transaction`) you'll need to support this exact flow so your team can split up the frontend and backend work right now?
