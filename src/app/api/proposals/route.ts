import { NextResponse } from 'next/server';
import { generateProposal } from '~/lib/ai/generateProposal';
import { buildSourceManifest } from '~/lib/ai/provenance';
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
    const sourceManifest = buildSourceManifest(input);
    const proposal = await generateProposal(input);

    const presentSources = sourceManifest.filter((item) => item.present);
    const sourceDigest = presentSources
      .map((item) => `${item.source}:${item.sha256}`)
      .join('|')
      .slice(0, 1500);

    auditLog({
      action: 'proposal.generate',
      actor,
      outcome: 'succeeded',
      metadata: {
        clientName: input.clientName,
        sourceCount: presentSources.length,
        sourceDigest
      }
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
