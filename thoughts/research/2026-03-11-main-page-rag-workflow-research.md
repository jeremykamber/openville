---
artifact_type: research
critique_completed: false
critique_cycles: 2
critique_artifacts: ["/Users/isaiahrivera/Documents/GitHubProjects/openville/.planning/critique/2026-03-11-133725-main-page-rag-workflow-research-critique.md", "/Users/isaiahrivera/Documents/GitHubProjects/openville/.planning/critique/2026-03-11-134037-main-page-rag-workflow-research-critique.md"]
---

# Main Page RAG Workflow Research

Date: 2026-03-11
Branch: `feat/rag-workflow-main-page`

## Scope

Move the existing RAG workflow experience onto the main page, keep the backend-connected flow intact, and redesign the frontend so it communicates the AI economy concept without introducing a fake or duplicate workflow.

Additional scope added on 2026-03-11:

- research current best-in-class UI/UX inspiration for AI-native product marketing and workflow surfaces
- use `21st.dev` as the primary component and motion inspiration source
- review Awwwards-style inspiration sources and modern SaaS/product sites to identify concrete patterns worth translating into Openville

## Files Reviewed

- `/Users/isaiahrivera/Documents/GitHubProjects/openville/context/user_flow.md`
- `/Users/isaiahrivera/Documents/GitHubProjects/openville/context/responsbilities.md`
- `/Users/isaiahrivera/Documents/GitHubProjects/openville/app/page.tsx`
- `/Users/isaiahrivera/Documents/GitHubProjects/openville/app/agents/rag-workflow/page.tsx`
- `/Users/isaiahrivera/Documents/GitHubProjects/openville/app/layout.tsx`
- `/Users/isaiahrivera/Documents/GitHubProjects/openville/app/globals.css`
- `/Users/isaiahrivera/Documents/GitHubProjects/openville/app/openville-theme.css`
- `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/chat/components/OpenvilleWorkspace.tsx`
- `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/chat/components/RequestComposer.tsx`
- `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/workflow/hooks/useOpenvilleFlow.ts`
- `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/workflow/client/adapters.ts`
- `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/workflow/client/repository.ts`
- `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/workflow/client/types.ts`
- `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/workflow/components/ContextFormPanel.tsx`
- `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/workflow/components/WorkflowStatusPanel.tsx`
- `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/workflow/components/ShortlistPanel.tsx`
- `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/workflow/components/NegotiationPanel.tsx`
- `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/workflow/components/WinnerPanel.tsx`
- `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/search/components/CandidateResults.tsx`
- `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/landing/components/HeroSection.tsx`
- `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/landing/components/FunnelSection.tsx`
- `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/landing/components/market/AgentMarketGraph.tsx`
- `/Users/isaiahrivera/Documents/GitHubProjects/openville/thoughts/research/2026-03-01-frontend-on-dev-integration-research.md`
- `/Users/isaiahrivera/Documents/GitHubProjects/openville/thoughts/plans/2026-03-01-frontend-on-dev-integration-plan.md`

## External References Reviewed

- `https://21st.dev/`
- `https://21st.dev/an/docs/customization/themes`
- `https://21st.dev/s/component`
- `https://21st.dev/s/text-animation`
- `https://21st.dev/community/components/s/bento-features`
- `https://21st.dev/community/components/s/bento-grid`
- `https://www.awwwards.com/sites/evervault`
- `https://www.awwwards.com/sites/vercel-workflow`
- `https://www.awwwards.com/sites/vercel-ship`
- `https://godly.website/website/870-linear`
- `https://godly.website/website/927-evervault`
- `https://godly.website/website/900-railway`
- `https://www.lapa.ninja/category/saas/`
- `https://linear.app/homepage`
- `https://evervault.com/`
- `https://vercel.com/ai/`
- `https://vercel.com/ai-gateway/`

## External Inspiration Findings

### 21st.dev

`21st.dev` is the clearest reference for the kind of frontend language this redesign should borrow:

- it is component-led instead of template-led
- it emphasizes AI chat surfaces, hero blocks, text effects, shaders, bento structures, and themed systems
- its agent docs show a strong theme-variable model instead of hardcoded one-off styling
- it favors interfaces that feel like tools or operating environments, not generic SaaS brochures

Useful takeaways for Openville:

