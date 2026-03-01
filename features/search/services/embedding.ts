import OpenAI from "openai";

export class EmbeddingService {
  private client: OpenAI | null = null;

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

  async generateEmbedding(text: string): Promise<number[] | null> {
    const clientConfig = this.getClientConfig();

    if (!clientConfig) {
      return null;
    }

    try {
      if (!this.client) {
        this.client = new OpenAI({
          apiKey: clientConfig.apiKey,
          baseURL: clientConfig.baseURL,
        });
      }

      const response = await this.client.embeddings.create({
        model: clientConfig.model,
        input: text,
      });

      return response.data[0]?.embedding ?? null;
    } catch {
      return null;
    }
  }
}

export const embeddingService = new EmbeddingService();
