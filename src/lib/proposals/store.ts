import { randomUUID } from 'node:crypto';
import { mkdir, readFile, readdir, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { ProposalInput, ProposalOutput } from '~/lib/types/proposal';

export type ProposalStatus = 'draft' | 'in_review' | 'approved' | 'rejected';

export type ProposalVersion = {
  version: number;
  createdAt: string;
  createdBy: string;
  input: ProposalInput;
  output: ProposalOutput;
  note?: string;
};

export type ProposalRecord = {
  id: string;
  workspaceId: string;
  organisationId: string;
  clientName: string;
  status: ProposalStatus;
  createdAt: string;
  updatedAt: string;
  versions: ProposalVersion[];
  review?: {
    reviewedAt: string;
    reviewedBy: string;
    decision: 'approved' | 'rejected';
    note?: string;
  };
};

export type PersistedAuditEvent = {
  id: string;
  timestamp: string;
  workspaceId: string;
  organisationId: string;
  actor: string;
  action: string;
  outcome: 'allowed' | 'blocked' | 'failed' | 'succeeded';
  proposalId?: string;
  metadata?: Record<string, string | number | boolean>;
};

const dataDir = () => process.env.DATA_DIR || path.join(process.cwd(), '.data');
const workspaceDir = (workspaceId: string) => path.join(dataDir(), 'workspaces', safeSegment(workspaceId));
const proposalDir = (workspaceId: string) => path.join(workspaceDir(workspaceId), 'proposals');
const auditDir = (workspaceId: string) => path.join(workspaceDir(workspaceId), 'audit');

function safeSegment(value: string) {
  if (!/^[A-Za-z0-9._-]{1,128}$/.test(value)) throw new Error('Invalid storage identifier');
  return value;
}

async function atomicJsonWrite(file: string, value: unknown) {
  await mkdir(path.dirname(file), { recursive: true, mode: 0o700 });
  const temporary = `${file}.${randomUUID()}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
  await rename(temporary, file);
}

export async function createProposal(args: {
  workspaceId: string;
  organisationId: string;
  actor: string;
  input: ProposalInput;
  output: ProposalOutput;
}) {
  const now = new Date().toISOString();
  const record: ProposalRecord = {
    id: randomUUID(),
    workspaceId: args.workspaceId,
    organisationId: args.organisationId,
    clientName: args.input.clientName,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    versions: [{ version: 1, createdAt: now, createdBy: args.actor, input: args.input, output: args.output }]
  };
  await saveProposal(record);
  return record;
}

export async function getProposal(workspaceId: string, id: string) {
  safeSegment(id);
  try {
    const raw = await readFile(path.join(proposalDir(workspaceId), `${id}.json`), 'utf8');
    return JSON.parse(raw) as ProposalRecord;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
}

export async function listProposals(workspaceId: string) {
  try {
    const names = await readdir(proposalDir(workspaceId));
    const records = await Promise.all(
      names.filter((name) => name.endsWith('.json')).map((name) => getProposal(workspaceId, name.slice(0, -5)))
    );
    return records.filter((record): record is ProposalRecord => Boolean(record)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
}

export async function saveProposal(record: ProposalRecord) {
  await atomicJsonWrite(path.join(proposalDir(record.workspaceId), `${safeSegment(record.id)}.json`), record);
}

export async function amendProposal(record: ProposalRecord, args: { actor: string; input: ProposalInput; output: ProposalOutput; note?: string }) {
  if (record.status === 'approved') throw new Error('Approved proposals cannot be amended; create a new review version first');
  const now = new Date().toISOString();
  record.versions.push({
    version: record.versions.length + 1,
    createdAt: now,
    createdBy: args.actor,
    input: args.input,
    output: args.output,
    note: args.note
  });
  record.clientName = args.input.clientName;
  record.status = 'draft';
  record.review = undefined;
  record.updatedAt = now;
  await saveProposal(record);
  return record;
}

export async function transitionProposal(record: ProposalRecord, args: { actor: string; action: 'submit' | 'approve' | 'reject'; note?: string }) {
  const now = new Date().toISOString();
  if (args.action === 'submit') {
    if (!['draft', 'rejected'].includes(record.status)) throw new Error('Only draft or rejected proposals can be submitted');
    record.status = 'in_review';
    record.review = undefined;
  } else {
    if (record.status !== 'in_review') throw new Error('Only proposals in review can be approved or rejected');
    record.status = args.action === 'approve' ? 'approved' : 'rejected';
    record.review = { reviewedAt: now, reviewedBy: args.actor, decision: args.action === 'approve' ? 'approved' : 'rejected', note: args.note };
  }
  record.updatedAt = now;
  await saveProposal(record);
  return record;
}

export async function appendAudit(event: Omit<PersistedAuditEvent, 'id' | 'timestamp'>) {
  const full: PersistedAuditEvent = { id: randomUUID(), timestamp: new Date().toISOString(), ...event };
  const file = path.join(auditDir(event.workspaceId), `${full.timestamp.replace(/[:.]/g, '-')}-${full.id}.json`);
  await atomicJsonWrite(file, full);
  return full;
}

export async function listAudit(workspaceId: string) {
  try {
    const names = (await readdir(auditDir(workspaceId))).filter((name) => name.endsWith('.json')).sort();
    return Promise.all(names.map(async (name) => JSON.parse(await readFile(path.join(auditDir(workspaceId), name), 'utf8')) as PersistedAuditEvent));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
}

export async function deleteWorkspaceData(workspaceId: string) {
  const { rm } = await import('node:fs/promises');
  await rm(workspaceDir(workspaceId), { recursive: true, force: true });
}
