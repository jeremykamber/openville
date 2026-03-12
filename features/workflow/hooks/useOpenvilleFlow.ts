"use client";

import { useCallback, useRef, useState } from "react";

import type { ChatMessage, ChatMessageRole } from "@/features/shared/contracts/ChatMessage";
import { createMessageId } from "@/features/chat/utils/createMessageId";
import {
  applyWorkflowHomepageControls,
  buildContextSummaryItems,
  buildSelectWinnerRequest,
  buildWorkflowContext,
  createContextFormValues,
  deriveSpeedPresetFromContext,
  toEliminationViewModels,
  toFinalistShowdownViewModels,
  toNegotiationOutcomeViewModels,
  toNegotiationThreadViewModel,
  toSearchResultsViewModel,
  toShortlistViewModels,
  toWinnerSummaryViewModel,
} from "@/features/workflow/client/adapters";
import {
  getNegotiationDetail,
  openvilleWorkflowRepository,
} from "@/features/workflow/client/repository";
import type {
  AgentPitchSceneState,
  EliminationCandidateViewModel,
  FinalistShowdownViewModel,
  NegotiationOutcomeViewModel,
  NegotiationThreadViewModel,
  SearchAndSelectResponse,
  SearchResultsViewModel,
  SelectWinnerResponse,
  ShortlistItemViewModel,
  WorkflowHomepageControls,
  WinnerSummaryViewModel,
  WorkflowContextFormValues,
  RunNegotiationsResponse,
} from "@/features/workflow/client/types";
import type { WorkflowExecutionMeta, WorkflowStatusResponse } from "@/features/workflow/types";

type ResourceStatus = "idle" | "loading" | "success" | "error";
type SearchStatus = "idle" | "loading" | "success" | "empty" | "error";

interface AsyncResource<TData, TStatus extends string = ResourceStatus> {
  status: TStatus;
  data: TData | null;
  error: string | null;
}

const INTRO_MESSAGE =
  "Describe the scope, review the inferred context, then run the market. Search, shortlist, negotiation, and winner selection now execute against the backend workflow.";

const initialStatusState: AsyncResource<WorkflowStatusResponse> = {
  status: "idle",
  data: null,
  error: null,
};

const initialSearchState: AsyncResource<SearchAndSelectResponse, SearchStatus> = {
  status: "idle",
  data: null,
  error: null,
};

const initialNegotiationState: AsyncResource<RunNegotiationsResponse> = {
  status: "idle",
  data: null,
  error: null,
};

const initialWinnerState: AsyncResource<SelectWinnerResponse> = {
  status: "idle",
  data: null,
  error: null,
};

const initialHomepageControls: WorkflowHomepageControls = {
  speed: "balanced",
  budget: "",
  budgetTouched: false,
};

type ThreadLoadStatus = "idle" | "loading" | "success" | "not_found" | "error";

interface NegotiationThreadState {
  status: ThreadLoadStatus;
  data: NegotiationThreadViewModel | null;
  error: string | null;
  activeNegotiationId: string | null;
}

const initialThreadState: NegotiationThreadState = {
  status: "idle",
  data: null,
  error: null,
  activeNegotiationId: null,
};

function createMessage(role: ChatMessageRole, content: string): ChatMessage {
  return {
    id: createMessageId(role),
    role,
    content,
    timestamp: new Date().toISOString(),
    status: "sent",
  };
}

function createIntroTranscript(): ChatMessage[] {
  return [createMessage("system", INTRO_MESSAGE)];
}

function buildSearchSummary(response: SearchAndSelectResponse): string {
  const candidateCount = response.searchResults.length;
  const shortlistCount = response.selectionResult?.top3.length ?? 0;

  if (candidateCount === 0) {
    return "The market returned no viable candidates. Tighten the brief or relax the constraints and rerun.";
  }

  if (shortlistCount === 0) {
    return `Ranked ${candidateCount} candidates, but the backend skipped shortlist selection because fewer than three viable operators were available.`;
  }

  return `Ranked ${candidateCount} candidates and narrowed the field to ${shortlistCount} finalists for negotiation.`;
}

function buildNegotiationSummary(response: RunNegotiationsResponse): string {
  const accepted = response.outcomes.filter((outcome) => outcome.status === "completed").length;
  const rejected = response.outcomes.filter((outcome) => outcome.status === "rejected").length;
  const failed = response.outcomes.filter((outcome) => outcome.status === "failed").length;

  return `Negotiations finished across ${response.outcomes.length} finalists: ${accepted} accepted, ${rejected} rejected, ${failed} failed.`;
}

function buildWarningMessage(meta: Pick<WorkflowExecutionMeta, "warnings">): string | null {
  if (meta.warnings.length === 0) {
    return null;
  }

  return `Degraded signals: ${meta.warnings.join(" ")}`;
}

