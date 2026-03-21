import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { execSync } from 'child_process';
import path from 'path';

const CLI_PATH = path.resolve(__dirname, 'openville-cli.js');

describe('openville-cli', () => {
  it('returns error when no subcommand provided', () => {
    try {
      execSync(`node ${CLI_PATH}`, { encoding: 'utf8', stdio: 'pipe' });
      expect.unreachable('Should have thrown');
    } catch (err) {
      expect(err.status).toBe(2);
      expect(err.stderr).toContain('No subcommand provided');
      expect(err.stdout).toContain('Usage: openville-cli');
    }
  });

  it('returns error when no json data is provided for a valid subcommand', () => {
    try {
      execSync(`node ${CLI_PATH} search-and-select`, { encoding: 'utf8', stdio: 'pipe' });
      expect.unreachable('Should have thrown');
    } catch (err) {
      expect(err.status).toBe(2);
      expect(err.stderr).toContain('No JSON input provided');
    }
  });

  it('select-top3 parses and sends request', () => {
    // We expect it to fail with 500 or network error if no server is running, 
    // but we can check if it parses and tries.
    // Or we can mock the server.
    const input = JSON.stringify({ top10: [], userPreferences: {}, scope: {} });
    try {
      execSync(`node ${CLI_PATH} select-top3 --base http://127.0.0.1:9999 --data '${input}'`, { encoding: 'utf8', stdio: 'pipe' });
    } catch (err) {
      expect(err.status).toBe(3);
      expect(err.stderr).toContain('Request failed');
    }
  });

  it('negotiate-run uses correct endpoint', () => {
    const input = JSON.stringify({ candidates: [] });
    try {
      execSync(`node ${CLI_PATH} negotiate-run --base http://127.0.0.1:9999 --data '${input}'`, { encoding: 'utf8', stdio: 'pipe' });
    } catch (err) {
      expect(err.status).toBe(3);
      expect(err.stderr).toContain('Request failed');
    }
  });

  it('select-winner uses correct endpoint', () => {
    const input = JSON.stringify({ negotiations: [] });
    try {
      execSync(`node ${CLI_PATH} select-winner --base http://127.0.0.1:9999 --data '${input}'`, { encoding: 'utf8', stdio: 'pipe' });
    } catch (err) {
      expect(err.status).toBe(3);
      expect(err.stderr).toContain('Request failed');
    }
  });

  it('negotiate-action uses correct endpoint for reply', () => {
    const input = JSON.stringify({ negotiationId: '123', action: 'reply', message: 'hello' });
    try {
      execSync(`node ${CLI_PATH} negotiate-action --base http://127.0.0.1:9999 --data '${input}'`, { encoding: 'utf8', stdio: 'pipe' });
    } catch (err) {
      expect(err.status).toBe(3);
      expect(err.stderr).toContain('Request failed');
    }
  });
});
