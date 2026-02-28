# AI Service Marketplace - 10-Hour MVP Technical Specification

## 1. Architectural Philosophy (SOLID & KISS)
* **Keep It Simple, Stupid (KISS):** We are dropping complex, unpredictable features (multi-agent debate, real Google Calendar OAuth) in favor of scripted LLM decision-making and hardcoded availability. 
* **Single Responsibility Principle (SRP):** Every service defined below has exactly one reason to change. Data access is strictly separated from business logic.
* **Dependency Inversion Principle (DIP):** Services will communicate via interfaces (e.g., `ILLMProvider`, `IDatabase`), meaning Team Member B can mock the database while Team Member A is still building it.

---

## 2. Core Entities (Data Layer)
These interfaces define our data contracts. They contain no logic.

* **`Human`**: Represents the user. [cite_start]Contains an ID, name, bio, and a list of agent IDs[cite: 44, 45, 46]. [cite_start](Profile picture is explicitly excluded for simplicity [cite: 47]).
* **`AIAgent`**: The digital proxy. [cite_start]Contains an ID, name, bio, AI model used, platform age, and a list of past transaction objects[cite: 27, 28, 29, 30, 36, 40].
* **`ServiceListing`**: Represents the job offered by a tradesperson. Contains listing ID, title (e.g., "Gutter Repair"), base price, description, and the owning `AIAgent` ID.
* **`Transaction`**: The immutable receipt. [cite_start]Contains price, quantity, time of purchase, time of fulfillment, agent IDs, a transaction summary, tradesperson fulfillment rating, and human customer rating[cite: 37, 38, 39, 43].
* [cite_start]**`Conversation`**: Stores the raw messages exchanged between the AI agents separately to prevent bloating the transaction object[cite: 41, 42].



---

## 3. Services Breakdown & Delegation

To ensure no Git conflicts, the repository should be structured into three separate directories (e.g., `/src/identity`, `/src/discovery`, `/src/execution`). Each team member owns one directory.

### Team Member 1: Core Identity & Setup (The Foundation)
**Focus:** Database configuration, User management, and Agent profiles.

* **`DatabaseService`**
    * **Responsibility:** The sole wrapper for your database (e.g., Firebase). 
    * **SOLID Alignment:** SRP. If you change databases, only this file changes.
* **`HumanProfileService`**
    * **Responsibility:** CRUD operations for the `Human` entity.
    * **SOLID Alignment:** SRP. Handles only human state.
* **`AgentProfileService`**
    * **Responsibility:** CRUD operations for the `AIAgent` entity.
    * **SOLID Alignment:** SRP. Handles only agent state.

### Team Member 2: Discovery & AI (The Brains)
**Focus:** Search algorithms, RAG/Vector integrations, and LLM prompting.

* **`ListingSearchService`**
    * [cite_start]**Responsibility:** Takes the parsed user intent ("I need my gutters fixed" [cite: 2][cite_start]) and searches the database for relevant jobs[cite: 5]. [cite_start]Implements sorting by price (low to high, high to low), rating, or longevity[cite: 7, 8]. [cite_start]Returns the top 10 matches[cite: 9, 10].
    * **SOLID Alignment:** SRP. Purely handles querying and sorting data.
* **`AgentNegotiationService`**
    * **Responsibility:** The LLM wrapper. [cite_start]Takes the top 10 list and narrows it down to 3[cite: 10]. [cite_start]Simulates a chat to find out information like past success and house types[cite: 14, 15]. [cite_start]Executes the reasoning prompt to choose the final best option[cite: 17].
    * **SOLID Alignment:** SRP. This service does not care how the data was found, only how the LLM interacts with it.
    * **KISS:** For the 10-hour MVP, mock the 3-way chat by having a single LLM prompt evaluate the top 3 listings and output a simulated transcript and a final decision.

### Team Member 3: Execution & History (The Closing)
**Focus:** Finalizing the deal, mocking payments, and handling the two-way rating system.

* **`CheckoutService`**
    * [cite_start]**Responsibility:** Takes the final chosen service from the `AgentNegotiationService` and executes the embedded payment simulation[cite: 17, 18].
    * **KISS:** Do not integrate Stripe. Return a simulated `200 OK` success object after a 2-second timeout.
* **`TransactionLoggingService`**
    * [cite_start]**Responsibility:** Creates the `Transaction` entity and the `Conversation` entity, saving them to the database to finalize the interaction[cite: 41, 42, 43].
    * **SOLID Alignment:** SRP. Only handles writing historical state.
* **`RatingService`**
    * [cite_start]**Responsibility:** Manages the post-transaction workflow where the human rates the tradesperson, and the tradesperson rates the human/agent buyer[cite: 19, 20]. [cite_start]Updates the respective `AIAgent` past transaction arrays[cite: 36].
    * **SOLID Alignment:** ISP. This exposes a very narrow interface (`submitRating(transactionId, rating)`) so the UI can easily hook into it.

---

## 4. Immediate Next Steps for the Team
1.  **Initialize Git:** Create the 3 folder structures (`/identity`, `/discovery`, `/execution`).
2.  **Define Interfaces First:** Spend the next 15 minutes writing the TypeScript `interface` or Python `Protocol` definitions for these services. 
3.  **Mock Data:** Team Member 1 needs to manually inject 15 fake "Service Listings" into the DB immediately so Team Member 2 can start testing their search logic.
4.  **Isolate:** Stay in your respective folders. Do not touch another member's service; if you need data from them, call the interface methods you agreed upon in Step 2.
