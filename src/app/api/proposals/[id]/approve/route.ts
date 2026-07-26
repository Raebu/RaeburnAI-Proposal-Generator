import { NextResponse } from 'next/server';
import { updateApproval } from '~/lib/persistence/proposals';
import { approvalRequestSchema, proposalIdSchema } from '~/lib/proposals/approvalSchema';
import { authenticateRequest } from '~/lib/security/auth';

export async function POST(request: Request, context: { params: { id: string } }) {
  const identity = authenticateRequest(request);
  if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const proposalId = proposalIdSchema.safeParse(context.params.id);
  if (!proposalId.success) return NextResponse.json({ error: 'Invalid proposal ID' }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const approval = approvalRequestSchema.safeParse(body);
  if (!approval.success) {
    return NextResponse.json({ error: 'Invalid approval payload', details: approval.error.flatten() }, { status: 400 });
  }

  const proposal = await updateApproval({
    workspaceId: identity.workspaceId,
    proposalId: proposalId.data,
    actor: identity.actor,
    status: 'APPROVED',
    reason: approval.data.reason,
  });
  if (proposal === null) return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
  if (proposal === 'conflict') return NextResponse.json({ error: 'Proposal is no longer pending approval' }, { status: 409 });

  return NextResponse.json({ proposal }, { headers: { 'Cache-Control': 'no-store' } });
}
