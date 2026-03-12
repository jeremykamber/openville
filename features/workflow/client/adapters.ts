import type { NegotiationOutcomeTransport } from "@/features/agents/negotiation/types";
import type {
  Candidate,
  SelectedCandidate,
} from "@/features/agents/selection/types";

import type {
  ContextSummaryItem,
  EliminationCandidateViewModel,
  FinalistShowdownViewModel,
  InspectorArtifactSource,
  InspectorArtifactViewModel,
  NegotiationDetailResponse,
  NegotiationOutcomeViewModel,
  NegotiationThreadViewModel,
  SearchAndSelectResponse,
  SearchResultsViewModel,
  SelectWinnerRequest,
  SelectWinnerResponse,
  ShortlistItemViewModel,
  WinnerSummaryViewModel,
  WorkflowContextFormValues,
  WorkflowHomepageControls,
  WorkflowJobScope,
  WorkflowPriority,
  WorkflowSpeedPreset,
  WorkflowUserPreferences,
} from "@/features/workflow/client/types";

const CATEGORY_RULES = [
  { jobType: "gutter repair", keywords: ["gutter", "downspout"] },
  { jobType: "plumbing", keywords: ["plumb", "pipe", "drain", "toilet", "sink"] },
  { jobType: "electrical", keywords: ["electrical", "electric", "wiring", "panel", "outlet"] },
  { jobType: "painting", keywords: ["paint", "painting"] },
  { jobType: "hvac", keywords: ["hvac", "heater", "heating", "cooling", "ac "] },
  { jobType: "roof repair", keywords: ["roof", "shingle", "flashing"] },
  { jobType: "landscaping", keywords: ["landscap", "lawn", "yard", "tree trimming"] },
  { jobType: "appliance repair", keywords: ["appliance", "washer", "dryer", "dishwasher"] },
  { jobType: "flooring", keywords: ["floor", "hardwood", "tile", "laminate"] },
  { jobType: "handyman", keywords: ["handyman", "repair", "assembly", "maintenance"] },
];

const QUERY_FILLER_WORDS = new Set([
  "i",
  "need",
  "looking",
  "look",
  "want",
  "help",
  "someone",
  "somebody",
  "to",
  "find",
  "hire",
  "a",
  "an",
  "the",
  "my",
  "for",
  "with",
]);

function compactWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function titleCase(value: string): string {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatCurrency(value?: number | null): string {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return "Custom quote";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatScore(value?: number | null): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "0.00";
  }

  return value.toFixed(2);
}

function formatPriorityLabel(priority: WorkflowPriority): string {
  if (priority === "cost") return "Cost discipline";
  if (priority === "speed") return "Fast turnaround";
  if (priority === "rating") return "Top-rated operators";
  return "Quality first";
}

function inferJobType(query: string): string {
  const normalized = query.toLowerCase();
  const matchedRule = CATEGORY_RULES.find((rule) =>
    rule.keywords.some((keyword) => normalized.includes(keyword)),
  );

  if (matchedRule) {
    return matchedRule.jobType;
  }

  const candidate = compactWhitespace(
    normalized
      .replace(/[^\w\s]/g, " ")
      .split(" ")
      .filter((token) => token && !QUERY_FILLER_WORDS.has(token))
      .slice(0, 3)
      .join(" "),
  );

  return titleCase(candidate || query.slice(0, 48));
}

function inferPriority(query: string): "" | WorkflowPriority {
  const normalized = query.toLowerCase();

  if (/\b(cheap|budget|affordable|under \$?\d+|lowest)\b/.test(normalized)) {
    return "cost";
  }

  if (/\b(asap|urgent|immediately|today|tonight|emergency|fast)\b/.test(normalized)) {
    return "speed";
  }

  if (/\b(best|top rated|highest rated|most trusted|five star|reviews)\b/.test(normalized)) {
    return "rating";
  }

  if (/\b(licensed|insured|quality|premium|craftsmanship)\b/.test(normalized)) {
    return "quality";
  }

  return "";
}

function inferUrgency(
  query: string,
): WorkflowContextFormValues["urgency"] {
  const normalized = query.toLowerCase();

  if (/\b(asap|urgent|immediately|today|tonight|emergency)\b/.test(normalized)) {
    return "asap";
  }

  if (/\b(tomorrow|this week|next week|scheduled|before)\b/.test(normalized)) {
    return "scheduled";
  }

  return "";
}

