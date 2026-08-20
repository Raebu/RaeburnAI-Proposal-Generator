import { afterEach, describe, expect, it } from 'vitest';
import { proposalApiAuthorised } from './auth';

const previousKey = process.env.PROPOSAL_API_KEY;
const previousTrust = process.env.TRUST_CLOUDFLARE_ACCESS;

afterEach(() => {
  if (previousKey === undefined) delete process.env.PROPOSAL_API_KEY;
  else process.env.PROPOSAL_API_KEY = previousKey;
  if (previousTrust === undefined) delete process.env.TRUST_CLOUDFLARE_ACCESS;
  else process.env.TRUST_CLOUDFLARE_ACCESS = previousTrust;
});

describe('proposal API authorization', () => {
  it('accepts only the configured bearer key for service calls', () => {
    process.env.PROPOSAL_API_KEY = 'correct-secret';
    expect(
      proposalApiAuthorised(
        new Request('https://proposal.test', {
          headers: { authorization: 'Bearer correct-secret' }
        })
      )
    ).toBe(true);
    expect(
      proposalApiAuthorised(
        new Request('https://proposal.test', { headers: { authorization: 'Bearer wrong-secret' } })
      )
    ).toBe(false);
  });

  it('accepts the internal workspace only with explicit Cloudflare Access trust', () => {
    process.env.PROPOSAL_API_KEY = 'service-secret';
    process.env.TRUST_CLOUDFLARE_ACCESS = 'true';
    const headers = {
      'cf-access-jwt-assertion': 'signed-by-access',
      'cf-access-authenticated-user-email': 'reviewer@example.test',
      'cf-ray': 'edge-request'
    };
    expect(proposalApiAuthorised(new Request('https://proposal.test', { headers }))).toBe(true);
    expect(
      proposalApiAuthorised(
        new Request('https://proposal.test', { headers: { ...headers, 'cf-ray': '' } })
      )
    ).toBe(false);
  });
});
