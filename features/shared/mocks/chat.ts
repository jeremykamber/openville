export function buildAssistantReply(message: string): {
  response: string;
  followUpQuestion: string | null;
} {
  const normalized = message.toLowerCase();

  if (normalized.includes("error")) {
    throw new Error("The mock assistant intentionally failed for this request.");
  }

  const followUpQuestion =
    normalized.includes("budget") || normalized.includes("$")
      ? null
      : "Do you want the cheapest option, the fastest option, or the best quality option?";

  return {
    response: followUpQuestion
      ? "I have enough to start searching, but I am flagging one follow-up so the ranking can reflect your priorities."
      : "I have enough context to search and rank the best matches for you right now.",
    followUpQuestion,
  };
}
