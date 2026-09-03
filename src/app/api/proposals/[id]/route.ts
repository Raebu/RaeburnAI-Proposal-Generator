import { NextResponse } from 'next/server';
import { generateProposal } from '~/lib/ai/generateProposal';
import { amendProposal, getProposal, transitionProposal } from '~/lib/proposals/store';
import { proposalInputSchema } from '~/lib/proposals/schema';
import { authenticate, requireRole } from '~/lib/security/auth';
import { auditLog } from '~/lib/security/audit';

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const principal = authenticate(request);
  if (!principal) return unauthorized();
  const { id } = await context.params;
  const proposal = await getProposal(principal.workspaceId, id);
  if (!proposal) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ proposal });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const principal = authenticate(request);
  if (!principal) return unauthorized();
  const { id } = await context.params;
  const proposal = await getProposal(principal.workspaceId, id);
  if (!proposal) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    const body = (await request.json()) as { action?: string; input?: unknown; note?: string };
    if (body.action === 'amend') {
      if (!requireRole(principal, 'editor')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      const input = proposalInputSchema.parse(body.input);
      const output = await generateProposal(input);
      const updated = await amendProposal(proposal, { actor: principal.subject, input, output, note: body.note });
      await auditLog({
        workspaceId: principal.workspaceId,
        organisationId: principal.organisationId,
        actor: principal.subject,
        action: 'proposal.amend',
        outcome: 'succeeded',
        proposalId: id,
        metadata: { version: updated.versions.length }
      });
      return NextResponse.json({ proposal: updated });
    }

    if (body.action === 'submit') {
      if (!requireRole(principal, 'editor')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      const updated = await transitionProposal(proposal, { actor: principal.subject, action: 'submit', note: body.note });
      await auditLog({ workspaceId: principal.workspaceId, organisationId: principal.organisationId, actor: principal.subject, action: 'proposal.submit', outcome: 'succeeded', proposalId: id });
      return NextResponse.json({ proposal: updated });
    }

    if (body.action === 'approve' || body.action === 'reject') {
      if (!requireRole(principal, 'reviewer')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      const updated = await transitionProposal(proposal, { actor: principal.subject, action: body.action, note: body.note });
      await auditLog({ workspaceId: principal.workspaceId, organisationId: principal.organisationId, actor: principal.subject, action: `proposal.${body.action}`, outcome: 'succeeded', proposalId: id });
      return NextResponse.json({ proposal: updated });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error) {
    await auditLog({ workspaceId: principal.workspaceId, organisationId: principal.organisationId, actor: principal.subject, action: 'proposal.change', outcome: 'failed', proposalId: id });
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to update proposal' }, { status: 400 });
  }
}
