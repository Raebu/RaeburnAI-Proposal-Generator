import { NextResponse } from 'next/server';
import { exportDocx, exportPdf, exportPptx } from '~/lib/proposals/export';
import { getProposal } from '~/lib/proposals/store';
import { authenticate, requireRole } from '~/lib/security/auth';
import { auditLog } from '~/lib/security/audit';

const contentTypes = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
} as const;

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const principal = authenticate(request);
  if (!principal) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!requireRole(principal, 'viewer')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await context.params;
  const record = await getProposal(principal.workspaceId, id);
  if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (record.status !== 'approved') {
    await auditLog({ workspaceId: principal.workspaceId, organisationId: principal.organisationId, actor: principal.subject, action: 'proposal.export', outcome: 'blocked', proposalId: id });
    return NextResponse.json({ error: 'Proposal must be approved before export.' }, { status: 409 });
  }

  const format = new URL(request.url).searchParams.get('format');
  if (!format || !['pdf', 'docx', 'pptx'].includes(format)) {
    return NextResponse.json({ error: 'format must be pdf, docx or pptx' }, { status: 400 });
  }
  const typedFormat = format as keyof typeof contentTypes;
  const bytes = typedFormat === 'pdf' ? await exportPdf(record) : typedFormat === 'docx' ? await exportDocx(record) : await exportPptx(record);
  await auditLog({
    workspaceId: principal.workspaceId,
    organisationId: principal.organisationId,
    actor: principal.subject,
    action: 'proposal.export',
    outcome: 'succeeded',
    proposalId: id,
    metadata: { format: typedFormat, version: record.versions.length }
  });
  const filename = `proposal-${id}.${typedFormat}`;
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      'content-type': contentTypes[typedFormat],
      'content-disposition': `attachment; filename="${filename}"`,
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff'
    }
  });
}