function inferRooms(query: string): string {
  const match = query.match(/\b(\d+)\s+rooms?\b/i);
  return match ? match[1] : "";
}

function inferBudget(query: string): string {
  const moneyMatch = query.match(/\$ ?(\d{2,6})/);

  if (moneyMatch?.[1]) {
    return moneyMatch[1];
  }

  const underMatch = query.match(/\bunder (\d{2,6})\b/i);
  return underMatch?.[1] ?? "";
}

function inferLocation(query: string): string {
  const locationMatch = query.match(/\b(?:in|near)\s+([a-z][a-z\s]+)$/i);
  return locationMatch?.[1] ? titleCase(compactWhitespace(locationMatch[1])) : "";
}

function parsePositiveNumber(value: string): number | undefined {
  const numeric = Number(value.trim());

  if (!Number.isFinite(numeric) || numeric <= 0) {
    return undefined;
  }

  return numeric;
}

function parseOptionalList(value: string): string[] | undefined {
  const items = value
    .split(",")
    .map((item) => compactWhitespace(item))
    .filter(Boolean);

  return items.length > 0 ? items : undefined;
}

function resolveSpeedPresetFields(
  speed: WorkflowSpeedPreset,
  inferredValues: WorkflowContextFormValues,
): Pick<WorkflowContextFormValues, "priority" | "urgency"> {
  if (speed === "fastest") {
    return {
      priority: "speed",
      urgency: "asap",
    };
  }

  if (speed === "best_quality") {
    return {
      priority: "rating",
      urgency: inferredValues.urgency,
    };
  }

  return {
    priority: inferredValues.priority,
    urgency: inferredValues.urgency,
  };
}

