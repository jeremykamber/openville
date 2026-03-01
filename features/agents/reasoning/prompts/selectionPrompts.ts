import { 
  Candidate, 
  UserPreferences, 
  JobScope 
} from '@/features/agents/selection/types';

export const SELECT_TOP3_SYSTEM_PROMPT = `You are a helpful AI assistant helping your user find the best service provider for their needs.

Your user has asked you to help them hire someone for a job. It's your job to select the best 3 candidates from the options available and explain why each one is a good choice for your user.

## How to think about this:

Your user has told you what's important to them:
- Their budget: How much they want to spend
- What matters most: Whether they care more about saving money, getting quality work, speed, or working with someone well-rated
- Any deal breakers: Things that would automatically rule out a candidate
- Preferred qualifications: Skills or experience they'd like the person to have

You need to find the 3 candidates that best match what YOUR USER wants.

## Important rules:

1. Always prioritize your user's stated preferences
2. If a candidate violates a deal breaker, don't include them
3. Be specific about WHY each candidate is a good match - cite actual details
4. Your #1 pick should be your strongest recommendation
5. Think about what would matter TO YOUR USER, not just what's objectively best

## What to return:

You MUST return a JSON object with this exact structure:

{
  "top3": [
    {
      "agentId": "string - must match exactly from the candidate list provided",
      "reasoning": "string - 1-2 sentences explaining why this candidate is a good choice for YOUR USER",
      "matchScore": number - 0-100 score for how well they match your user's needs (100 = perfect match)
    }
  ],
  "summary": "string - 2-3 sentences explaining your overall thinking and why these are the best choices for your user"
}

Return ONLY valid JSON - no markdown, no explanations outside the JSON structure.`;

export function buildSelectionUserPrompt(
  candidates: Candidate[],
  preferences: UserPreferences,
  scope: JobScope
): string {
  const candidatesJson = candidates.map(c => ({
    agentId: c.agentId,
    name: c.name,
    relevance: c.relevance,
    systemScore: c.score,
    successCount: c.successCount,
    rating: c.rating,
    basePrice: c.basePrice ?? 'Not specified',
    specialties: c.specialties ?? [],
    yearsExperience: c.yearsExperience ?? 'Not specified',
    certifications: c.certifications ?? [],
    availability: c.availability ?? 'Not specified',
    responseTime: c.responseTime ?? 'Not specified',
  }));

  return `## The Job
- Type of work: ${scope.jobType}
- Description: ${scope.description}
- When needed: ${scope.urgency ?? 'flexible'}
${scope.location ? `- Where: ${scope.location}` : ''}
${scope.estimatedDuration ? `- How long: ${scope.estimatedDuration}` : ''}

## What My User Wants
- Budget: ${preferences.budget ? `$${preferences.budget} or less` : 'No specific budget'}
- What matters most: ${preferences.priority ?? 'a good balance of cost and quality'}
${preferences.dealBreakers?.length ? `- Won't consider: ${preferences.dealBreakers.join(', ')}` : '- No deal breakers'}
${preferences.preferredQualifications?.length ? `- Would prefer: ${preferences.preferredQualifications.join(', ')}` : ''}
${preferences.minRating ? `- Must have at least ${Number(preferences.minRating).toFixed(1)} stars` : ''}

## Available Candidates

${JSON.stringify(candidatesJson, null, 2)}

Please select the top 3 candidates that would be best for my user and explain your reasoning.`;
}
