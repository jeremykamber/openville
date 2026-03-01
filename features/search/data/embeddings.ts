import { SearchResult } from '../types';
import { mockTradespeople, generateMockEmbedding } from './mockTradespeople';

export const tradespeopleWithEmbeddings: SearchResult[] = mockTradespeople.map(person => ({
    ...person,
    embedding: generateMockEmbedding(`${person.name} ${person.description} ${(person.services || []).join(' ')}`)
}));