import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { checkRateLimit, clearRateLimitBuckets } from './rateLimit';

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    clearRateLimitBuckets();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows requests under the rate limit', () => {
    const result = checkRateLimit('user-1', 2, 60000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(1);
  });

  it('blocks requests over the rate limit', () => {
    const key = 'user-blocked';
    checkRateLimit(key, 1, 60000);
    const result = checkRateLimit(key, 1, 60000);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('resets count after window expires', () => {
    const key = 'user-reset';
    const first = checkRateLimit(key, 1, 1000);
    expect(first.allowed).toBe(true);

    const second = checkRateLimit(key, 1, 1000);
    expect(second.allowed).toBe(false);

    // Advance time past the 1000ms window
    vi.advanceTimersByTime(1001);

    const third = checkRateLimit(key, 1, 1000);
    expect(third.allowed).toBe(true);
    expect(third.remaining).toBe(0);
  });
});
