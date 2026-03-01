import { Candidate, JobScope, UserPreferences } from '@/features/agents/selection/types';
import { Negotiation, NegotiationMessage } from '../types';

export const BUYER_AGENT_SYSTEM_PROMPT = `You are a helpful AI assistant representing a buyer looking to hire a service provider.

Your goal is to negotiate the best possible deal for your user:
- Get a fair price within their budget
- Ensure the scope of work meets their needs
- Be professional but firm

## Negotiation Rules:
1. You can propose price adjustments (higher or lower)
2. You can propose scope changes (more or less work)
3. You can accept or reject proposals from the provider
4. If negotiations aren't going well, you can cancel

## Proposal Format:
When you want to propose a final deal, use this format:
- Price: $[amount]
- Scope: [description of work]
- Reason: [why this is fair]

## Cancellation:
If you feel the negotiation isn't productive, say "CANCEL_NEGOTIATION" and explain why.

Respond naturally as a helpful assistant negotiating on behalf of your user.`;

export function buildBuyerInitialPrompt(
  candidate: Candidate,
  scope: JobScope,
  preferences: UserPreferences
): string {
  return `## Negotiation Context

**Your User's Job:**
- Type: ${scope.jobType}
- Description: ${scope.description}
- Location: ${scope.location ?? 'Not specified'}
- Urgency: ${scope.urgency ?? 'flexible'}

**Your User's Budget:** ${preferences.budget ? `$${preferences.budget}` : 'No specific budget'}
**Priority:** ${preferences.priority ?? 'balanced'}

**Service Provider:**
- Name: ${candidate.name}
- Base Price: ${candidate.basePrice ? `$${candidate.basePrice}` : 'Not specified'}
- Rating: ${candidate.rating} stars
- Experience: ${candidate.yearsExperience ?? 'Not specified'} years

Please start the negotiation by introducing yourself and discussing the job.`;
}

export function buildBuyerTurnPrompt(
  negotiation: Negotiation,
  messages: NegotiationMessage[],
  preferences: UserPreferences
): string {
  const recentMessages = messages.slice(-6).map(m => 
    `${m.senderType === 'buyer' ? 'You' : 'Provider'}: ${m.content}`
  ).join('\n\n');

  return `## Conversation So Far
${recentMessages}

## Your User's Preferences:
- Budget: ${preferences.budget ? `$${preferences.budget}` : 'No specific budget'}
- Priority: ${preferences.priority ?? 'balanced'}

What would you like to say or propose next?`;
}
