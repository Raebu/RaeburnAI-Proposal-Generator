import { afterEach, describe, expect, it } from 'vitest';
import { authenticateRequest, getClientKey } from './auth';
import { toSafeError } from './errors';

const originalEnvironment = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnvironment };
});

describe('API authentication', () => {
  it('requires a matching key and valid actor when configured', () => {
    process.env.NODE_ENV = 'test';
    process.env.PROPOSAL_API_KEY = 'a'.repeat(32);
    process.env.PROPOSAL_WORKSPACE_ID = 'workspace-1';

    const valid = authenticateRequest(
      new Request('https://example.test/api', {
        headers: { 'x-api-key': 'a'.repeat(32), 'x-actor': 'reviewer@example.com' },
      }),
    );
    expect(valid).toEqual({ workspaceId: 'workspace-1', actor: 'reviewer@example.com' });

    const invalid = authenticateRequest(
      new Request('https://example.test/api', {
        headers: { 'x-api-key': 'b'.repeat(32), 'x-actor': 'reviewer@example.com' },
      }),
    );
    expect(invalid).toBeNull();
  });

  it('does not trust forwarded IPs unless configured', () => {
    process.env.NODE_ENV = 'test';
    process.env.PROPOSAL_API_KEY = '';
    process.env.PROPOSAL_WORKSPACE_ID = 'workspace-1';
    const request = new Request('https://example.test/api', {
      headers: { 'x-forwarded-for': '203.0.113.20', 'x-actor': 'reviewer@example.com' },
    });
    const identity = authenticateRequest(request)!;

    process.env.TRUST_PROXY_HEADERS = 'false';
    expect(getClientKey(request, identity)).toBe('workspace-1:reviewer@example.com');
    process.env.TRUST_PROXY_HEADERS = 'true';
    expect(getClientKey(request, identity)).toBe('workspace-1:203.0.113.20');
  });
});

describe('safe errors', () => {
  it('does not return arbitrary internal exception text', () => {
    expect(toSafeError(new Error('postgresql://user:secret@example.test/db'))).toEqual({
      message: 'Unexpected server error.',
      type: 'internal_error',
      status: 500,
    });
  });
});
