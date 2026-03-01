export function buildAssistantReply(message: string): {
  response: string;
  followUpQuestion: string | null;
} {
  const normalized = message.toLowerCase();

  if (normalized.includes("error")) {
    throw new Error("The mock assistant intentionally failed for this request.");
  }

  const hasBudgetSignal =
    normalized.includes("budget") ||
    normalized.includes("cost") ||
    normalized.includes("$") ||
    normalized.includes("cheap") ||
    normalized.includes("tight");
  const hasReliabilitySignal =
    normalized.includes("reliability") ||
    normalized.includes("reliable") ||
    normalized.includes("quality");
  const hasDeadlineSignal =
    normalized.includes("tomorrow") ||
    normalized.includes("today") ||
    normalized.includes("pm") ||
    normalized.includes("deadline") ||
    normalized.includes("asap");

  const followUpQuestion =
    hasBudgetSignal && hasReliabilitySignal && hasDeadlineSignal
      ? null
      : "What matters most for this market run: tighter cost control, stronger reliability, or full-scope coverage?";

  return {
    response: followUpQuestion
      ? "I can open the market now, but one more signal will tighten the ranking before negotiation begins."
      : "I have enough context. I am opening the market and ranking the strongest operators now.",
    followUpQuestion,
  };
}