- build around a distinctive homepage shell, not isolated card polish
- use strong text treatment and one or two deliberate animated moments rather than many weak effects
- keep the design system tokenized so the homepage can evolve without rewriting every component
- use composable “AI-native” UI patterns such as operator consoles, protocol logs, command inputs, and live state surfaces

### Awwwards / Godly / Lapa-Ninja signal

The strongest current references are not generic “AI startup” sites. The most useful examples lean toward:

- dark, high-contrast foundations
- large confident typography
- one memorable hero interaction or graphic system
- modular information density instead of one endless paragraph stack
- motion that reinforces structure rather than distracting from it

Godly’s tagged examples for Linear, Evervault, and Railway repeatedly surface the same cluster of traits:

- dark
- interactive
- clean
- scrolling animation
- bento or modular grid composition

That combination fits Openville well because the product is both conceptual and operational. The homepage needs atmosphere, but it also needs to prove that work is actually happening.

### Linear

Linear’s current homepage is especially relevant because it frames product value as an operating system, not a marketing slogan. The key pattern is not the exact visuals. It is the structure:

- a sharp product thesis
- a sequence of clearly named operational stages
- product evidence embedded directly in the story
- interfaces shown as tools in motion, not static screenshots

Useful translation for Openville:

- structure the homepage around the market lifecycle
- label the flow in explicit stages
- make each stage feel like a real system boundary
- show the request, ranking, negotiation, and winner selection as one connected operating surface

### Evervault

Evervault is useful because it sells something complex and trust-sensitive without becoming visually dry. The site combines:

- dark product polish
- infrastructure mood
- embedded code and system views
- audit/log/policy surfaces that signal seriousness

Useful translation for Openville:

- the homepage should feel more like a market protocol terminal than a generic marketplace
- fallback signals, backend readiness, ranking rationale, and negotiation traces should be treated as visual strengths rather than hidden implementation details

### Vercel AI / AI Gateway

Vercel’s AI pages are useful for platform communication:

- platform thesis first
- orbit/network diagrams to show multiple actors or providers
- clean modular product sections
- strong “one interface, many engines” framing

Useful translation for Openville:

- represent Openville as one request surface coordinating a multi-agent economy
- use network or orbital composition around the market graph
- visually reinforce that multiple operators compete behind one simple buyer input

## Best-Fit Visual Direction For Openville

The right direction is not “more dashboard” and not “more cinematic landing page.”

It should be:

- **retro-futuristic civic market terminal**
- dark and infrastructural, but warmer than a cold devtools aesthetic
- elegant enough to feel premium
- dense enough to feel real
- animated enough to feel alive

Why this fits:

- the repo already has a dark, earthy palette that can support this direction
- the product concept is about an AI-mediated market, so a terminal / exchange / protocol aesthetic is more truthful than a generic SaaS bento layout
- the market graph already gives the product a distinctive core metaphor

## Concrete Frontend Opportunities

### 1. Replace the linear story stack with a command deck hero

Current issue:
- the homepage asks the user to scroll through story sections before the real workflow becomes primary

Proposed direction:
- hero becomes a command deck with immediate request entry
- left side: command composer, speed, budget, short protocol explainer
- right side: live market visualization with workflow stage awareness
- supporting micro-panels around it: market status, active agents, negotiation pressure, or winner criteria

### 2. Turn the market graph into the homepage’s signature asset

Current issue:
- `AgentMarketGraph` is the strongest visual in the repo, but it is trapped inside scroll-story behavior and fullscreen assumptions

Proposed direction:
- make it container-aware
- use it as the hero’s living centerpiece
- surround it with small contextual readouts rather than explanatory paragraphs
- let the graph stage reflect current workflow phase or preview the market lifecycle before execution

### 3. Upgrade the workflow from stacked cards to an operator surface

Current issue:
- the active mode is functional, but the layout still reads like sequential cards

Proposed direction:
- reorganize as an operator surface with clearer hierarchy
- top band: command deck
- left rail: status, buyer brief, protocol/fallback signals
- main rail: candidate board, shortlist, negotiation outcomes, winner summary
- optional narrow rail or embedded strip: live transcript / protocol log / agent thread

### 4. Use “evidence panels” instead of decorative filler

Strong references like Evervault and Linear prove the value through interface evidence.

Openville equivalents:

- backend readiness
- market source and retrieval mode
- shortlist reasoning
- negotiation result summaries
- winner rationale
- fallback/degraded signals

