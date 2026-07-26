import { timingSafeEqual } from 'node:crypto';
import { validateProductionEnvironment } from './env';

export type RequestIdentity = {
  workspaceId: string;
  actor: string;
};

function constantTimeEquals(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function authenticateRequest(request: Request): RequestIdentity | null {
  validateProductionEnvironment();
  const expectedKey = process.env.PROPOSAL_API_KEY ?? '';
  const suppliedKey = request.headers.get('x-api-key') ?? '';
  const workspaceId = process.env.PROPOSAL_WORKSPACE_ID ?? 'development-workspace';

  if (process.env.NODE_ENV !== 'production' && !expectedKey) {
    return { workspaceId, actor: request.headers.get('x-actor')?.slice(0, 255) || 'development-user' };
  }
  if (!expectedKey || !constantTimeEquals(suppliedKey, expectedKey)) return null;

  const actor = request.headers.get('x-actor')?.trim();
  if (!actor || actor.length < 2 || actor.length > 255) return null;
  return { workspaceId, actor };
}

export function getClientKey(request: Request, identity: RequestIdentity): string {
  if (process.env.TRUST_PROXY_HEADERS === 'true') {
    const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    if (forwarded) return `${identity.workspaceId}:${forwarded}`;
  }
  return `${identity.workspaceId}:${identity.actor}`;
}
