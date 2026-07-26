import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { generateProposal } from '~/lib/ai/generateProposal';
import { createProposal } from '~/lib/persistence/proposals';
import { proposalInputSchema } from '~/lib/proposals/schema';
import { auditLog } from '~/lib/security/audit';
import { authenticateRequest, getClientKey } from '~/lib/security/auth';
import { toSafeError } from '~/lib/security/errors';
import { checkRateLimit } from '~/lib/security/rateLimit';

function responseHeaders(rateLimit: { remaining: number; resetAt: number }) {
  return {
    'X-RateLimit-Remaining': String(rateLimit.remaining),
    'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetAt / 1000)),
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'no-store',
  };
}

export async function POST(request: Request) {
  const identity = authenticateRequest(request);
  if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clientKey = getClientKey(request, identity);
  const rateLimit = await checkRateLimit(
    clientKey,
    Number(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE ?? 20),
  );
  const headers = responseHeaders(rateLimit);

  if (!rateLimit.backendAvailable && process.env.NODE_ENV === 'production') {
    auditLog({ action: 'proposal.generate', actor: identity.actor, outcome: 'blocked', metadata: { reason: 'rate_limit_backend_unavailable' } });
    return NextResponse.json({ error: 'Request protection is temporarily unavailable.' }, { status: 503, headers });
  }
  if (!rateLimit.allowed) {
    auditLog({ action: 'proposal.generate', actor: identity.actor, outcome: 'blocked', metadata: { reason: 'rate_limited' } });
    return NextResponse.json({ error: 'Rate limit exceeded. Please retry shortly.' }, { status: 429, headers });
  }

  try {
    const json: unknown = await request.json();
    const input = proposalInputSchema.parse(json);
    const proposalOutput = await generateProposal(input);
    const proposal = await createProposal({
      workspaceId: identity.workspaceId,
      actor: identity.actor,
      proposalInput: input,
      proposalOutput,
    });

    auditLog({
      action: 'proposal.generate',
      actor: identity.actor,
      outcome: 'succeeded',
      metadata: {
        proposalId: proposal.id,
        clientNameHash: createHash('sha256').update(input.clientName).digest('hex'),
        status: proposal.status,
      },
    });

    return NextResponse.json(
      {
        proposal,
        message: 'Draft generated and stored. Human approval is required before client use.',
      },
      { status: 201, headers },
    );
  } catch (error) {
    auditLog({
      action: 'proposal.generate',
      actor: identity.actor,
      outcome: 'failed',
      metadata: { errorType: error instanceof Error ? error.name : 'UnknownError' },
    });
    const safeError = toSafeError(error);
    return NextResponse.json({ error: safeError.message, type: safeError.type }, { status: safeError.status, headers });
  }
}
