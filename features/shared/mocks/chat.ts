/**
 * buildAssistantReply — Mock assistant response generator.
 *
 * Simulates the AI agent's initial analysis of the user's service request.
 * In production, this is handled by the LLM agent on the backend.
 */
export function buildAssistantReply(message: string): {
  response: string;
  followUpQuestion: string | null;
} {
  const normalized = message.toLowerCase();

  // Intentional error trigger for testing
  if (normalized.includes("error")) {
    throw new Error("The mock assistant intentionally failed for this request.");
  }

  const hasBudgetSignal =
    normalized.includes("budget") ||
    normalized.includes("cost") ||
    normalized.includes("$") ||
    normalized.includes("cheap") ||
    normalized.includes("affordable");

  const hasQualitySignal =
    normalized.includes("quality") ||
    normalized.includes("reliable") ||
    normalized.includes("best") ||
    normalized.includes("certified");

  const hasUrgencySignal =
    normalized.includes("today") ||
    normalized.includes("asap") ||
    normalized.includes("urgent") ||
    normalized.includes("emergency") ||
    normalized.includes("tomorrow");

  const signalCount = [hasBudgetSignal, hasQualitySignal, hasUrgencySignal].filter(
    Boolean,
  ).length;

  const followUpQuestion =
    signalCount >= 2
      ? null
      : "What matters most for this job: keeping costs down, getting the highest-rated pro, or getting someone out fast?";

  return {
    response: followUpQuestion
      ? "I can start searching now, but one more detail will help me rank the best tradespeople for your job."
      : "Got it. I have enough context to find and rank the strongest candidates. Starting the search now.",
    followUpQuestion,
  };
}
