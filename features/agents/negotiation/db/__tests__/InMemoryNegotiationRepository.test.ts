import { describe, expect, it } from "vitest";

import { InMemoryNegotiationRepository } from "../InMemoryNegotiationRepository";

describe("InMemoryNegotiationRepository", () => {
  it("stores negotiations, messages, and accepted results without Supabase", async () => {
    const repo = new InMemoryNegotiationRepository();

    const negotiation = await repo.createNegotiation("buyer-1", "provider-1", "job-1");
    expect(negotiation.status).toBe("active");

    const buyerMessage = await repo.addMessage(
      negotiation.id,
      "buyer-1",
      "buyer",
      "Need this fixed today.",
    );
    expect(buyerMessage.negotiationId).toBe(negotiation.id);

    const result = await repo.createNegotiationResult(
      negotiation.id,
      "buyer-1",
      240,
      { description: "Fix leaking sink", rooms: 1 },
    );
    const accepted = await repo.respondToResult(
      result.id,
      "accepted",
      "Confirmed. I can do that price.",
    );

    await repo.updateNegotiationStatus(
      negotiation.id,
      "completed",
      "Accepted at $240.",
    );

    const storedNegotiation = await repo.getNegotiation(negotiation.id);
    const messages = await repo.getMessages(negotiation.id);

    expect(storedNegotiation).toMatchObject({
      id: negotiation.id,
      status: "completed",
      summary: "Accepted at $240.",
    });
    expect(messages).toHaveLength(1);
    expect(accepted).toMatchObject({
      id: result.id,
      status: "accepted",
      finalPrice: 240,
      responseMessage: "Confirmed. I can do that price.",
    });
    expect(accepted.respondedAt).toBeInstanceOf(Date);
  });
});
