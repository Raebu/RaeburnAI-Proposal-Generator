import { NextResponse } from 'next/server';
import { generateProposal } from '~/lib/ai/generateProposal';
import { proposalInputSchema } from '~/lib/proposals/schema';
import { auditLog } from '~/lib/security/audit';
import { toSafeError } from '~/lib/security/errors';
import { checkRateLimit } from '~/lib/security/rateLimit';

function getClientKey(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
}

export async function POST(request: Request) {
  const actor = getClientKey(request);
  const rateLimit = checkRateLimit(actor);

  if (!rateLimit.allowed) {
    auditLog({ action: 'proposal.generate', actor, outcome: 'blocked' });
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please retry shortly.' },
      { status: 429 }
    );
  }

  try {
    const json = await request.json();
    const input = proposalInputSchema.parse(json);
    const proposal = await generateProposal(input);

    auditLog({
      action: 'proposal.generate',
      actor,
      outcome: 'succeeded',
      metadata: { clientName: input.clientName }
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
    auditLog({ action: 'proposal.generate', actor, outcome: 'failed' });
    const safeError = toSafeError(error);
    return NextResponse.json({ error: safeError.message }, { status: 400 });
  }
}
