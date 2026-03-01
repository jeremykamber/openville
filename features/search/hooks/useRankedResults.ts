"use client";

import { useRef, useState } from "react";

import type {
  RankedSearchResponse,
  SearchRequest,
} from "@/features/shared/contracts/SearchContracts";
import {
  mockSearchRepository,
  type SearchRepository,
} from "@/features/shared/repositories/searchRepository";

type RankedResultsStatus = "idle" | "loading" | "success" | "empty" | "error";

interface RankedResultsState {
  status: RankedResultsStatus;
  data: RankedSearchResponse | null;
  error: string | null;
}

const initialState: RankedResultsState = {
  status: "idle",
  data: null,
  error: null,
};

export function useRankedResults(
  repository: SearchRepository = mockSearchRepository,
) {
  const [state, setState] = useState<RankedResultsState>(initialState);
  const lastRequestRef = useRef<SearchRequest | null>(null);

  async function search(request: SearchRequest) {
    lastRequestRef.current = request;
    setState({
      status: "loading",
      data: null,
      error: null,
    });

    try {
      const response = await repository.getRankedCandidates(request);

      setState({
        status: response.candidates.length > 0 ? "success" : "empty",
        data: response,
        error: null,
      });
    } catch (error) {
      setState({
        status: "error",
        data: null,
        error:
          error instanceof Error ? error.message : "Unable to load ranked candidates.",
      });
    }
  }

  async function retry() {
    if (!lastRequestRef.current) {
      return;
    }

    await search(lastRequestRef.current);
  }

  return {
    ...state,
    search,
    retry,
  };
}
