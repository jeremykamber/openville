### Written User Flow (v2 - Agent Negotiation Edition)

* 
**Step 1: The Request.** The human user talks to their personal AI agent and requests a service, such as getting their gutters fixed.


* 
**Step 2: Context Gathering.** The AI agent checks its memory for the human's past preferences, such as wanting the most cost-effective option due to budget constraints. If the agent doesn't have this information, it will ask the user follow-up questions to determine their budget.


* 
**Step 3: The Search.** The AI agent takes this criteria and queries the platform's system using RAG (Retrieval Augmented Generation) to find relevant tradespeople and their agents.


* 
**Step 4: Ranking and Filtering.** The system uses RAG to retrieve the top 50 candidates, then ranks them by:
- RAG relevance score
- Number of successful services completed
- Time on the platform
- Customer ratings

The system returns the top 10 best matches to the agent.


* 
**Step 5: Agent Reasoning.** The AI agent analyzes the top 10 results, considers the human's priorities and preferences, and narrows it down to a top 3 list of candidates.


* 
**Step 6: Agent-to-Agent Negotiation.** The user's AI agent chats with each of the three shortlisted tradesperson agents to:
- Negotiate discounts (tradesperson agents can offer discounts if needed)
- Discuss potential compromises
- Refine the scope of work to get the best price for the human


* 
**Step 7: Final Selection.** After negotiating with all three candidates, the agent does additional reasoning based on the human's priorities and selects the best option.


* 
**Step 8: The Transaction.** Once a tradesperson agent is selected, an embedded payment process takes place to finalize the booking.


* 
**Step 9: Human Notification.** The human user is notified of the completed transaction. The human can be in the loop at this stage if needed.


* 
**Step 10: Two-Way Review.** After the physical job is completed, the system prompts a two-way rating system. The human leaves a review for the tradesperson they hired. In return, the tradesperson leaves a review for the human and their AI agent to rate how good of a customer they were.



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
        |                                     |  (RAG + Ranking)  |
        |                                     |                   |
        |                                     +-------------------+
        |                                              |
        |                                              | (Returns Top 10
        |                                              |  sorted by relevance,
        |                                              |  success, time, rating)
        |                                              v
        |                                     +-------------------+
        |                                     |                   |
        |                                     |  User's AI Agent  |
        |                                     |  (Narrows to Top 3|
        |                                     |   based on human  |
        |                                     |   priorities)     |
        |                                     +-------------------+
        |                                              |
        |                                              | (Agent-to-Agent Chat)
        |                                              |  - Discounts
        |                                              |  - Compromises
        |                                              |  - Scope refinement
        |                                              v
        |                                     +-------------------+
        |                                     |                   |
        |                                     |  User's AI Agent  |
        |                                     |  (Selects best    |
        |                                     |   option)         |
        |                                     +-------------------+
        |                                              |
        |                                              | (Initiates embedded
        |                                              |  payment/booking)
        |                                              v
 +----------------+                            +-------------------+
 |                | <------------------------- |                   |
 | Tradesperson   |      (Job Completed)       | Tradesperson's AI |
 | (Physical Job) |                            | Agent             |
 +----------------+                            +-------------------+
        |                                              |
        v                                              v
 +----------------+                            +-------------------+
 |  Review of     |                            |  Review of        |
 |  Tradesperson  | <-------------------------> |  Human/Agent      |
 +----------------+      (Two-Way Rating)      +-------------------+

```

With this flow, you need to build a chat interface for Step 1, a RAG-powered search with ranking for Steps 3-4, agent reasoning logic for Steps 5 & 7, agent-to-agent communication for Step 6, an embedded checkout for Step 8, notification system for Step 9, and a rating form for Step 10.
