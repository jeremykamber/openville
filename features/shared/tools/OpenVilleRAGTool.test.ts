import { describe, it, expect } from 'vitest';
import {
  openVilleSearchAndSelectTool,
  openVilleSelectTop3Tool,
  openVilleNegotiateRunTool,
  openVilleNegotiateActionTool,
  openVilleSelectWinnerTool
} from './OpenVilleRAGTool';

describe('OpenVilleRAGTool', () => {
  describe('openVilleSearchAndSelectTool', () => {
    it('should have correct name and description', () => {
      expect(openVilleSearchAndSelectTool.name).toBe('openville-search-and-select');
      expect(openVilleSearchAndSelectTool.description).toContain('Search and select top 10 candidates');
    });
  });

  describe('openVilleSelectTop3Tool', () => {
    it('should have correct name and description', () => {
      expect(openVilleSelectTop3Tool.name).toBe('openville-select-top3');
      expect(openVilleSelectTop3Tool.description).toContain('Select top 3 candidates');
    });
  });

  describe('openVilleNegotiateRunTool', () => {
    it('should have correct name and description', () => {
      expect(openVilleNegotiateRunTool.name).toBe('openville-negotiate-run');
      expect(openVilleNegotiateRunTool.description).toContain('Start a negotiation session');
    });
  });

  describe('openVilleNegotiateActionTool', () => {
    it('should have correct name and description', () => {
      expect(openVilleNegotiateActionTool.name).toBe('openville-negotiate-action');
      expect(openVilleNegotiateActionTool.description).toContain('Perform a specific action during an ongoing negotiation');
    });
  });

  describe('openVilleSelectWinnerTool', () => {
    it('should have correct name and description', () => {
      expect(openVilleSelectWinnerTool.name).toBe('openville-select-winner');
      expect(openVilleSelectWinnerTool.description).toContain('Select the final winner');
    });
  });

  describe('tool instantiation', () => {
    it('should be able to import and access all tools', () => {
      expect(openVilleSearchAndSelectTool).toBeDefined();
      expect(openVilleSelectTop3Tool).toBeDefined();
      expect(openVilleNegotiateRunTool).toBeDefined();
      expect(openVilleNegotiateActionTool).toBeDefined();
      expect(openVilleSelectWinnerTool).toBeDefined();
    });
  });
});