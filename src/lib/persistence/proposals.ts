import { randomUUID } from 'node:crypto';
import type { PoolClient } from 'pg';
import { queryOne, withTransaction } from './database';
import type { ProposalInput, ProposalOutput } from '~/lib/types/proposal';

export type ProposalStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

export type PersistedProposal = {
  id: string;
  workspaceId: string;
  status: ProposalStatus;
  input: ProposalInput;
  output: ProposalOutput;
  generatedBy: string;
  approvedBy: string | null;
  approvalReason: string | null;
  createdAt: string;
  updatedAt: string;
};

type ProposalRow = {
  id: string;
  workspace_id: string;
  status: ProposalStatus;
  input_json: ProposalInput;
  output_json: ProposalOutput;
  generated_by: string;
  approved_by: string | null;
  approval_reason: string | null;
  created_at: Date;
  updated_at: Date;
};

function mapProposal(row: ProposalRow): PersistedProposal {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    status: row.status,
    input: row.input_json,
    output: row.output_json,
    generatedBy: row.generated_by,
    approvedBy: row.approved_by,
    approvalReason: row.approval_reason,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

async function insertAudit(
  client: PoolClient,
  input: {
    workspaceId: string;
    proposalId: string;
    action: string;
    actor: string;
    metadata?: Record<string, string | number | boolean | null>;
  },
): Promise<void> {
  await client.query(
    `INSERT INTO proposal_audit_events
      (id, workspace_id, proposal_id, action, actor, metadata_json)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
    [randomUUID(), input.workspaceId, input.proposalId, input.action, input.actor, JSON.stringify(input.metadata ?? {})],
  );
}

export async function createProposal(input: {
  workspaceId: string;
  actor: string;
  proposalInput: ProposalInput;
  proposalOutput: ProposalOutput;
}): Promise<PersistedProposal> {
  return withTransaction(async (client) => {
    const id = randomUUID();
    const result = await client.query<ProposalRow>(
      `INSERT INTO proposals
        (id, workspace_id, status, input_json, output_json, generated_by)
       VALUES ($1, $2, 'PENDING_APPROVAL', $3::jsonb, $4::jsonb, $5)
       RETURNING *`,
      [id, input.workspaceId, JSON.stringify(input.proposalInput), JSON.stringify(input.proposalOutput), input.actor],
    );
    await insertAudit(client, {
      workspaceId: input.workspaceId,
      proposalId: id,
      action: 'proposal.generated',
      actor: input.actor,
      metadata: { status: 'PENDING_APPROVAL' },
    });
    return mapProposal(result.rows[0]);
  });
}

export async function getProposal(workspaceId: string, proposalId: string): Promise<PersistedProposal | null> {
  const row = await queryOne<ProposalRow>(
    `SELECT * FROM proposals WHERE id = $1 AND workspace_id = $2`,
    [proposalId, workspaceId],
  );
  return row ? mapProposal(row) : null;
}

export async function updateApproval(input: {
  workspaceId: string;
  proposalId: string;
  actor: string;
  status: Exclude<ProposalStatus, 'PENDING_APPROVAL'>;
  reason: string;
}): Promise<PersistedProposal | null | 'conflict'> {
  return withTransaction(async (client) => {
    const existing = await client.query<ProposalRow>(
      `SELECT * FROM proposals
       WHERE id = $1 AND workspace_id = $2
       FOR UPDATE`,
      [input.proposalId, input.workspaceId],
    );
    const row = existing.rows[0];
    if (!row) return null;
    if (row.status !== 'PENDING_APPROVAL') return 'conflict';

    const result = await client.query<ProposalRow>(
      `UPDATE proposals
       SET status = $1, approved_by = $2, approval_reason = $3, updated_at = NOW()
       WHERE id = $4 AND workspace_id = $5
       RETURNING *`,
      [input.status, input.actor, input.reason, input.proposalId, input.workspaceId],
    );
    await insertAudit(client, {
      workspaceId: input.workspaceId,
      proposalId: input.proposalId,
      action: input.status === 'APPROVED' ? 'proposal.approved' : 'proposal.rejected',
      actor: input.actor,
      metadata: { reason: input.reason },
    });
    return mapProposal(result.rows[0]);
  });
}
