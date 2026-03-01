import { randomUUID } from "node:crypto";

import type {
  Negotiation,
  NegotiationMessage,
  NegotiationResult,
  NegotiationStatus,
} from "../types";
import type { NegotiationRepository } from "./NegotiationRepository";

type StoredNegotiation = Negotiation;
type StoredMessage = NegotiationMessage;
type StoredResult = NegotiationResult;

function cloneNegotiation(record: StoredNegotiation): Negotiation {
  return {
    ...record,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt),
    endedAt: record.endedAt ? new Date(record.endedAt) : undefined,
  };
}

function cloneMessage(record: StoredMessage): NegotiationMessage {
  return {
    ...record,
    createdAt: new Date(record.createdAt),
  };
}

function cloneResult(record: StoredResult): NegotiationResult {
  return {
    ...record,
    scope: record.scope
      ? {
          ...record.scope,
          details: record.scope.details ? { ...record.scope.details } : undefined,
        }
      : undefined,
    createdAt: new Date(record.createdAt),
    respondedAt: record.respondedAt ? new Date(record.respondedAt) : undefined,
  };
}

export class InMemoryNegotiationRepository implements NegotiationRepository {
  private negotiations = new Map<string, StoredNegotiation>();

  private messages = new Map<string, StoredMessage[]>();

  private results = new Map<string, StoredResult>();

  async createNegotiation(
    buyerAgentId: string,
    providerAgentId: string,
    jobId?: string,
  ): Promise<Negotiation> {
    const now = new Date();
    const negotiation: StoredNegotiation = {
      id: randomUUID(),
      buyerAgentId,
      providerAgentId,
      jobId,
      status: "active",
      currentTurn: "buyer",
      createdAt: now,
      updatedAt: now,
    };

    this.negotiations.set(negotiation.id, negotiation);
    this.messages.set(negotiation.id, []);

    return cloneNegotiation(negotiation);
  }

  async getNegotiation(id: string): Promise<Negotiation | null> {
    const negotiation = this.negotiations.get(id);
    return negotiation ? cloneNegotiation(negotiation) : null;
  }

  async addMessage(
    negotiationId: string,
    sender: string,
    senderType: "buyer" | "provider",
    content: string,
    messageType: "message" | "proposal" | "cancellation" = "message",
  ): Promise<NegotiationMessage> {
    const negotiation = this.negotiations.get(negotiationId);

    if (!negotiation) {
      throw new Error(`Negotiation ${negotiationId} not found`);
    }

    const message: StoredMessage = {
      id: randomUUID(),
      negotiationId,
      sender,
      senderType,
      content,
      messageType,
      createdAt: new Date(),
    };

    const existing = this.messages.get(negotiationId) ?? [];
    existing.push(message);
    this.messages.set(negotiationId, existing);

    negotiation.currentTurn = senderType === "buyer" ? "provider" : "buyer";
    negotiation.updatedAt = new Date();

    return cloneMessage(message);
  }

  async getMessages(negotiationId: string): Promise<NegotiationMessage[]> {
    return (this.messages.get(negotiationId) ?? []).map(cloneMessage);
  }

  async updateNegotiationStatus(
    id: string,
    status: NegotiationStatus,
    summary?: string,
  ): Promise<void> {
    const negotiation = this.negotiations.get(id);

    if (!negotiation) {
      throw new Error(`Negotiation ${id} not found`);
    }

    negotiation.status = status;
    negotiation.summary = summary;
    negotiation.updatedAt = new Date();
    negotiation.endedAt = status === "active" ? undefined : new Date();
  }

  async createNegotiationResult(
    negotiationId: string,
    proposedBy: string,
    finalPrice?: number,
    scope?: { description?: string; rooms?: number; details?: Record<string, unknown> },
  ): Promise<NegotiationResult> {
    const negotiation = this.negotiations.get(negotiationId);

    if (!negotiation) {
      throw new Error(`Negotiation ${negotiationId} not found`);
    }

    const result: StoredResult = {
      id: randomUUID(),
      negotiationId,
      proposedBy,
      status: "pending",
      finalPrice,
      scope: scope
        ? {
            description: scope.description,
            rooms: scope.rooms,
            details: scope.details ? { ...scope.details } : undefined,
          }
        : undefined,
      createdAt: new Date(),
    };

    this.results.set(result.id, result);
    negotiation.updatedAt = new Date();

    return cloneResult(result);
  }

  async respondToResult(
    resultId: string,
    status: "accepted" | "rejected",
    responseMessage?: string,
  ): Promise<NegotiationResult> {
    const result = this.results.get(resultId);

    if (!result) {
      throw new Error(`Negotiation result ${resultId} not found`);
    }

    result.status = status;
    result.responseMessage = responseMessage;
    result.respondedAt = new Date();

    const negotiation = this.negotiations.get(result.negotiationId);
    if (negotiation) {
      negotiation.updatedAt = new Date();
    }

    return cloneResult(result);
  }
}

export function createInMemoryNegotiationRepository(): NegotiationRepository {
  return new InMemoryNegotiationRepository();
}
