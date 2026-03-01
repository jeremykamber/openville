"use client";

import { useState } from "react";

import type { ChatMessage, ChatMessageRole } from "@/features/shared/contracts/ChatMessage";
import { createMessageId } from "@/features/chat/utils/createMessageId";
import {
  buildContextSummaryItems,
  buildSelectWinnerRequest,
  buildWorkflowContext,
  createContextFormValues,
  toNegotiationOutcomeViewModels,
  toSearchResultsViewModel,
  toShortlistViewModels,
  toWinnerSummaryViewModel,
} from "@/features/workflow/client/adapters";
import { openvilleWorkflowRepository } from "@/features/workflow/client/repository";
import type {
  NegotiationOutcomeViewModel,
  SearchAndSelectResponse,
  SearchResultsViewModel,
  SelectWinnerResponse,
  ShortlistItemViewModel,
  WinnerSummaryViewModel,
  WorkflowContextFormValues,
} from "@/features/workflow/client/types";
import type { RunNegotiationsResponse } from "@/features/workflow/client/types";
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
  const [workflowStatus, setWorkflowStatus] = useState(initialStatusState);
  const [search, setSearch] = useState(initialSearchState);
  const [negotiation, setNegotiation] = useState(initialNegotiationState);
  const [winner, setWinner] = useState(initialWinnerState);

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

      return {
        ...current,
        [field]: value,
      };
    });
  }

  function prepareRequest() {
    const trimmed = input.trim();

    if (!trimmed || isBusy) {
      return false;
    }

    setRequestQuery(trimmed);
    setContextForm(createContextFormValues(trimmed));
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

  return {
    input,
    setInput,
    messages,
    requestQuery,
    contextForm,
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
  };
}
