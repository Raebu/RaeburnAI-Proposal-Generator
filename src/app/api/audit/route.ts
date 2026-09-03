import { NextResponse } from 'next/server';
import { listAudit } from '~/lib/proposals/store';
import { authenticate, requireRole } from '~/lib/security/auth';

export async function GET(request: Request) {
  const principal = authenticate(request);
  if (!principal) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!requireRole(principal, 'reviewer')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return NextResponse.json({ events: await listAudit(principal.workspaceId) });
}