export function useOpenvilleFlow() {
  const [messages, setMessages] = useState<ChatMessage[]>(createIntroTranscript());
  const [input, setInput] = useState("");
  const [requestQuery, setRequestQuery] = useState<string | null>(null);
  const [contextForm, setContextForm] = useState<WorkflowContextFormValues | null>(null);
  const [inferredContextForm, setInferredContextForm] =
    useState<WorkflowContextFormValues | null>(null);
  const [homepageControls, setHomepageControls] =
    useState<WorkflowHomepageControls>(initialHomepageControls);
  const [workflowStatus, setWorkflowStatus] = useState(initialStatusState);
  const [search, setSearch] = useState(initialSearchState);
  const [negotiation, setNegotiation] = useState(initialNegotiationState);
  const [winner, setWinner] = useState(initialWinnerState);
  const [threadState, setThreadState] = useState(initialThreadState);
  const threadAbortRef = useRef<AbortController | null>(null);

  const isBusy =
    search.status === "loading" ||
    negotiation.status === "loading" ||
    winner.status === "loading";

  async function refreshStatus() {
    setWorkflowStatus((current) => ({
      status: "loading",
      data: current.data,
      error: null,
    }));

    try {
      const data = await openvilleWorkflowRepository.getStatus();

      setWorkflowStatus({
        status: "success",
        data,
        error: null,
      });
    } catch (error) {
      setWorkflowStatus({
        status: "error",
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "Unable to read workflow status.",
      });
    }
  }

  function updateContextField<TKey extends keyof WorkflowContextFormValues>(
    field: TKey,
    value: WorkflowContextFormValues[TKey],
  ) {
    setContextForm((current) => {
      if (!current) {
        return current;
      }

      const nextValues = {
        ...current,
        [field]: value,
      };

      if (field === "budget") {
        setHomepageControls((controls) => ({
          ...controls,
          budget: String(value),
          budgetTouched: true,
        }));
      }

      if (field === "priority" || field === "urgency") {
        setHomepageControls((controls) => ({
          ...controls,
          speed: deriveSpeedPresetFromContext({
            priority: nextValues.priority,
            urgency: nextValues.urgency,
          }),
        }));
      }

      return nextValues;
    });
  }

  function updateHomepageSpeed(speed: WorkflowHomepageControls["speed"]) {
    let nextControls = homepageControls;
    setHomepageControls((current) => {
      nextControls = {
        ...current,
        speed,
      };

      return nextControls;
    });

    setContextForm((current) => {
      if (!current || !inferredContextForm) {
        return current;
      }

      return applyWorkflowHomepageControls(current, inferredContextForm, nextControls);
    });
  }

  function updateHomepageBudget(budget: string) {
    let nextControls = homepageControls;
    setHomepageControls((current) => {
      nextControls = {
        ...current,
        budget,
        budgetTouched: true,
      };

      return nextControls;
    });

    setContextForm((current) => {
      if (!current || !inferredContextForm) {
        return current;
      }

      return applyWorkflowHomepageControls(current, inferredContextForm, nextControls);
    });
  }

  function prepareRequest() {
    const trimmed = input.trim();

    if (!trimmed || isBusy) {
      return false;
    }

    const inferredValues = createContextFormValues(trimmed);
    const preparedContext = applyWorkflowHomepageControls(
      inferredValues,
      inferredValues,
      homepageControls,
    );

    setRequestQuery(trimmed);
    setInferredContextForm(inferredValues);
    setContextForm(preparedContext);
    setHomepageControls((current) => ({
      ...current,
      speed: deriveSpeedPresetFromContext(preparedContext),
      budget: preparedContext.budget,
      budgetTouched: current.budgetTouched || preparedContext.budget.length > 0,
    }));
    setMessages([
      ...createIntroTranscript(),
      createMessage("user", trimmed),
      createMessage(
        "assistant",
        "Request captured. Review the inferred context, adjust anything the market should respect, then run the search.",
      ),
    ]);
    setInput("");
    setSearch(initialSearchState);
    setNegotiation(initialNegotiationState);
    setWinner(initialWinnerState);
    setThreadState(initialThreadState);
    if (threadAbortRef.current) {
      threadAbortRef.current.abort();
      threadAbortRef.current = null;
    }
    void refreshStatus();

    return true;
  }

  async function submitContext() {
    if (!requestQuery || !contextForm || isBusy) {
      return;
    }

    const workflowContext = buildWorkflowContext(requestQuery, contextForm);

    setSearch({
      status: "loading",
      data: null,
      error: null,
    });
    setNegotiation(initialNegotiationState);
    setWinner(initialWinnerState);
    setThreadState(initialThreadState);
    if (threadAbortRef.current) {
      threadAbortRef.current.abort();
      threadAbortRef.current = null;
    }

    try {
      const data = await openvilleWorkflowRepository.searchAndSelect({
        query: workflowContext.query,
        userPreferences: workflowContext.userPreferences,
        scope: workflowContext.scope,
        limit: 10,
      });

      setSearch({
        status: data.searchResults.length > 0 ? "success" : "empty",
        data,
        error: null,
      });

      const warningMessage = buildWarningMessage(data.meta);
      setMessages((current) => [
        ...current,
        createMessage("assistant", buildSearchSummary(data)),
        ...(warningMessage ? [createMessage("system", warningMessage)] : []),
      ]);
      void refreshStatus();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to search the market.";

      setSearch({
        status: "error",
        data: null,
        error: message,
      });
      setMessages((current) => [
        ...current,
        createMessage("system", `Search failed: ${message}`),
      ]);
    }
  }

  async function runNegotiations() {
    if (!requestQuery || !contextForm || !search.data?.selectionResult || isBusy) {
      return;
    }

    const workflowContext = buildWorkflowContext(requestQuery, contextForm);

    setNegotiation({
      status: "loading",
      data: null,
      error: null,
    });
    setWinner(initialWinnerState);
    setThreadState(initialThreadState);
    if (threadAbortRef.current) {
      threadAbortRef.current.abort();
      threadAbortRef.current = null;
    }

    try {
      const data = await openvilleWorkflowRepository.runNegotiations({
        buyerAgentId: "buyer-agent-openville",
        candidates: search.data.selectionResult.top3,
        preferences: workflowContext.userPreferences,
        scope: workflowContext.scope,
        maxRounds: 2,
      });

      setNegotiation({
        status: "success",
        data,
        error: null,
      });

      const warningMessage = buildWarningMessage(data.meta);
      setMessages((current) => [
        ...current,
        createMessage("assistant", buildNegotiationSummary(data)),
        ...(warningMessage ? [createMessage("system", warningMessage)] : []),
      ]);
      void refreshStatus();

      // Auto-fetch the first negotiation thread for the inspector rail
      const firstOutcomeId = data.outcomes[0]?.negotiationId;
      if (firstOutcomeId) {
        void fetchNegotiationThread(firstOutcomeId);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to run negotiations.";

      setNegotiation({
        status: "error",
        data: null,
        error: message,
      });
      setMessages((current) => [
        ...current,
        createMessage("system", `Negotiation failed: ${message}`),
      ]);
    }
  }

  async function selectWinner() {
    if (!requestQuery || !contextForm || !negotiation.data || isBusy) {
      return;
    }

    const workflowContext = buildWorkflowContext(requestQuery, contextForm);
    const request = buildSelectWinnerRequest(
      negotiation.data.outcomes,
      workflowContext.userPreferences,
    );

    if (!request) {
      const message =
        "Winner selection requires at least one negotiation outcome with a transport result.";

      setWinner({
        status: "error",
        data: null,
        error: message,
      });
      setMessages((current) => [
        ...current,
        createMessage("system", message),
      ]);
      return;
    }

    setWinner({
      status: "loading",
      data: null,
      error: null,
    });

    try {
      const data = await openvilleWorkflowRepository.selectWinner(request);
      const winnerName =
        search.data?.searchResults.find(
          (candidate) => candidate.agentId === data.winner.candidateId,
        )?.name ?? data.winner.candidateId;

      setWinner({
        status: "success",
        data,
        error: null,
      });

      const warningMessage = buildWarningMessage(data.meta);
      setMessages((current) => [
        ...current,
        createMessage(
          "assistant",
          `Winner selected: ${winnerName}. ${data.summary}`,
        ),
        ...(warningMessage ? [createMessage("system", warningMessage)] : []),
      ]);
      void refreshStatus();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to select a winner.";

      setWinner({
        status: "error",
        data: null,
        error: message,
      });
      setMessages((current) => [
        ...current,
        createMessage("system", `Winner selection failed: ${message}`),
      ]);
    }
  }

  const fetchNegotiationThread = useCallback(
    async (negotiationId: string) => {
      // Abort any in-flight request for a previous thread
      if (threadAbortRef.current) {
        threadAbortRef.current.abort();
      }

      const controller = new AbortController();
      threadAbortRef.current = controller;

      setThreadState({
        status: "loading",
        data: null,
        error: null,
        activeNegotiationId: negotiationId,
      });

      try {
        const response = await getNegotiationDetail(
          negotiationId,
          controller.signal,
        );
        const viewModel = toNegotiationThreadViewModel(response);

        setThreadState({
          status: "success",
          data: viewModel,
          error: null,
          activeNegotiationId: negotiationId,
        });
      } catch (error) {
        // Silently ignore aborted requests — a newer fetch superseded this one
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        const message =
          error instanceof Error ? error.message : "Failed to load negotiation thread.";

        // Distinguish 404 (thread unavailable) from other errors
        const is404 = message.includes("404") || message.includes("not found");

        if (is404) {
          // eslint-disable-next-line no-console
          console.warn(
            `Negotiation detail 404 for negotiationId=${negotiationId} — negotiation may still be processing.`,
          );

          setThreadState({
            status: "not_found",
            data: null,
            error: null,
            activeNegotiationId: negotiationId,
          });
        } else {
          setThreadState({
            status: "error",
            data: null,
            error: message,
            activeNegotiationId: negotiationId,
          });
        }
      }
    },
    [],
  );

  function retryNegotiationThread() {
    if (threadState.activeNegotiationId) {
      void fetchNegotiationThread(threadState.activeNegotiationId);
    }
  }

  function resetWorkflow() {
    setSearch(initialSearchState);
    setNegotiation(initialNegotiationState);
    setWinner(initialWinnerState);
    setThreadState(initialThreadState);
    setContextForm(null);
    setInferredContextForm(null);
    setRequestQuery(null);
    setInput("");
    setMessages(createIntroTranscript());
  }

  const contextSummary = contextForm
    ? buildContextSummaryItems(contextForm)
    : [];

  const searchViewModel: SearchResultsViewModel | null = search.data
    ? toSearchResultsViewModel(search.data)
    : null;

  const shortlistViewModels: ShortlistItemViewModel[] = search.data?.selectionResult
    ? toShortlistViewModels(search.data.selectionResult.top3)
    : [];

  const negotiationViewModels: NegotiationOutcomeViewModel[] = negotiation.data
    ? toNegotiationOutcomeViewModels(
        negotiation.data.outcomes,
        search.data?.searchResults ?? [],
      )
    : [];

  const winnerViewModel: WinnerSummaryViewModel | null =
    winner.data && search.data && negotiation.data
      ? toWinnerSummaryViewModel(
          winner.data,
          search.data.searchResults,
          negotiation.data.outcomes,
        )
      : null;

  const latestExecutionMeta =
    winner.data?.meta ??
    negotiation.data?.meta ??
    search.data?.meta ??
    null;

  // ---------------------------------------------------------------------------
  // Arena view-model derivation (Phase 3)
  // ---------------------------------------------------------------------------

  const eliminationViewModels: EliminationCandidateViewModel[] = search.data
    ? toEliminationViewModels(search.data.searchResults)
    : [];

  const finalistShowdownViewModels: FinalistShowdownViewModel[] =
    search.data?.selectionResult
      ? toFinalistShowdownViewModels(
          search.data.selectionResult.top3,
          negotiation.data?.outcomes ?? [],
          winner.data ?? null,
        )
      : [];

  const agentPitchSceneState: AgentPitchSceneState = (() => {
    if (winner.status === "success") return "verdict";
    if (winner.status === "loading") return "evaluating";
    if (negotiation.status === "success") return "evaluating";
    if (negotiation.status === "loading") return "pitching";
    return "idle";
  })();

  const hasSelection = Boolean(search.data?.selectionResult?.top3.length);
  const canRunMarket = Boolean(
    requestQuery &&
      contextForm &&
      contextForm.jobType.trim() &&
      contextForm.description.trim() &&
      !isBusy,
  );
  const canRunNegotiations = Boolean(hasSelection && !isBusy);
  const winnerRequest =
    requestQuery && contextForm && negotiation.data
      ? buildSelectWinnerRequest(
          negotiation.data.outcomes,
          buildWorkflowContext(requestQuery, contextForm).userPreferences,
        )
      : null;
  const canSelectWinner = Boolean(winnerRequest) && !isBusy;

  // Available negotiation thread IDs for the inspector rail thread selector
  const availableNegotiationIds: string[] = negotiation.data
    ? negotiation.data.outcomes.map((outcome) => outcome.negotiationId)
    : [];

  return {
    input,
    setInput,
    messages,
    requestQuery,
    contextForm,
    homepageControls,
    contextSummary,
    workflowStatus,
    search,
    negotiation,
    winner,
    searchViewModel,
    shortlistViewModels,
    negotiationViewModels,
    winnerViewModel,
    latestExecutionMeta,
    eliminationViewModels,
    finalistShowdownViewModels,
    agentPitchSceneState,
    isBusy,
    canRunMarket,
    canRunNegotiations,
    canSelectWinner,
    prepareRequest,
    refreshStatus,
    submitContext,
    runNegotiations,
    selectWinner,
    updateContextField,
    updateHomepageSpeed,
    updateHomepageBudget,
    // Negotiation thread inspector state
    threadStatus: threadState.status,
    thread: threadState.data,
    threadError: threadState.error,
    activeNegotiationId: threadState.activeNegotiationId,
    availableNegotiationIds,
    fetchNegotiationThread,
    retryNegotiationThread,
    resetWorkflow,
  };
}
