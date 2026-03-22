import OpenAI from "openai";

export type EmbeddingResult =
  | { embedding: number[] }
  | { embedding: null; reason: "unconfigured" | "error"; message?: string };

export class EmbeddingService {
  private client: OpenAI | null = null;
  private cachedApiKey: string | null = null;
  private cachedBaseURL: string | undefined = undefined;

  isConfigured(): boolean {
    return Boolean(process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY);
  }

  private getClientConfig(): { apiKey: string; baseURL?: string; model: string } | null {
    if (process.env.OPENAI_API_KEY) {
      return {
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small",
      };
    }

    if (process.env.OPENROUTER_API_KEY) {
      return {
        apiKey: process.env.OPENROUTER_API_KEY,
        baseURL: "https://openrouter.ai/api/v1",
        model: process.env.OPENROUTER_EMBEDDING_MODEL ?? "openai/text-embedding-3-small",
      };
    }

    return null;
  }

  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    const clientConfig = this.getClientConfig();

    if (!clientConfig) {
      return { embedding: null, reason: "unconfigured" };
    }

    try {
      if (
        !this.client ||
        this.cachedApiKey !== clientConfig.apiKey ||
        this.cachedBaseURL !== clientConfig.baseURL
      ) {
        this.client = new OpenAI({
          apiKey: clientConfig.apiKey,
          baseURL: clientConfig.baseURL,
        });
        this.cachedApiKey = clientConfig.apiKey;
        this.cachedBaseURL = clientConfig.baseURL;
      }

      const response = await this.client.embeddings.create({
        model: clientConfig.model,
        input: text,
      });

      const embedding = response.data[0]?.embedding;
      if (!embedding) {
        return { embedding: null, reason: "error", message: "No embedding returned from API" };
      }

      return { embedding };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { embedding: null, reason: "error", message };
    }
  }
}

export const embeddingService = new EmbeddingService();
