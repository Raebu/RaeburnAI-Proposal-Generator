import { appendAudit } from '~/lib/proposals/store';

export type AuditEvent = {
  workspaceId: string;
  organisationId: string;
  action: string;
  actor: string;
  outcome: 'allowed' | 'blocked' | 'failed' | 'succeeded';
  proposalId?: string;
  metadata?: Record<string, string | number | boolean>;
};

export async function auditLog(event: AuditEvent) {
  const safe = {
    ...event,
    metadata: event.metadata
      ? Object.fromEntries(
          Object.entries(event.metadata).filter(([key]) => !/secret|token|password|credential|content|prompt/i.test(key))
        )
      : undefined
  };
  await appendAudit(safe);
  console.warn(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      service: 'raeburnai-proposal-generator',
      workspaceId: safe.workspaceId,
      action: safe.action,
      outcome: safe.outcome,
      proposalId: safe.proposalId
    })
  );
}
