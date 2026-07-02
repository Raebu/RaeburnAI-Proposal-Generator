import { describe, expect, it } from 'vitest';
import { checkRateLimit } from './rateLimit';

describe('checkRateLimit', () => {
  it('allows requests under the limit', () => {
    const result = checkRateLimit(`under-${Date.now()}`, 2, 1000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(1);
  });

  it('blocks requests over the limit', () => {
    const key = `over-${Date.now()}`;
    checkRateLimit(key, 1, 1000);
    const result = checkRateLimit(key, 1, 1000);
    expect(result.allowed).toBe(false);
  });
});
