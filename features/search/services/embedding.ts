import { generateMockEmbedding } from "../data/mockTradespeople";

export class EmbeddingService {
    async generateEmbedding(text: string): Promise<number[]> {
      return generateMockEmbedding(text);
    }
}

export const embeddingService = new EmbeddingService();