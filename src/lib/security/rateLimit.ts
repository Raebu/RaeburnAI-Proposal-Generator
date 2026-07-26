import IORedis from 'ioredis';

type Bucket = { count: number; resetAt: number };
export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  backendAvailable: boolean;
};

const developmentBuckets = new Map<string, Bucket>();
let redis: IORedis | null | undefined;

function getRedis(): IORedis | null {
  if (redis !== undefined) return redis;
  const url = process.env.REDIS_URL;
  if (!url) {
    redis = null;
    return redis;
  }
  redis = new IORedis(url, {
    lazyConnect: true,
    enableReadyCheck: true,
    maxRetriesPerRequest: 1,
    connectTimeout: Math.max(1000, Math.min(Number(process.env.REDIS_CONNECT_TIMEOUT_MS ?? 5000), 30_000)),
    commandTimeout: Math.max(1000, Math.min(Number(process.env.REDIS_COMMAND_TIMEOUT_MS ?? 3000), 30_000)),
    tls: url.startsWith('rediss://') ? {} : undefined,
  });
  redis.on('error', () => {
    // Availability is returned to callers without logging credentials embedded in REDIS_URL.
  });
  return redis;
}

function developmentRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = developmentBuckets.get(key);
  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    developmentBuckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: Math.max(0, limit - 1), resetAt, backendAvailable: false };
  }
  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt, backendAvailable: false };
  }
  existing.count += 1;
  return {
    allowed: true,
    remaining: Math.max(0, limit - existing.count),
    resetAt: existing.resetAt,
    backendAvailable: false,
  };
}

export async function checkRateLimit(key: string, limit = 20, windowMs = 60_000): Promise<RateLimitResult> {
  const safeLimit = Math.max(1, Math.min(limit, 10_000));
  const safeWindow = Math.max(1000, Math.min(windowMs, 24 * 60 * 60 * 1000));
  const client = getRedis();
  if (!client) {
    return process.env.NODE_ENV === 'production'
      ? { allowed: false, remaining: 0, resetAt: Date.now() + safeWindow, backendAvailable: false }
      : developmentRateLimit(key, safeLimit, safeWindow);
  }

  try {
    if (client.status === 'wait') await client.connect();
    const windowId = Math.floor(Date.now() / safeWindow);
    const redisKey = `proposal-generator:rate:${key}:${windowId}`;
    const count = await client.incr(redisKey);
    if (count === 1) await client.pexpire(redisKey, safeWindow);
    const ttl = await client.pttl(redisKey);
    return {
      allowed: count <= safeLimit,
      remaining: Math.max(0, safeLimit - count),
      resetAt: Date.now() + Math.max(ttl, 0),
      backendAvailable: true,
    };
  } catch {
    return process.env.NODE_ENV === 'production'
      ? { allowed: false, remaining: 0, resetAt: Date.now() + safeWindow, backendAvailable: false }
      : developmentRateLimit(key, safeLimit, safeWindow);
  }
}

export async function rateLimitBackendReady(): Promise<boolean> {
  const client = getRedis();
  if (!client) return false;
  try {
    if (client.status === 'wait') await client.connect();
    return (await client.ping()) === 'PONG';
  } catch {
    return false;
  }
}
