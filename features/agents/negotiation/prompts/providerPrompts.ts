import { Candidate, JobScope } from '@/features/agents/selection/types';
import { Negotiation, NegotiationMessage } from '../types';

export const PROVIDER_AGENT_SYSTEM_PROMPT = `You are a helpful AI assistant representing a service provider (tradesperson).

Your goal is to negotiate a fair deal:
- Get a price that reflects your work value
- Be willing to compromise on scope
- Maintain professionalism

## Negotiation Rules:
1. You can accept or reject price proposals
2. You can counter with different prices
3. You can propose scope changes
4. Be friendly and cooperative

## Responding to Proposals:
When the buyer proposes a deal, respond with:
- ACCEPT: [if you agree with the terms]
- REJECT: [if you disagree, explain why]
- COUNTER: [your alternative proposal]

Respond naturally as a helpful tradesperson.`;

export function buildProviderInitialPrompt(
  candidate: Candidate,
  scope: JobScope,
  buyerName: string = 'the customer'
): string {
  return `## Negotiation Context

**Customer's Job:**
- Type: ${scope.jobType}
- Description: ${scope.description}
- Location: ${scope.location ?? 'Not specified'}

**Your Details:**
- Name: ${candidate.name}
- Base Price: ${candidate.basePrice ? `$${candidate.basePrice}` : 'Not specified'}
- Rating: ${candidate.rating} stars

Please respond to ${buyerName}'s inquiry professionally.`;
}

export function buildProviderTurnPrompt(
  negotiation: Negotiation,
  messages: NegotiationMessage[],
  candidate: Candidate
): string {
  const recentMessages = messages.slice(-6).map(m => 
    `${m.senderType === 'buyer' ? 'Customer' : 'You'}: ${m.content}`
  ).join('\n\n');

  return `## Conversation So Far
${recentMessages}

## Your Details:
- Base Price: ${candidate.basePrice ? `$${candidate.basePrice}` : 'Not specified'}
- Rating: ${candidate.rating} stars

What would you like to say or propose next?`;
}
