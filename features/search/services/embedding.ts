import OpenAI from "openai";

export class EmbeddingService {
  private client: OpenAI | null = null;

  isConfigured(): boolean {
    return Boolean(process.env.OPENAI_API_KEY);
  }

  async generateEmbedding(text: string): Promise<number[] | null> {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      if (!this.client) {
        this.client = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
      }

      const response = await this.client.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      });

      return response.data[0]?.embedding ?? null;
    } catch {
      return null;
    }
  }
}

export const embeddingService = new EmbeddingService();
