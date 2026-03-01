export class VectorSimilarity {
    cosineSimilarity(a: number[], b: number[]): number {
      if (!a || !b || a.length === 0 || b.length === 0) {
        return 0;
      }
      
      if (a.length !== b.length) {
        throw new Error('Vectors must have same dimension');
      }
      
      let dotProduct = 0;
      let normA = 0;
      let normB = 0;
      
      for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
      }
      
      const sqrtNormA = Math.sqrt(normA);
      const sqrtNormB = Math.sqrt(normB);
      
      if (sqrtNormA === 0 || sqrtNormB === 0) {
        return 0;
      }
      
      return dotProduct / (sqrtNormA * sqrtNormB);
    }
  }
  
  export const vectorSimilarity = new VectorSimilarity();