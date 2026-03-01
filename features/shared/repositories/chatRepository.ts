import type { ChatMessage } from "@/features/shared/contracts/ChatMessage";
import { createMessageId } from "@/features/chat/utils/createMessageId";
import type { InitialChatResponse } from "@/features/shared/contracts/SearchContracts";
import { buildAssistantReply } from "@/features/shared/mocks/chat";
import { inferPreferencesFromRequest } from "@/features/shared/mocks/preferences";

export interface ChatRepository {
  sendInitialMessage(input: { message: string }): Promise<InitialChatResponse>;
}

function buildMessage(content: string): ChatMessage {
  return {
    id: createMessageId("assistant"),
    role: "assistant",
    content,
    timestamp: new Date().toISOString(),
    status: "sent",
  };
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const mockChatRepository: ChatRepository = {
  async sendInitialMessage({ message }) {
    await wait(700);

    const { response, followUpQuestion } = buildAssistantReply(message);

    const messages = [buildMessage(response)];

    if (followUpQuestion) {
      messages.push(buildMessage(followUpQuestion));
    }

    return {
      messages,
      suggestedPreferences: inferPreferencesFromRequest(message),
      followUpQuestion,
    };
  },
};
