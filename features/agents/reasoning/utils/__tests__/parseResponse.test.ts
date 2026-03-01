import { describe, it, expect } from 'vitest';
import { parseSelectionResponse, ResponseParseError } from '../parseResponse';

describe('parseSelectionResponse', () => {
  const validResponse = JSON.stringify({
    top3: [
      { agentId: 'tp-001', reasoning: 'Great match', matchScore: 95 },
      { agentId: 'tp-002', reasoning: 'Good match', matchScore: 85 },
      { agentId: 'tp-003', reasoning: 'Decent match', matchScore: 75 },
    ],
    summary: 'Selected based on cost priority',
  });

  it('should parse valid JSON response', () => {
    const result = parseSelectionResponse(validResponse);
    
    expect(result.top3).toHaveLength(3);
    expect(result.top3[0].agentId).toBe('tp-001');
    expect(result.top3[0].matchScore).toBe(95);
    expect(result.summary).toBe('Selected based on cost priority');
  });

  it('should handle JSON wrapped in markdown', () => {
    const markdownResponse = '```json\n' + validResponse + '\n```';
    const result = parseSelectionResponse(markdownResponse);
    
    expect(result.top3).toHaveLength(3);
  });

  it('should handle JSON with surrounding text', () => {
    const textResponse = `Here is my response: ${validResponse} Let me know if you need anything else.`;
    const result = parseSelectionResponse(textResponse);
    
    expect(result.top3).toHaveLength(3);
  });

  it('should throw ResponseParseError for invalid JSON', () => {
    expect(() => parseSelectionResponse('not json')).toThrow(ResponseParseError);
  });

  it('should throw ResponseParseError for invalid structure', () => {
    const invalidStructure = JSON.stringify({ wrongField: 'value' });
    
    expect(() => parseSelectionResponse(invalidStructure)).toThrow(ResponseParseError);
  });

  it('should preserve raw response in error', () => {
    const badResponse = 'this is not valid json';
    
    try {
      parseSelectionResponse(badResponse);
    } catch (error) {
      expect(error).toBeInstanceOf(ResponseParseError);
      expect((error as ResponseParseError).rawResponse).toBe(badResponse);
    }
  });

  it('should validate matchScore range (0-100)', () => {
    const outOfRange = JSON.stringify({
      top3: [{ agentId: 't1', reasoning: 'test', matchScore: 150 }],
      summary: 'test',
    });
    
    expect(() => parseSelectionResponse(outOfRange)).toThrow(ResponseParseError);
  });

  it('should require agentId to be string', () => {
    const invalidId = JSON.stringify({
      top3: [{ agentId: 123, reasoning: 'test', matchScore: 50 }],
      summary: 'test',
    });
    
    expect(() => parseSelectionResponse(invalidId)).toThrow(ResponseParseError);
  });
});