These should become polished visual blocks with stronger hierarchy, not plain support cards.

### 5. Increase motion quality, not motion quantity

Borrow from 21st.dev and top product sites:

- staggered page-load reveal
- subtle grid drift / orbital glow behind the market graph
- animated text or number counters only where they clarify state
- stage transitions tied to actual workflow progress

Avoid:

- heavy parallax for its own sake
- long-scrollytelling as the main mechanism
- noisy perpetual animation on every block

### 6. Strengthen typography and composition

Current issue:
- the type and spacing are decent, but the page still reads like a competent internal prototype

Proposed direction:
- larger editorial hero headline
- tighter, more intentional vertical rhythm
- more asymmetry in hero composition
- fewer but stronger chips and badges
- one memorable text treatment for the AI economy thesis

## What To Borrow Vs. What To Avoid

### Borrow

- 21st.dev: component-led experimentation, themeability, text effects, AI-native shell ideas
- Linear: operating-system framing and stage-based storytelling
- Evervault: trust-through-interface-evidence and infrastructure polish
- Vercel AI / Gateway: network diagrams and platform clarity
- Godly / Awwwards / Lapa: bold hero composition, dark modular surfaces, restrained motion, high information density

### Avoid

- generic purple-on-white AI startup look
- overusing bento grids just because they are fashionable
- swapping Openville’s warmer palette for sterile monochrome minimalism
- converting the page into a screenshot gallery without live state
- keeping the current story-scroll and simply adding prettier gradients

## Updated Repo Implications

This design research changes the earlier conclusion in one important way:

- the problem is not only “move the workflow to the main page”
- the problem is also “give the main page a visual system worthy of the AI economy concept”

That means the redesign should explicitly target:

- composition
- motion
- hierarchy
- visual language
- signature moments

not just flow relocation.

## Design Proposal To Carry Into Planning

The homepage should become a **Market Command Deck**.

Recommended composition:

1. Hero / command deck
   - request composer
   - top-level speed and budget controls
   - short AI economy thesis
   - live market graph
   - compact protocol badges

2. Operational body
   - left rail for buyer brief, backend status, fallback signals
   - main rail for candidate board, shortlist, negotiation, winner
   - transcript or execution thread visually demoted but still accessible

3. Signature visual language
   - dark civic-terminal palette
   - orbital or exchange-like graph treatment
   - subtle grid and glow layers
   - sharper typography and stronger section framing

4. Backend constraint
   - preserve the backend behavior proven by `/agents/rag-workflow`
   - frontend may change aggressively, but backend semantics must not drift

## Current Repo Truth

### Main page

`app/page.tsx` already renders `OpenvilleWorkspace` directly, with no extra routing or composition layer in between. Evidence: `/Users/isaiahrivera/Documents/GitHubProjects/openville/app/page.tsx:1-4`.

That means the workflow is technically already on the main page, but the current UX splits the experience into:

1. a scroll-driven story mode using landing sections
2. a transition state
3. an active workspace mode

This creates extra ceremony before the real workflow becomes visible.

### Functional workflow source of truth

The real backend-connected frontend flow is not `app/agents/rag-workflow/page.tsx`. The homepage flow is owned by `OpenvilleWorkspace` and `useOpenvilleFlow`. Evidence: `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/chat/components/OpenvilleWorkspace.tsx:26-55`, `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/workflow/hooks/useOpenvilleFlow.ts:111-193`.

The authoritative frontend source of truth is:

- `features/chat/components/OpenvilleWorkspace.tsx`
- `features/workflow/hooks/useOpenvilleFlow.ts`
- `features/workflow/client/repository.ts`
- `features/workflow/client/adapters.ts`

That flow already uses the typed repository boundary in `features/workflow/client/repository.ts`. Evidence: `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/workflow/client/repository.ts:66-92`.

Endpoints currently used by the homepage flow:

- `GET /api/workflow/status`
- `POST /api/agents/search-and-select`
- `POST /api/agents/negotiate/run`
- `POST /api/agents/select-winner`

### Standalone RAG route

`app/agents/rag-workflow/page.tsx` is a separate LangGraph streaming page. Evidence: `/Users/isaiahrivera/Documents/GitHubProjects/openville/app/agents/rag-workflow/page.tsx:1-102`.

