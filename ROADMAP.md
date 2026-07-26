# Roadmap

## Implemented production foundation

- Strict client-input and generated-output validation.
- Deterministic and bounded OpenAI-compatible generation modes.
- PostgreSQL proposal, approval and audit persistence.
- Workspace API authentication and one-time human approval/rejection.
- Redis-backed distributed rate limits.
- Versioned migrations and migration-first Docker Compose.
- Unit, coverage and authenticated approval E2E tests.
- CI, CodeQL, dependency review, audit, secret and image scanning gates.

## P0 — before enterprise customer deployment

- Generate, review and commit the npm lockfile; enforce `npm ci` everywhere.
- Add organisation/user tenancy, RBAC, MFA and OIDC/SAML SSO.
- Add proposal amendments, version history and immutable approved snapshots.
- Encrypt sensitive client material and implement retention, deletion, export and legal hold.
- Add automated PostgreSQL backups and demonstrate restoration/rollback.
- Add provider evaluation fixtures, timeout/outage/load tests and spend limits.
- Complete privacy, DPA, subprocessor, accessibility and independent security review.

## P1 — commercial workflow

- PDF and DOCX proposal exports with snapshot and injection testing.
- PPTX executive deck export.
- CRM integrations through scoped versioned APIs.
- Document upload, malware scanning, extraction and source citations.
- Team workspaces, comments, approval delegation and notifications.
- Organisation templates and analytics.

## Later

- Multi-model provider routing and quality/cost evaluation.
- Template marketplace with provenance and approval governance.
- Integration with Meeting Intelligence, Executive Briefing and RaeburnAI Chain.
