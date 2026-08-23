import { afterEach, describe, expect, it } from 'vitest';
import { getClientKey } from './clientIdentity';

const originalTrustProxyHeaders = process.env.TRUST_PROXY_HEADERS;

afterEach(() => {
  if (originalTrustProxyHeaders === undefined) delete process.env.TRUST_PROXY_HEADERS;
  else process.env.TRUST_PROXY_HEADERS = originalTrustProxyHeaders;
});

describe('getClientKey', () => {
  it('uses Cloudflare client metadata instead of an untrusted forwarded chain', () => {
    const request = new Request('https://proposal.theraeburngroup.com/api/proposals', {
      headers: {
        'CF-Connecting-IP': '203.0.113.10',
        'X-Forwarded-For': '198.51.100.99'
      }
    });

    expect(getClientKey(request)).toBe('203.0.113.10');
  });

  it('ignores X-Forwarded-For unless trusted proxy mode is explicitly enabled', () => {
    delete process.env.TRUST_PROXY_HEADERS;
    const request = new Request('http://localhost/api/proposals', {
      headers: { 'X-Forwarded-For': '198.51.100.99' }
    });

    expect(getClientKey(request)).toBe('anonymous');
  });

  it('keeps explicit trusted-proxy support for the secondary Docker runtime', () => {
    process.env.TRUST_PROXY_HEADERS = 'true';
    const request = new Request('http://localhost/api/proposals', {
      headers: { 'X-Forwarded-For': '198.51.100.99, 192.0.2.10' }
    });

    expect(getClientKey(request)).toBe('198.51.100.99');
  });
});
