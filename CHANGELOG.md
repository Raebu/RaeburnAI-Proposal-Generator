# Changelog

All notable changes to this project are documented here.

## [Unreleased]

### Added

- PostgreSQL proposal, approval and structured audit persistence.
- Versioned SQL migration and explicit migration runner.
- Workspace-scoped API authentication with constant-time key comparison.
- Proposal retrieval, approval and rejection endpoints.
- Transactional one-time approval/rejection state transitions.
- Strict runtime validation for generated proposal output.
- Redis-backed distributed rate limiting with production fail-closed behaviour.
- PostgreSQL/Redis readiness endpoint.
- Unit, coverage and authenticated persistence/approval end-to-end tests.
- Tracked-secret scanning, immutable CI actions, dependency review, CodeQL and image scanning gates.
- Migration-first, non-root, least-privilege Docker Compose deployment.

### Changed

- Proposal generation now returns a durable `PENDING_APPROVAL` record rather than an untracked response.
- Deterministic fallback is an explicit generation mode rather than a silent production fallback.
- OpenAI-compatible calls have bounded timeout/retry policy and validated JSON output.
- Production configuration rejects HTTP, missing PostgreSQL/Redis, weak API keys, untrusted proxy policy or disabled approval.
- Audit logs no longer contain the raw client name; a hash is used for operational correlation.
- Internal errors and provider response bodies are not exposed to clients.
- Documentation now uses production-candidate status and lists all remaining external evidence.

### Security

- Anonymous production generation is blocked.
- Forwarded IP headers are ignored unless explicitly trusted.
- Rate-limit backend failure blocks production generation.
- Containers run non-root with read-only filesystem, dropped capabilities and no privilege escalation.

### Known blockers

- Generate, review and commit `package-lock.json`.
- Replace initial single-workspace API-key access with organisation users, RBAC, MFA and SSO.
- Add proposal amendment/version history and approved immutable snapshots.
- Add document exports, client-data lifecycle controls and CRM integration.
- Demonstrate backup restoration, rollback, load/accessibility/security and privacy/legal reviews.

## [0.1.0] - 2026-07-02

### Added

- Next.js proposal generator application.
- AI-backed proposal generation API with deterministic fallback.
- Pricing and ROI calculators.
- Health check endpoint.
- Input validation with Zod.
- Initial rate limiting and audit logging helpers.
- Dockerfile and Docker Compose setup.
- CI workflow with lint, typecheck, tests, build and Docker build.
- CodeQL workflow and Dependabot configuration.
- Unit, integration and E2E test scaffolding.
- Standard RaeburnAI documentation.
