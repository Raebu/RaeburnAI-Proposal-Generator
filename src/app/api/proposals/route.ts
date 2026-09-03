import { NextResponse } from 'next/server';
import { generateProposal } from '~/lib/ai/generateProposal';
import { buildSourceManifest } from '~/lib/ai/provenance';
import { createProposal, listProposals } from '~/lib/proposals/store';
import { proposalInputSchema } from '~/lib/proposals/schema';
import { authenticate, requireRole } from '~/lib/security/auth';
import { auditLog } from '~/lib/security/audit';
import { toSafeError } from '~/lib/security/errors';
import { checkRateLimit } from '~/lib/security/rateLimit';

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function GET(request: Request) {
  const principal = authenticate(request);
  if (!principal) return unauthorized();
  const proposals = await listProposals(principal.workspaceId);
  return NextResponse.json({ proposals });
}

export async function POST(request: Request) {
  const principal = authenticate(request);
  if (!principal) return unauthorized();
  if (!requireRole(principal, 'editor')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const rateLimit = await checkRateLimit(`${principal.workspaceId}:${principal.subject}`);
  if (!rateLimit.allowed) {
    await auditLog({
      workspaceId: principal.workspaceId,
      organisationId: principal.organisationId,
      action: 'proposal.generate',
      actor: principal.subject,
      outcome: 'blocked'
    });
    return NextResponse.json({ error: 'Rate limit exceeded or unavailable.' }, { status: 429 });
  }

  try {
    const body = await request.text();
    if (Buffer.byteLength(body, 'utf8') > 256_000) {
      return NextResponse.json({ error: 'Request body exceeds 256 KB.' }, { status: 413 });
    }
    const input = proposalInputSchema.parse(JSON.parse(body));
    const sourceManifest = buildSourceManifest(input);
    const output = await generateProposal(input);
    const record = await createProposal({
      workspaceId: principal.workspaceId,
      organisationId: principal.organisationId,
      actor: principal.subject,
      input,
      output
    });

    const presentSources = sourceManifest.filter((item) => item.present);
    await auditLog({
      workspaceId: principal.workspaceId,
      organisationId: principal.organisationId,
      action: 'proposal.generate',
      actor: principal.subject,
      outcome: 'succeeded',
      proposalId: record.id,
      metadata: { sourceCount: presentSources.length, version: 1 }
    });

    return NextResponse.json(
      { proposal: record },
      {
        status: 201,
        headers: {
          'X-RateLimit-Remaining': String(rateLimit.remaining),
          'X-Content-Type-Options': 'nosniff'
        }
      }
    );
  } catch (error) {
    await auditLog({
      workspaceId: principal.workspaceId,
      organisationId: principal.organisationId,
      action: 'proposal.generate',
      actor: principal.subject,
      outcome: 'failed'
    });
    const safeError = toSafeError(error);
    return NextResponse.json({ error: safeError.message }, { status: 400 });
  }
}
