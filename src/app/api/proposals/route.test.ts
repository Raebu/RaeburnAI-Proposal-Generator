import { describe, expect, it, beforeEach } from 'vitest';
import { POST } from './route';
import { clearRateLimitBuckets } from '~/lib/security/rateLimit';

describe('POST /api/proposals', () => {
  beforeEach(() => {
    clearRateLimitBuckets();
  });

  it('returns 200 with generated proposal for valid request', async () => {
    const req = new Request('http://localhost:3000/api/proposals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientName: 'API Test Client',
        sector: 'Fintech'
      })
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.proposal).toBeDefined();
    expect(json.proposal.contractVersion).toBe('1.0');
    expect(json.proposal.executiveSummary).toContain('API Test Client');
  });

  it('returns 400 when clientName is missing or invalid', async () => {
    const req = new Request('http://localhost:3000/api/proposals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sector: 'Fintech'
      })
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toContain('Invalid input data');
  });

  it('returns 413 when payload exceeds 1MB', async () => {
    const req = new Request('http://localhost:3000/api/proposals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': '2000000'
      },
      body: JSON.stringify({ clientName: 'Large Client' })
    });

    const res = await POST(req);
    expect(res.status).toBe(413);

    const json = await res.json();
    expect(json.error).toContain('Payload exceeds maximum limit');
  });

  it('returns 413 for an oversized body without a content-length header', async () => {
    const req = new Request('http://localhost:3000/api/proposals', {
      method: 'POST',
      body: JSON.stringify({ clientName: 'Large Client', ignored: 'x'.repeat(1024 * 1024) })
    });

    const res = await POST(req);
    expect(res.status).toBe(413);
  });

  it('does not expose malformed payload details', async () => {
    const req = new Request('http://localhost:3000/api/proposals', {
      method: 'POST',
      body: '{"clientName":"Confidential Client",broken}'
    });

    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toBe('Invalid JSON request body.');
    expect(json.error).not.toContain('Confidential Client');
  });
});
