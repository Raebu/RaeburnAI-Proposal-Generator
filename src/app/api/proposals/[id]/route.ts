import { NextResponse } from 'next/server';
import { getProposal } from '~/lib/persistence/proposals';
import { proposalIdSchema } from '~/lib/proposals/approvalSchema';
import { authenticateRequest } from '~/lib/security/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, context: { params: { id: string } }) {
  const identity = authenticateRequest(request);
  if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsedId = proposalIdSchema.safeParse(context.params.id);
  if (!parsedId.success) return NextResponse.json({ error: 'Invalid proposal ID' }, { status: 400 });

  const proposal = await getProposal(identity.workspaceId, parsedId.data);
  if (!proposal) return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });

  return NextResponse.json({ proposal }, { headers: { 'Cache-Control': 'no-store' } });
}
