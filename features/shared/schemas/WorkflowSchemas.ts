import { z } from "zod";

export const CandidateSchema = z
  .object({
    agentId: z.string(),
    name: z.string(),
    score: z.number().optional().default(0),
    relevance: z.number().optional().default(0),
    successCount: z.number().optional().default(0),
    rating: z.number().optional().default(0),
    yearsOnPlatform: z.number().optional(),
    yearsExperience: z.number().optional(),
    location: z.string().optional(),
    services: z.array(z.string()).optional(),
    specialties: z.array(z.string()).optional(),
    hourlyRate: z.number().optional(),
    basePrice: z.number().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    embedding: z.array(z.number()).optional(),
    availability: z.string().optional(),
    certifications: z.array(z.string()).optional(),
    responseTime: z.string().optional(),
  })
  .passthrough();

export const UserPreferencesSchema = z
  .object({
    budget: z.number().optional(),
    priority: z.enum(["cost", "quality", "speed", "rating"]).optional(),
    dealBreakers: z.array(z.string()).optional(),
    preferredQualifications: z.array(z.string()).optional(),
    availabilityRequired: z.string().optional(),
    minRating: z.number().optional(),
    location: z.string().optional(),
    availability: z.enum(["any", "weekdays", "weekends"]).optional(),
    additionalRequirements: z.string().optional(),
  })
  .passthrough();

export const JobScopeSchema = z
  .object({
    jobType: z.string(),
    description: z.string(),
    location: z.string().optional(),
    urgency: z.enum(["asap", "flexible", "scheduled"]).optional(),
    estimatedDuration: z.string().optional(),
    rooms: z.number().int().positive().optional(),
    details: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

export const SearchFiltersSchema = z
  .object({
    serviceCategories: z.array(z.string()).optional(),
    minRating: z.number().optional(),
    minSuccessCount: z.number().optional(),
    maxHourlyRate: z.number().optional(),
    location: z.string().optional(),
  })
  .partial();

export const SearchRequestSchema = z.object({
  query: z.string(),
  userPreferences: UserPreferencesSchema.optional(),
  filters: SearchFiltersSchema.optional(),
  limit: z.number().int().positive().max(50).optional(),
});

export const SelectedCandidateSchema = z.object({
  candidate: CandidateSchema,
  reasoning: z.string(),
  matchScore: z.number(),
});

export const SelectTop3RequestSchema = z.object({
  top10: z.array(CandidateSchema).min(3),
  userPreferences: UserPreferencesSchema,
  scope: JobScopeSchema,
});

export const SearchAndSelectRequestSchema = z.object({
  query: z.string().min(1),
  userPreferences: UserPreferencesSchema,
  scope: JobScopeSchema,
  limit: z.number().int().positive().max(10).optional(),
});

export const TransportNegotiationScopeSchema = z
  .object({
    description: z.string().optional(),
    rooms: z.number().int().positive().optional(),
    details: z.record(z.string(), z.unknown()).optional(),
  })
  .partial()
  .refine(
    (scope) =>
      scope.description !== undefined ||
      scope.rooms !== undefined ||
      scope.details !== undefined,
    {
      message: "scope must include at least one defined field",
    },
  );

export const TransportNegotiationResultSchema = z.object({
  id: z.string(),
  negotiationId: z.string(),
  proposedBy: z.string(),
  status: z.enum(["pending", "accepted", "rejected"]),
  finalPrice: z.number().int().positive().optional(),
  scope: TransportNegotiationScopeSchema.optional(),
  createdAt: z.string(),
  respondedAt: z.string().optional(),
  responseMessage: z.string().optional(),
});

export const SelectWinnerRequestSchema = z.object({
  negotiations: z
    .array(
      z.object({
        candidateId: z.string(),
        result: TransportNegotiationResultSchema,
      }),
    )
    .min(1),
  userPreferences: UserPreferencesSchema,
  providerType: z.enum(["openai", "openrouter", "mock"]).optional(),
});

export const RunNegotiationsRequestSchema = z.object({
  buyerAgentId: z.string().min(1),
  candidates: z.array(SelectedCandidateSchema).min(1),
  preferences: UserPreferencesSchema,
  scope: JobScopeSchema,
  jobId: z.string().optional(),
  providerType: z.enum(["openai", "openrouter", "mock"]).optional(),
  maxRounds: z.number().int().positive().max(5).optional(),
});