function dedupeParts(parts: string[]): string[] {
  const seen = new Set<string>();
  const deduped: string[] = [];

  for (const part of parts) {
    const normalized = part.toLowerCase();

    if (seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    deduped.push(part);
  }

  return deduped;
}

function buildSearchQuery(
  fallbackQuery: string,
  values: WorkflowContextFormValues,
): string {
  const parts = dedupeParts(
    [
      compactWhitespace(values.description),
      compactWhitespace(values.jobType),
      compactWhitespace(values.location),
      compactWhitespace(values.additionalRequirements),
    ].filter(Boolean),
  );

  return parts.join(". ") || compactWhitespace(fallbackQuery);
}

export function createContextFormValues(
  query: string,
): WorkflowContextFormValues {
  const description = compactWhitespace(query);

  return {
    jobType: inferJobType(description),
    description,
    location: inferLocation(description),
    urgency: inferUrgency(description),
    estimatedDuration: "",
    rooms: inferRooms(description),
    budget: inferBudget(description),
    priority: inferPriority(description),
    minRating: "",
    availability: "",
    availabilityRequired: "",
    dealBreakers: "",
    preferredQualifications: "",
    additionalRequirements: "",
  };
}

export function applyWorkflowHomepageControls(
  values: WorkflowContextFormValues,
  inferredValues: WorkflowContextFormValues,
  controls: WorkflowHomepageControls,
): WorkflowContextFormValues {
  const speedFields = resolveSpeedPresetFields(controls.speed, inferredValues);

  return {
    ...values,
    ...speedFields,
    budget: controls.budgetTouched ? controls.budget : values.budget,
  };
}

export function deriveSpeedPresetFromContext(
  values: Pick<WorkflowContextFormValues, "priority" | "urgency">,
): WorkflowSpeedPreset {
  if (values.priority === "speed" && values.urgency === "asap") {
    return "fastest";
  }

  if (values.priority === "rating") {
    return "best_quality";
  }

  return "balanced";
}

export function buildWorkflowContext(
  fallbackQuery: string,
  values: WorkflowContextFormValues,
): {
  query: string;
  scope: WorkflowJobScope;
  userPreferences: WorkflowUserPreferences;
} {
  const description = compactWhitespace(values.description) || compactWhitespace(fallbackQuery);
  const jobType = compactWhitespace(values.jobType) || inferJobType(description);
  const location = compactWhitespace(values.location);
  const budget = parsePositiveNumber(values.budget);
  const minRating = parsePositiveNumber(values.minRating);
  const rooms = parsePositiveNumber(values.rooms);
  const dealBreakers = parseOptionalList(values.dealBreakers);
  const preferredQualifications = parseOptionalList(values.preferredQualifications);
  const availabilityRequired = compactWhitespace(values.availabilityRequired);
  const additionalRequirements = compactWhitespace(values.additionalRequirements);

  return {
    query: buildSearchQuery(fallbackQuery, values),
    scope: {
      jobType,
      description,
      location: location || undefined,
      urgency: values.urgency || undefined,
      estimatedDuration: compactWhitespace(values.estimatedDuration) || undefined,
      rooms,
    },
    userPreferences: {
      budget,
      priority: values.priority || undefined,
      dealBreakers,
      preferredQualifications,
      availabilityRequired: availabilityRequired || undefined,
      minRating,
      location: location || undefined,
      availability: values.availability || undefined,
      additionalRequirements: additionalRequirements || undefined,
    },
  };
}

export function buildContextSummaryItems(
  values: WorkflowContextFormValues,
): ContextSummaryItem[] {
  const items: ContextSummaryItem[] = [
    { label: "Service", value: values.jobType },
    { label: "Scope", value: values.description },
  ];

  if (values.location) {
    items.push({ label: "Location", value: values.location });
  }

  if (values.priority) {
    items.push({
      label: "Priority",
      value: formatPriorityLabel(values.priority),
    });
  }

  if (values.budget) {
    items.push({ label: "Budget", value: formatCurrency(Number(values.budget)) });
  }

  if (values.urgency) {
    items.push({
      label: "Urgency",
      value: titleCase(values.urgency.replace("_", " ")),
    });
  }

  if (values.minRating) {
    items.push({ label: "Min rating", value: `${values.minRating}+` });
  }

  return items.filter((item) => Boolean(item.value));
}

export function toCandidateCardViewModel(candidate: Candidate) {
  const specialties = candidate.specialties?.length
    ? candidate.specialties
    : candidate.services?.slice(0, 3) ?? [];

  return {
    agentId: candidate.agentId,
    name: candidate.name,
    headline:
      candidate.services?.slice(0, 2).join(" · ") ||
      candidate.description ||
      "Available operator",
    summary:
      candidate.description ||
      "No additional background was provided for this operator.",
    specialties,
    score: formatScore(candidate.score),
    startingPrice: formatCurrency(candidate.basePrice ?? candidate.hourlyRate),
    availabilityLabel: candidate.availability ?? "Availability not provided",
    locationLabel: candidate.location ?? "Location not provided",
    ratingLabel:
      typeof candidate.rating === "number" && candidate.rating > 0
        ? `${candidate.rating.toFixed(1)} rating`
        : "No rating yet",
    trackRecordLabel:
      candidate.yearsOnPlatform && candidate.yearsOnPlatform > 0
        ? `${candidate.successCount} completed jobs · ${candidate.yearsOnPlatform} years on platform`
        : `${candidate.successCount} completed jobs`,
  };
}

export function toSearchResultsViewModel(
  response: SearchAndSelectResponse,
): SearchResultsViewModel {
  return {
    candidates: response.searchResults.map((candidate) =>
      toCandidateCardViewModel(candidate),
    ),
    resultCount: response.searchResults.length,
    shortlistCount: response.selectionResult?.top3.length ?? 0,
    summary: response.selectionResult?.summary ?? null,
    warnings: response.meta.warnings,
    meta: response.meta,
  };
}

export function toShortlistViewModels(
  top3: SelectedCandidate[],
): ShortlistItemViewModel[] {
  return top3.map((item) => ({
    agentId: item.candidate.agentId,
    name: item.candidate.name,
    reasoning: item.reasoning,
    matchScore: `${Math.round(item.matchScore)} match`,
    serviceLabel:
      item.candidate.services?.slice(0, 2).join(" · ") ||
      item.candidate.description ||
      "General operator",
    priceLabel: formatCurrency(
      item.candidate.basePrice ?? item.candidate.hourlyRate,
    ),
  }));
}

export function buildSelectWinnerRequest(
  outcomes: NegotiationOutcomeTransport[],
  userPreferences: WorkflowUserPreferences,
): SelectWinnerRequest | null {
  const negotiations = outcomes
    .filter((outcome) => Boolean(outcome.result))
    .map((outcome) => ({
      candidateId: outcome.candidateId,
      result: outcome.result!,
    }));

  if (negotiations.length === 0) {
    return null;
  }

  return {
    negotiations,
    userPreferences,
  };
}

export function toNegotiationOutcomeViewModels(
  outcomes: NegotiationOutcomeTransport[],
  candidates: Candidate[],
): NegotiationOutcomeViewModel[] {
  const candidatesById = new Map(candidates.map((candidate) => [candidate.agentId, candidate]));

  return outcomes.map((outcome) => {
    const candidate = candidatesById.get(outcome.candidateId);
    const responseLabel = outcome.result?.responseMessage ?? "No counter-message returned";

    return {
      candidateId: outcome.candidateId,
      candidateName: candidate?.name ?? outcome.candidateId,
      status: outcome.status,
      statusLabel:
        outcome.status === "completed"
          ? "Proposal accepted"
          : outcome.status === "rejected"
            ? "Proposal rejected"
            : outcome.status === "cancelled"
              ? "Negotiation cancelled"
              : "Negotiation failed",
      priceLabel: formatCurrency(outcome.result?.finalPrice),
      responseLabel,
      summary: outcome.summary ?? responseLabel,
    };
  });
}

export function toWinnerSummaryViewModel(
  response: SelectWinnerResponse,
  candidates: Candidate[],
  outcomes: NegotiationOutcomeTransport[],
): WinnerSummaryViewModel {
  const candidatesById = new Map(candidates.map((candidate) => [candidate.agentId, candidate]));
  const outcomesById = new Map(outcomes.map((outcome) => [outcome.candidateId, outcome]));
  const winnerCandidate = candidatesById.get(response.winner.candidateId);
  const winnerOutcome = outcomesById.get(response.winner.candidateId);

  return {
    candidateName: winnerCandidate?.name ?? response.winner.candidateId,
    reasoning: response.winner.reasoning,
    confidenceLabel: `${Math.round(response.winner.confidence * 100)}% confidence`,
    priceLabel: formatCurrency(winnerOutcome?.result?.finalPrice),
    summary: response.summary,
    comparison: response.comparison.map((entry) => ({
      candidateId: entry.candidateId,
      candidateName:
        candidatesById.get(entry.candidateId)?.name ?? entry.candidateId,
      strengths: entry.strengths,
      weaknesses: entry.weaknesses,
      priorityAlignmentLabel: `${Math.round(entry.priorityAlignment * 100)}% alignment`,
    })),
  };
}

// ---------------------------------------------------------------------------
// Arena adapters (Phase 1 — Agent Economy Redesign)
// ---------------------------------------------------------------------------

/**
 * Derive a short elimination reason for a candidate ranked 4–10.
 * Uses available ranking signals: score, relevance, rating, price.
 * Always frontend-inferred — never backend-provided truth.
 */
function deriveEliminationReason(
  candidate: Candidate,
  topThreeLowestScore: number,
): string {
  const reasons: string[] = [];

  if (typeof candidate.score === "number" && candidate.score < topThreeLowestScore) {
    reasons.push("lower overall score");
  }

  if (typeof candidate.rating === "number" && candidate.rating < 4.0) {
    reasons.push("below-average rating");
  }

  if (
    typeof candidate.basePrice === "number" &&
    candidate.basePrice > 0 &&
    candidate.basePrice >= 1000
  ) {
    reasons.push("higher price point");
  }

  if (typeof candidate.relevance === "number" && candidate.relevance < 0.5) {
    reasons.push("lower relevance match");
  }

  if (reasons.length === 0) {
    return "Outperformed by higher-ranked candidates";
  }

  const joined = reasons.join(", ");
  return joined.charAt(0).toUpperCase() + joined.slice(1);
}

/**
 * Map candidates ranked 4–10 to elimination view-models with explicit field picks.
 * Candidates must be pre-sorted by rank (index 0 = rank 1).
 * Only candidates at index 3–9 are included.
 */
export function toEliminationViewModels(
  rankedCandidates: Candidate[],
): EliminationCandidateViewModel[] {
  if (rankedCandidates.length <= 3) {
    return [];
  }

  const topThree = rankedCandidates.slice(0, 3);
  const topThreeLowestScore = Math.min(
    ...topThree.map((c) => (typeof c.score === "number" ? c.score : 0)),
  );

  const eliminated = rankedCandidates.slice(3, 10);

  return eliminated.map((candidate, index): EliminationCandidateViewModel => ({
    agentId: candidate.agentId,
    name: candidate.name,
    rank: index + 4,
    score: formatScore(candidate.score),
    relevance: formatScore(candidate.relevance),
    ratingLabel:
      typeof candidate.rating === "number" && candidate.rating > 0
        ? `${candidate.rating.toFixed(1)} rating`
        : "No rating",
    priceLabel: formatCurrency(candidate.basePrice ?? candidate.hourlyRate),
    eliminationReason: deriveEliminationReason(candidate, topThreeLowestScore),
  }));
}

/**
 * Compose a short thought-bubble pitch from negotiation outcome fields.
 * Returns a 1–2 sentence summary suitable for rendering inside a ThoughtBubble.
 */
function composePitchText(
  outcome: NegotiationOutcomeTransport | undefined,
  candidate: Candidate,
): string {
  if (!outcome?.result) {
    return "Awaiting pitch...";
  }

  const pricePart = typeof outcome.result.finalPrice === "number"
    ? `Proposed ${formatCurrency(outcome.result.finalPrice)}`
    : "Custom quote offered";

  const responsePart = outcome.result.responseMessage
    ? ` — ${outcome.result.responseMessage}`
    : "";

  const specialtyPart = candidate.specialties?.length
    ? `. Specializes in ${candidate.specialties.slice(0, 2).join(" and ")}`
    : candidate.services?.length
      ? `. Offers ${candidate.services.slice(0, 2).join(" and ")}`
      : "";

  return `${pricePart}${responsePart}${specialtyPart}.`;
}

/**
 * Compose evaluation notes from the winner selection comparison data
 * for a specific finalist, as seen from the central agent's perspective.
 */
function composeEvaluationNotes(
  candidateId: string,
  winnerResponse: SelectWinnerResponse | null,
): string {
  if (!winnerResponse) {
    return "";
  }

  const entry = winnerResponse.comparison.find((c) => c.candidateId === candidateId);
  if (!entry) {
    return "";
  }

  const parts: string[] = [];

  if (entry.strengths.length > 0) {
    parts.push(`Strengths: ${entry.strengths.slice(0, 2).join(", ")}`);
  }

  if (entry.weaknesses.length > 0) {
    parts.push(`Risks: ${entry.weaknesses.slice(0, 2).join(", ")}`);
  }

  parts.push(`${Math.round(entry.priorityAlignment * 100)}% priority alignment`);

  return parts.join(". ") + ".";
}

/**
 * Map top-3 shortlisted candidates to finalist showdown view-models.
 * Uses explicit field picks from Candidate — no spread.
 */
export function toFinalistShowdownViewModels(
  top3: SelectedCandidate[],
  outcomes: NegotiationOutcomeTransport[],
  winnerResponse: SelectWinnerResponse | null,
): FinalistShowdownViewModel[] {
  const outcomesById = new Map(
    outcomes.map((o) => [o.candidateId, o]),
  );

  return top3.map((item, index): FinalistShowdownViewModel => {
    const candidate = item.candidate;
    const outcome = outcomesById.get(candidate.agentId);

    return {
      agentId: candidate.agentId,
      name: candidate.name,
      rank: index + 1,
      survivalReason: item.reasoning,
      negotiatedPriceLabel: outcome?.result?.finalPrice != null
        ? formatCurrency(outcome.result.finalPrice)
        : formatCurrency(candidate.basePrice ?? candidate.hourlyRate),
      scopeStance: outcome?.result?.responseMessage ?? "No counter-proposal",
      strength: candidate.specialties?.slice(0, 2).join(", ")
        || candidate.services?.slice(0, 2).join(", ")
        || "General operator",
      weakness:
        typeof candidate.rating === "number" && candidate.rating < 4.0
          ? "Below-average rating"
          : typeof candidate.successCount === "number" && candidate.successCount < 10
            ? "Limited track record"
            : "No notable weaknesses identified",
      pitchText: composePitchText(outcome, candidate),
      evaluationNotes: composeEvaluationNotes(candidate.agentId, winnerResponse),
    };
  });
}

/**
 * Map a negotiation detail API response to the thread inspector view-model.
 * Handles Date-as-string serialization: createdAt is kept as ISO string.
 */
export function toNegotiationThreadViewModel(
  response: NegotiationDetailResponse,
): NegotiationThreadViewModel {
  return {
    negotiationId: response.negotiation.id,
    status: response.negotiation.status,
    messages: response.messages.map((msg) => ({
      id: msg.id,
      negotiationId: msg.negotiationId,
      sender: msg.sender,
      senderType: msg.senderType as "buyer" | "provider",
      content: msg.content,
      messageType: msg.messageType as "message" | "proposal" | "cancellation",
      createdAt: typeof msg.createdAt === "string"
        ? msg.createdAt
        : String(msg.createdAt),
    })),
  };
}

/**
 * Build inspector artifact view-models from available workflow data.
 * Each artifact is labeled as "real" or "inferred" depending on its data source.
 */
export function toInspectorArtifacts(
  options: {
    searchResults?: Candidate[];
    selectionSummary?: string | null;
    outcomes?: NegotiationOutcomeTransport[];
    winnerResponse?: SelectWinnerResponse | null;
    warnings?: string[];
    eliminationViewModels?: EliminationCandidateViewModel[];
  },
): InspectorArtifactViewModel[] {
  const artifacts: InspectorArtifactViewModel[] = [];

  // Ranking signals — real data from search
  if (options.searchResults && options.searchResults.length > 0) {
    const topSignals = options.searchResults
      .slice(0, 5)
      .map((c) => `${c.name}: score ${formatScore(c.score)}, relevance ${formatScore(c.relevance)}`)
      .join("\n");

    artifacts.push({
      kind: "ranking_signals",
      label: "Ranking Signals",
      source: "real" as InspectorArtifactSource,
      content: topSignals,
    });
  }

  // Shortlist reasoning — real data from selection
  if (options.selectionSummary) {
    artifacts.push({
      kind: "shortlist_reasoning",
      label: "Shortlist Reasoning",
      source: "real" as InspectorArtifactSource,
      content: options.selectionSummary,
    });
  }

  // Negotiation excerpts — real data from negotiation outcomes
  if (options.outcomes && options.outcomes.length > 0) {
    for (const outcome of options.outcomes) {
      if (outcome.result?.responseMessage) {
        artifacts.push({
          kind: "negotiation_excerpt",
          label: `Negotiation — ${outcome.candidateId}`,
          source: "real" as InspectorArtifactSource,
          content: `Status: ${outcome.status}. ${outcome.result.responseMessage}`,
        });
      }
    }
  }

  // Fallback warnings — real data from workflow meta
  if (options.warnings && options.warnings.length > 0) {
    artifacts.push({
      kind: "fallback_warning",
      label: "Workflow Warnings",
      source: "real" as InspectorArtifactSource,
      content: options.warnings.join("\n"),
    });
  }

  // Decision comparison — real data from winner selection
  if (options.winnerResponse) {
    const comparisonLines = options.winnerResponse.comparison.map(
      (entry) =>
        `${entry.candidateId}: +[${entry.strengths.join(", ")}] -[${entry.weaknesses.join(", ")}] (${Math.round(entry.priorityAlignment * 100)}% alignment)`,
    );
    artifacts.push({
      kind: "decision_comparison",
      label: "Decision Comparison",
      source: "real" as InspectorArtifactSource,
      content: comparisonLines.join("\n"),
    });
  }

  // Elimination rationale — inferred by frontend
  if (options.eliminationViewModels && options.eliminationViewModels.length > 0) {
    const eliminationLines = options.eliminationViewModels.map(
      (vm) => `#${vm.rank} ${vm.name}: ${vm.eliminationReason}`,
    );
    artifacts.push({
      kind: "elimination_rationale",
      label: "Elimination Rationale (Inferred)",
      source: "inferred" as InspectorArtifactSource,
      content: eliminationLines.join("\n"),
    });
  }

  return artifacts;
}
