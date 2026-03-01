"use client";

import { useState } from "react";

import type { ChatMessage } from "@/features/shared/contracts/ChatMessage";
import type { UserPreferences } from "@/features/shared/contracts/UserPreferences";
import { createMessageId } from "@/features/chat/utils/createMessageId";
import { mergeUserPreferences } from "@/features/shared/mocks/preferences";
import {
  mockChatRepository,
  type ChatRepository,
} from "@/features/shared/repositories/chatRepository";
import { useRankedResults } from "@/features/search/hooks/useRankedResults";

function createUserMessage(content: string): ChatMessage {
  return {
    id: createMessageId("user"),
    role: "user",
    content,
    timestamp: new Date().toISOString(),
    status: "sent",
  };
}

function createSystemMessage(content: string): ChatMessage {
  return {
    id: createMessageId("system"),
    role: "system",
    content,
    timestamp: new Date().toISOString(),
    status: "sent",
  };
}

export function useChatFlow(repository: ChatRepository = mockChatRepository) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    createSystemMessage(
      "Describe the scope, deadline, and trade-offs. Your agent will open the market and rank the strongest operators.",
    ),
  ]);
  const [input, setInput] = useState("");
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [followUpQuestion, setFollowUpQuestion] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const results = useRankedResults();

  async function submitRequest() {
    const trimmedInput = input.trim();

    if (!trimmedInput || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setChatError(null);

    const nextMessages = [...messages, createUserMessage(trimmedInput)];
    setMessages(nextMessages);
    setInput("");

    try {
      const response = await repository.sendInitialMessage({
        message: trimmedInput,
      });
      const mergedPreferences = mergeUserPreferences(response.suggestedPreferences);

      setMessages([...nextMessages, ...response.messages]);
      setPreferences(mergedPreferences);
      setFollowUpQuestion(response.followUpQuestion);

      await results.search({
        query: trimmedInput,
        userPreferences: mergedPreferences,
      });
    } catch (error) {
      setChatError(
        error instanceof Error ? error.message : "Unable to process the request.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    messages,
    input,
    setInput,
    submitRequest,
    preferences,
    followUpQuestion,
    chatError,
    isSubmitting,
    results,
  };
}
