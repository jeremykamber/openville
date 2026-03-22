import type { SearchResult } from "../types";

function listText(value: string[] | undefined): string {
  return value?.filter(Boolean).join(", ") ?? "";
}

export function buildCandidateEmbeddingInput(candidate: Partial<SearchResult>): string {
  return [
    candidate.name,
    candidate.description,
    listText(candidate.services),
    listText(candidate.specialties),
    candidate.location,
    listText(candidate.tags),
    candidate.availability,
    listText(candidate.certifications),
    candidate.responseTime,
  ]
    .filter((value): value is string => Boolean(value && value.trim()))
    .join(" | ");
}

export function serializeEmbedding(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}