It is visually simpler but it is not the active homepage workflow orchestration. It submits directly to `openville-rag-agent` using `useStream`, has its own priority/budget controls, and renders `RAGWorkflowStreamer`.

This route appears standalone in current repo usage. The homepage does not depend on it, and codebase search found no product-facing references beyond the route file, critique docs, and historical notes. Evidence: repo search results captured during critique and `/Users/isaiahrivera/Documents/GitHubProjects/openville/app/page.tsx:1-4`.

## Existing Patterns To Follow

### UI and styling

- Theme tokens and reusable classes already exist in `app/openville-theme.css`. Evidence: `/Users/isaiahrivera/Documents/GitHubProjects/openville/app/openville-theme.css:1-174`.
- The homepage UI uses `ov-shell`, `ov-panel`, `ov-panel-strong`, `ov-chip`, and `ov-kicker`. Evidence: `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/chat/components/OpenvilleWorkspace.tsx:95-205`.
- Cards and inputs come from `components/ui/*`.
- The design language is already dark, earthy, and futuristic. It is not a blank slate.

### Frontend orchestration

- `useOpenvilleFlow` owns the request text, inferred context, workflow status, search, negotiation, winner selection, and local transcript. Evidence: `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/workflow/hooks/useOpenvilleFlow.ts:111-259`.
- `createContextFormValues()` infers structured fields from the user request. Evidence: `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/workflow/client/adapters.ts:216-236`.
- `buildWorkflowContext()` converts form values into backend-safe request payloads. Evidence: `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/workflow/client/adapters.ts:238-280`.
- Existing panels already map to the documented product flow:
  - request capture
  - context gathering
  - market search and ranking
  - shortlist
  - negotiation
  - winner selection

### AI economy visualization

- The repo already contains a market visualization in `AgentMarketGraph`. Evidence: `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/landing/components/market/AgentMarketGraph.tsx:244-320`.
- The current `FunnelSection` uses it as a scroll story, not as a live operational panel. Evidence: `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/landing/components/FunnelSection.tsx:11-57`.
- This is the strongest existing visual artifact for the "AI economy" concept and should be reused rather than replaced with a generic dashboard.

## Reusable Code

Keep and reuse:

- `useOpenvilleFlow` as the single client orchestration hook
- `openvilleWorkflowRepository` for all backend calls
- `ContextFormPanel`, `WorkflowStatusPanel`, `CandidateResults`, `ShortlistPanel`, `NegotiationPanel`, `WinnerPanel`
- `RequestComposer` as the primary request input base
- `AgentMarketGraph` for AI economy visualization
- existing theme tokens in `app/openville-theme.css`

## Problems With Current UX

1. The main page already owns the workflow, but story mode delays access to it.
2. The landing sections communicate vision, but the actual job-posting controls are not immediately available as a command center.
3. The standalone `/agents/rag-workflow` page duplicates part of the concept and can confuse the product surface.
4. The user specifically wants speed and budget to feel like first-class controls; currently they exist either:
   - on the standalone route, or
   - inside the later context form after request capture

## Gap Scan

### Security

The planned homepage refactor does not change the backend route boundary. The same Next API routes remain the write/read surface through `openvilleWorkflowRepository`. Evidence: `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/workflow/client/repository.ts:66-92`.

Open question:
- whether moving more controls above the fold changes any abuse or spam concerns is not answered by this research because no auth/rate-limit inspection was in scope

### Performance

`AgentMarketGraph` currently renders as a full-viewport component using `w-screen h-screen` and viewport-breaking margins. Evidence: `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/landing/components/market/AgentMarketGraph.tsx:246-252`.

Implementation implication:
- the graph cannot be embedded into a compact homepage command center unchanged

### Backwards compatibility

The main page already hosts the canonical typed workflow, so the main backwards-compatibility question is what to do with `/agents/rag-workflow`, not whether the homepage can host the workflow at all.

### Migration path

Three viable migration choices exist:

1. keep `/agents/rag-workflow` unchanged as a debug/operator surface
2. turn `/agents/rag-workflow` into a thin wrapper around shared components
3. redirect `/agents/rag-workflow` to `/`

Route-audit result:

- there are no current product-routing dependencies on `/agents/rag-workflow`
- there are historical handoff and planning artifacts that still reference it as a debugging or verification surface

