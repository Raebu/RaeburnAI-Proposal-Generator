import { createHash, timingSafeEqual } from 'node:crypto';

export type WorkspaceRole = 'owner' | 'editor' | 'reviewer' | 'viewer';

export type Principal = {
  workspaceId: string;
  organisationId: string;
  subject: string;
  role: WorkspaceRole;
};

type Credential = Principal & { tokenHash: string };

const roleRank: Record<WorkspaceRole, number> = {
  viewer: 1,
  reviewer: 2,
  editor: 3,
  owner: 4
};

function tokenDigest(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

function credentials(): Credential[] {
  const raw = process.env.WORKSPACE_CREDENTIALS_JSON;
  if (!raw) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('WORKSPACE_CREDENTIALS_JSON is invalid JSON');
  }
  if (!Array.isArray(parsed)) throw new Error('WORKSPACE_CREDENTIALS_JSON must be an array');

  return parsed.map((item) => {
    if (!item || typeof item !== 'object') throw new Error('Invalid workspace credential');
    const value = item as Record<string, unknown>;
    const role = value.role;
    if (!['owner', 'editor', 'reviewer', 'viewer'].includes(String(role))) {
      throw new Error('Invalid workspace role');
    }
    const tokenHash = String(value.tokenHash || '');
    if (!/^[a-f0-9]{64}$/i.test(tokenHash)) throw new Error('Workspace tokenHash must be SHA-256 hex');
    return {
      workspaceId: String(value.workspaceId || ''),
      organisationId: String(value.organisationId || ''),
      subject: String(value.subject || ''),
      role: role as WorkspaceRole,
      tokenHash: tokenHash.toLowerCase()
    };
  });
}

export function authenticate(request: Request): Principal | null {
  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) return null;
  const actual = Buffer.from(tokenDigest(token), 'hex');

  for (const credential of credentials()) {
    const expected = Buffer.from(credential.tokenHash, 'hex');
    if (expected.length === actual.length && timingSafeEqual(expected, actual)) {
      const { tokenHash: _tokenHash, ...principal } = credential;
      return principal;
    }
  }
  return null;
}

export function requireRole(principal: Principal, minimum: WorkspaceRole) {
  return roleRank[principal.role] >= roleRank[minimum];
}

export function authConfigured() {
  return credentials().length > 0;
}
