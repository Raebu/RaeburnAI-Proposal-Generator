import type { ProposalRecord } from '~/lib/proposals/store';

export type CrmPushResult = { externalId?: string; status: number };

export async function pushApprovedProposal(record: ProposalRecord): Promise<CrmPushResult> {
  const url = process.env.CRM_WEBHOOK_URL;
  const token = process.env.CRM_WEBHOOK_TOKEN;
  if (!url || !token) throw new Error('CRM adapter is not configured');
  if (record.status !== 'approved') throw new Error('Only approved proposals can be sent to CRM');

  const latest = record.versions.at(-1);
  if (!latest) throw new Error('Proposal has no versions');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
        'idempotency-key': `proposal-${record.id}-v${latest.version}`
      },
      body: JSON.stringify({
        proposalId: record.id,
        workspaceId: record.workspaceId,
        organisationId: record.organisationId,
        clientName: record.clientName,
        version: latest.version,
        approvedAt: record.review?.reviewedAt,
        approvedBy: record.review?.reviewedBy,
        executiveSummary: latest.output.executiveSummary,
        pricing: latest.output.pricing,
        roiEstimate: latest.output.roiEstimate
      }),
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`CRM adapter returned ${response.status}`);
    let externalId: string | undefined;
    try {
      const body = (await response.json()) as { id?: unknown; externalId?: unknown };
      externalId = String(body.externalId || body.id || '') || undefined;
    } catch {
      // A successful empty response is valid.
    }
    return { externalId, status: response.status };
  } finally {
    clearTimeout(timeout);
  }
}
