export type ChatMessageRole = "user" | "assistant" | "system";
export type ChatMessageStatus = "sent" | "pending" | "error";

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  timestamp: string;
  status?: ChatMessageStatus;
}
