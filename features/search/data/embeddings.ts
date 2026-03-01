import { SearchResult } from '../types';
import { mockTradespeople, generateMockEmbedding } from './mockTradespeople';

/* Contains the array of search results of type Search Result */
export const tradespeopleWithEmbeddings: SearchResult[] = mockTradespeople.map(person => ({
    ...person,
    embedding: generateMockEmbedding(`${person.name} ${person.description} ${person.services.join(' ')}`)
}));