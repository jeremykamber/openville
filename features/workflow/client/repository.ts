import type {
  OpenvilleWorkflowRepository,
  RunNegotiationsRequest,
  RunNegotiationsResponse,
  SearchAndSelectRequest,
  SearchAndSelectResponse,
  SelectWinnerRequest,
  SelectWinnerResponse,
} from "@/features/workflow/client/types";
import type { WorkflowStatusResponse } from "@/features/workflow/types";

interface ApiErrorPayload {
  error?: string;
  details?: unknown;
}

function formatApiError(payload: ApiErrorPayload | null, fallback: string): string {
  if (!payload) {
    return fallback;
  }

  if (typeof payload.error === "string" && payload.error.trim()) {
    return payload.error;
  }

  if (payload.details) {
    return `${fallback} (${JSON.stringify(payload.details)})`;
  }

  return fallback;
}

async function requestJson<TResponse>(
  input: string,
  init?: RequestInit,
): Promise<TResponse> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(
      formatApiError(
        (payload as ApiErrorPayload | null) ?? null,
        `Request failed with status ${response.status}`,
      ),
    );
  }

  return payload as TResponse;
}

export const openvilleWorkflowRepository: OpenvilleWorkflowRepository = {
  getStatus() {
    return requestJson<WorkflowStatusResponse>("/api/workflow/status", {
      method: "GET",
    });
  },

  searchAndSelect(request: SearchAndSelectRequest) {
    return requestJson<SearchAndSelectResponse>("/api/agents/search-and-select", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  runNegotiations(request: RunNegotiationsRequest) {
    return requestJson<RunNegotiationsResponse>("/api/agents/negotiate/run", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  selectWinner(request: SelectWinnerRequest) {
    return requestJson<SelectWinnerResponse>("/api/agents/select-winner", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },
};