Evidence:
- `/Users/isaiahrivera/Documents/GitHubProjects/openville/app/agents/rag-workflow/page.tsx:1-102`
- `/Users/isaiahrivera/Documents/GitHubProjects/openville/thoughts/shared/handoffs/general/2026-03-01_openville-rag-agent-phase4-complete.md:16-35`

Revised conclusion:

- do not treat `/agents/rag-workflow` as a primary product route
- keep it as an explicitly secondary debug/operator surface for now
- defer redirect/removal until historical docs and operator usage are intentionally cleaned up

### Failure modes

The key failure modes visible from code inspection are:

1. top-level speed/budget controls become a second state source instead of feeding `contextForm`
2. graph embedding breaks layout because the current graph assumes fullscreen viewport space
3. redirecting `/agents/rag-workflow` removes a still-useful debug surface without an explicit decision

## Grounded Direction

The best low-risk approach is:

- keep the main page as the only primary workflow entry
- remove the story/transition split from `OpenvilleWorkspace`
- build one integrated hero/workspace shell on the main page
- keep the real backend flow unchanged
- promote speed and budget into the primary request surface
- reuse `AgentMarketGraph` as a compact live market explainer tied to workflow progress

## Risks

1. `AgentMarketGraph` is currently fullscreen-oriented and may need adaptation for a homepage command surface.
2. Promoting speed/budget into the first screen should not bypass the existing form adapter logic or create a second source of truth.
3. The old standalone RAG page should not diverge from the homepage after this refactor.
4. Visual changes should preserve mobile layout and loading/error/empty states.

## Assumptions

- The main backend-connected workflow should remain the canonical runtime path.
- The standalone LangGraph page is optional after the homepage refactor and can safely redirect if needed.
- The product vision should be expressed with real workflow states, not mocked cinematic sections.

## Implementation Implications

The research implies the following implementation constraints:

1. `OpenvilleWorkspace` should remain the top-level homepage shell, but its `story`, `transitioning`, and `active` split likely needs to collapse into one persistent page structure. Evidence: `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/chat/components/OpenvilleWorkspace.tsx:24-27`, `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/chat/components/OpenvilleWorkspace.tsx:93-250`.

2. Any new top-level speed and budget controls must write into the same `contextForm` state that currently feeds `buildWorkflowContext()`. The existing `prepareRequest()` path currently seeds `contextForm` from `createContextFormValues(trimmed)` and nothing else. Evidence: `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/workflow/hooks/useOpenvilleFlow.ts:169-193`.

3. `RequestComposer` is the cleanest place to extend the request entry surface because it is already reused across landing and active variants. Evidence: `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/chat/components/RequestComposer.tsx:4-89`.

4. `AgentMarketGraph` can be reused conceptually, but it needs container-aware sizing before it can live inside a compact hero or command panel. Evidence: `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/landing/components/market/AgentMarketGraph.tsx:246-252`.

5. Route handling for `/agents/rag-workflow` must stay an explicit decision in the plan. The research proves the route is not the homepage source of truth, but it does not yet prove the route is safe to remove.

6. `RequestComposer` should remain a focused request-input primitive. New speed/budget controls should live in a homepage wrapper or hero component that composes `RequestComposer`, then writes canonical values into `contextForm`. Evidence: `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/chat/components/RequestComposer.tsx:20-89`.

## Verification Path

Known verification targets from repo inspection:

1. verify `/` still renders the homepage workflow shell
2. verify `useOpenvilleFlow` still drives `GET /api/workflow/status`, `POST /api/agents/search-and-select`, `POST /api/agents/negotiate/run`, and `POST /api/agents/select-winner`
3. verify the graph remains responsive after any containerization changes
4. verify `/agents/rag-workflow` behavior matches the final migration choice

Exact automated commands still need confirmation from local scripts before implementation starts.

Confirmed repo scripts from `package.json`: `/Users/isaiahrivera/Documents/GitHubProjects/openville/package.json:5-14`

- `npm run build`
- `npm run lint`
- `npm run test:run`
- `npm run agent`

Most relevant validation commands for this work:

1. `npm run lint`
2. `npm run build`
3. `npm run test:run -- features/workflow/client/__tests__/adapters.test.ts`

## Readiness

Clarity: high
Codebase coverage: sufficient for implementation
Constraints: clear
Verification path: available via lint/build/tests and local app run

The task is ready for implementation planning.
