type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

function cleanupExpiredBuckets(now: number) {
  if (buckets.size > 100) {
    for (const [key, bucket] of buckets.entries()) {
      if (bucket.resetAt <= now) {
        buckets.delete(key);
      }
    }
  }
}

export function checkRateLimit(key: string, limit?: number, windowMs = 60_000) {
  const configuredLimit = Number.parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE || '', 10);
  const effectiveLimit =
    limit ?? (Number.isFinite(configuredLimit) && configuredLimit > 0 ? configuredLimit : 20);
  const now = Date.now();

  cleanupExpiredBuckets(now);

  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: effectiveLimit - 1, resetAt: now + windowMs };
  }

  if (existing.count >= effectiveLimit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { allowed: true, remaining: effectiveLimit - existing.count, resetAt: existing.resetAt };
}

export function clearRateLimitBuckets() {
  buckets.clear();
}
