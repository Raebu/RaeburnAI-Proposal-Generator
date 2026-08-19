import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { generateProposal } from '~/lib/ai/generateProposal';
import { proposalInputSchema } from '~/lib/proposals/schema';
import { auditLog } from '~/lib/security/audit';
import { toSafeError } from '~/lib/security/errors';
import { checkRateLimit } from '~/lib/security/rateLimit';

function getClientKey(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
}

function auditActor(clientKey: string) {
  return `requester-${createHash('sha256').update(clientKey).digest('hex').slice(0, 12)}`;
}

export async function POST(request: Request) {
  const actor = getClientKey(request);
  const safeActor = auditActor(actor);
  const rateLimit = checkRateLimit(actor);

  if (!rateLimit.allowed) {
    auditLog({ action: 'proposal.generate', actor: safeActor, outcome: 'blocked' });
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please retry shortly.' },
      {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Remaining': '0'
        }
      }
    );
  }

  try {
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 1024 * 1024) {
      return NextResponse.json({ error: 'Payload exceeds maximum limit of 1MB' }, { status: 413 });
    }

    const body = await request.text();
    if (body.length > 1024 * 1024) {
      return NextResponse.json({ error: 'Payload exceeds maximum limit of 1MB' }, { status: 413 });
    }

    const json = JSON.parse(body);
    const input = proposalInputSchema.parse(json);
    const proposal = await generateProposal(input);

    auditLog({
      action: 'proposal.generate',
      actor: safeActor,
      outcome: 'succeeded'
    });

    return NextResponse.json(
      { proposal },
      {
        headers: {
          'X-RateLimit-Remaining': String(rateLimit.remaining),
          'X-Content-Type-Options': 'nosniff'
        }
      }
    );
  } catch (error) {
    auditLog({ action: 'proposal.generate', actor: safeActor, outcome: 'failed' });
    const safeError = toSafeError(error);
    const status = safeError.type === 'ValidationError' ? 400 : 500;
    return NextResponse.json({ error: safeError.message }, { status });
  }
}
