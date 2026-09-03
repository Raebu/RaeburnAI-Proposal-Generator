import { NextResponse } from 'next/server';
import { deleteWorkspaceData, listAudit, listProposals } from '~/lib/proposals/store';
import { authenticate, requireRole } from '~/lib/security/auth';
import { auditLog } from '~/lib/security/audit';

export async function GET(request: Request) {
  const principal = authenticate(request);
  if (!principal) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!requireRole(principal, 'owner')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const [proposals, audit] = await Promise.all([listProposals(principal.workspaceId), listAudit(principal.workspaceId)]);
  return NextResponse.json({ exportedAt: new Date().toISOString(), workspaceId: principal.workspaceId, proposals, audit });
}

export async function DELETE(request: Request) {
  const principal = authenticate(request);
  if (!principal) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!requireRole(principal, 'owner')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const confirmation = request.headers.get('x-confirm-delete');
  if (confirmation !== principal.workspaceId) {
    return NextResponse.json({ error: 'Set X-Confirm-Delete to the workspace ID.' }, { status: 400 });
  }
  await auditLog({ workspaceId: principal.workspaceId, organisationId: principal.organisationId, actor: principal.subject, action: 'workspace.delete', outcome: 'allowed' });
  await deleteWorkspaceData(principal.workspaceId);
  return new NextResponse(null, { status: 204 });
}
