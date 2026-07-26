BEGIN;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PENDING_APPROVAL', 'APPROVED', 'REJECTED')),
  input_json JSONB NOT NULL,
  output_json JSONB NOT NULL,
  generated_by TEXT NOT NULL,
  approved_by TEXT,
  approval_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS proposals_workspace_created_idx
  ON proposals (workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS proposals_workspace_status_idx
  ON proposals (workspace_id, status);

CREATE TABLE IF NOT EXISTS proposal_audit_events (
  id UUID PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  actor TEXT NOT NULL,
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS proposal_audit_workspace_created_idx
  ON proposal_audit_events (workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS proposal_audit_proposal_created_idx
  ON proposal_audit_events (proposal_id, created_at);

INSERT INTO schema_migrations (version)
VALUES ('001_initial_proposal_persistence')
ON CONFLICT (version) DO NOTHING;

COMMIT;
