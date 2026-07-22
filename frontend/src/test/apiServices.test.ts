import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';
import { apexApi, MOCK_GRAPH_INITIAL, MOCK_RUNBOOK_INITIAL } from '../services/api';

vi.mock('axios');

describe('apexApi', () => {
  it('returns backend graph data on success', async () => {
    const mockData = { nodes: [], edges: [] };
    (axios.get as any).mockResolvedValueOnce({ data: mockData });

    const res = await apexApi.getGraphState(false);
    expect(res).toEqual(mockData);
  });

  it('falls back to mock graph data on error', async () => {
    (axios.get as any).mockRejectedValueOnce(new Error('Network error'));

    const res = await apexApi.getGraphState(false);
    expect(res).toEqual(MOCK_GRAPH_INITIAL);
  });

  it('returns copilot answer on fallback', async () => {
    (axios.get as any).mockRejectedValueOnce(new Error('Network error'));

    const res = await apexApi.searchCopilot('PT-401');
    expect(res.query).toBe('PT-401');
    expect(res.confidence).toBe(0.97);
  });
});
