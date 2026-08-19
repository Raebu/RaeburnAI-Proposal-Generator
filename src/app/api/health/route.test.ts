import { describe, expect, it } from 'vitest';
import { GET } from './route';

describe('GET /api/health', () => {
  it('returns 200 with service health status and check indicators', async () => {
    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.status).toBe('ok');
    expect(json.service).toBe('raeburnai-proposal-generator');
    expect(json.version).toBe('1.0.0-rc.1');
    expect(json.mode).toBeDefined();
    expect(json.checks).toEqual({
      process: 'alive',
      application: 'healthy',
      aiProviderConfigured: false
    });
  });
});
