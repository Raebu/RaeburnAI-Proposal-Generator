import { NextResponse } from 'next/server';
import { createHash, randomUUID } from 'node:crypto';
import { generateProposal } from '~/lib/ai/generateProposal';
import { proposalInputSchema } from '~/lib/proposals/schema';
import { proposalApiAuthorised } from '~/lib/security/auth';
import { auditLog } from '~/lib/security/audit';
import { getClientKey } from '~/lib/security/clientIdentity';
import { toSafeError } from '~/lib/security/errors';
import { checkRateLimit } from '~/lib/security/rateLimit';

function requestId(request: Request) {
  const supplied = request.headers.get('x-request-id');
  return supplied && /^[a-zA-Z0-9._:-]{8,120}$/.test(supplied) ? supplied : randomUUID();
}

function auditActor(value: string) {
  return `requester-${createHash('sha256').update(value).digest('hex').slice(0, 12)}`;
}

function json(
  body: Record<string, unknown>,
  status: number,
  correlationId: string,
  headers: Record<string, string> = {}
) {
  return NextResponse.json(
    { ...body, requestId: correlationId },
    { status, headers: { 'X-Request-ID': correlationId, 'Cache-Control': 'no-store', ...headers } }
  );
}

export async function POST(request: Request) {
  const correlationId = requestId(request);
  const actor = getClientKey(request);
  const safeActor = auditActor(actor);
  if (!proposalApiAuthorised(request)) {
    auditLog({
      action: 'proposal.generate',
      actor: safeActor,
      outcome: 'blocked',
      metadata: { requestId: correlationId, reason: 'unauthorised' }
    });
    return json({ error: 'Unauthorized' }, 401, correlationId);
  }
  const rateLimit = checkRateLimit(actor);
  if (!rateLimit.allowed) {
    auditLog({
      action: 'proposal.generate',
      actor: safeActor,
      outcome: 'blocked',
      metadata: { requestId: correlationId, reason: 'rate_limit' }
    });
    return json({ error: 'Rate limit exceeded. Please retry shortly.' }, 429, correlationId, {
      'Retry-After': String(Math.max(1, Math.ceil((rateLimit.resetAt - Date.now()) / 1000))),
      'X-RateLimit-Remaining': '0'
    });
  }

  try {
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > 1024 * 1024)
      return json({ error: 'Payload exceeds maximum limit of 1MB' }, 413, correlationId);
    const body = await request.text();
    if (body.length > 1024 * 1024)
      return json({ error: 'Payload exceeds maximum limit of 1MB' }, 413, correlationId);
    const input = proposalInputSchema.parse(JSON.parse(body));
    const proposal = await generateProposal(input);
    auditLog({
      action: 'proposal.generate',
      actor: safeActor,
      outcome: 'succeeded',
      metadata: {
        requestId: correlationId,
        assessmentIdPresent: Boolean(input.assessmentId),
        generationMode: proposal.generationMode
      }
    });
    return json({ proposal }, 200, correlationId, {
      'X-RateLimit-Remaining': String(rateLimit.remaining)
    });
  } catch (error) {
    auditLog({
      action: 'proposal.generate',
      actor: safeActor,
      outcome: 'failed',
      metadata: { requestId: correlationId }
    });
    const safeError = toSafeError(error);
    return json(
      { error: safeError.message },
      safeError.type === 'ValidationError' ? 400 : 500,
      correlationId
    );
  }
}
