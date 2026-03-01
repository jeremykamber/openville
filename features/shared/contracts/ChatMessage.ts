export type ChatMessageRole = "user" | "assistant" | "system";
export type ChatMessageStatus = "sent" | "pending" | "error";

/**
 * ChatMessage — A single message in the chat flow.
 *
 * Used by both the story-mode RequestComposer and the workspace-mode
 * command center. The status field enables optimistic UI (show "pending"
 * while the agent processes, flip to "sent" on confirmation).
 */
export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  timestamp: string;
  status?: ChatMessageStatus;
}
