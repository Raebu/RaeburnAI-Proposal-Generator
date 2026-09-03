import { NextResponse } from 'next/server';
import { pushApprovedProposal } from '~/lib/crm/adapter';
import { getProposal } from '~/lib/proposals/store';
import { authenticate, requireRole } from '~/lib/security/auth';
import { auditLog } from '~/lib/security/audit';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const principal = authenticate(request);
  if (!principal) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!requireRole(principal, 'editor')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await context.params;
  const proposal = await getProposal(principal.workspaceId, id);
  if (!proposal) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (proposal.status !== 'approved') {
    await auditLog({ workspaceId: principal.workspaceId, organisationId: principal.organisationId, actor: principal.subject, action: 'proposal.crm_push', outcome: 'blocked', proposalId: id });
    return NextResponse.json({ error: 'Proposal must be approved before CRM push.' }, { status: 409 });
  }

  try {
    const result = await pushApprovedProposal(proposal);
    await auditLog({
      workspaceId: principal.workspaceId,
      organisationId: principal.organisationId,
      actor: principal.subject,
      action: 'proposal.crm_push',
      outcome: 'succeeded',
      proposalId: id,
      metadata: { status: result.status, externalId: result.externalId || 'not-returned' }
    });
    return NextResponse.json(result);
  } catch (error) {
    await auditLog({ workspaceId: principal.workspaceId, organisationId: principal.organisationId, actor: principal.subject, action: 'proposal.crm_push', outcome: 'failed', proposalId: id });
    return NextResponse.json({ error: error instanceof Error ? error.message : 'CRM push failed' }, { status: 502 });
  }
}
