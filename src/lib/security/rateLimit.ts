type Bucket = { count: number; resetAt: number };
export type RateLimitResult = { allowed: boolean; remaining: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function localRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }
  if (existing.count >= limit) return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}

async function distributedRateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const url = process.env.RATE_LIMIT_REST_URL;
  const token = process.env.RATE_LIMIT_REST_TOKEN;
  if (!url || !token) throw new Error('Distributed rate limiter is not configured');

  const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));
  const response = await fetch(`${url.replace(/\/$/, '')}/pipeline`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify([
      ['INCR', `proposal-rate:${key}`],
      ['TTL', `proposal-rate:${key}`]
    ]),
    signal: AbortSignal.timeout(3_000),
    cache: 'no-store'
  });
  if (!response.ok) throw new Error('Distributed rate limiter request failed');
  const values = (await response.json()) as Array<{ result?: number }>;
  const count = Number(values[0]?.result || 0);
  let ttl = Number(values[1]?.result ?? -1);

  if (count === 1 || ttl < 0) {
    const expiry = await fetch(`${url.replace(/\/$/, '')}/expire/proposal-rate:${encodeURIComponent(key)}/${windowSeconds}`, {
      headers: { authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(3_000),
      cache: 'no-store'
    });
    if (!expiry.ok) throw new Error('Distributed rate limiter expiry failed');
    ttl = windowSeconds;
  }

  const resetAt = Date.now() + Math.max(1, ttl) * 1000;
  return { allowed: count <= limit, remaining: Math.max(0, limit - count), resetAt };
}

export async function checkRateLimit(key: string, limit = 20, windowMs = 60_000): Promise<RateLimitResult> {
  if (process.env.RATE_LIMIT_REST_URL && process.env.RATE_LIMIT_REST_TOKEN) {
    return distributedRateLimit(key, limit, windowMs);
  }
  if (process.env.NODE_ENV === 'production') {
    return { allowed: false, remaining: 0, resetAt: Date.now() + windowMs };
  }
  return localRateLimit(key, limit, windowMs);
}
