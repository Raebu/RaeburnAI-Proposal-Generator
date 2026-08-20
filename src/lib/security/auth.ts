import { timingSafeEqual } from 'node:crypto';

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function proposalApiAuthorised(request: Request) {
  const configured = process.env.PROPOSAL_API_KEY;
  const authorization = request.headers.get('authorization') || '';
  if (
    configured &&
    authorization.startsWith('Bearer ') &&
    safeEqual(authorization.slice(7), configured)
  ) {
    return true;
  }
  if (process.env.TRUST_CLOUDFLARE_ACCESS === 'true') {
    return Boolean(
      request.headers.get('cf-access-jwt-assertion') &&
        request.headers.get('cf-access-authenticated-user-email') &&
        request.headers.get('cf-ray')
    );
  }
  return !configured && process.env.NODE_ENV !== 'production';
}
