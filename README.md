# RaeburnAI Proposal Generator

[![CI](https://github.com/Raebu/RaeburnAI-Proposal-Generator/actions/workflows/ci.yml/badge.svg)](https://github.com/Raebu/RaeburnAI-Proposal-Generator/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-production--candidate-orange.svg)](docs/production.md)

RaeburnAI Proposal Generator converts reviewed client context into structured consulting proposal drafts, roadmaps, pricing options, ROI assumptions, timelines, risks and executive presentation outlines.

Generated content is advisory draft material. It is persisted as `PENDING_APPROVAL` and cannot become approved client-facing work without an explicit authenticated human approval operation.

## Positioning

The service is designed for consultants and commercial teams that need repeatable proposal development without allowing AI output to become an automatic quotation, guarantee, legal commitment or client communication.

## Implemented features

- Strict bounded client-context validation.
- Deterministic local proposal mode for development, demos and regression testing.
- OpenAI-compatible generation mode with bounded timeout and retry policy.
- Runtime validation of all generated proposal JSON.
- Pricing, ROI, roadmap, timeline and risk generation.
- PostgreSQL persistence for proposal input, output, status and audit history.
- Workspace-scoped API-key authentication with constant-time comparison.
- Explicit proposal retrieval, approval and rejection APIs.
- Transactional one-time approval/rejection transitions.
- Redis-backed distributed rate limits that fail closed in production.
- Dependency-free liveness and PostgreSQL/Redis readiness endpoints.
- Safe generic errors and structured operational audit logs.
- Versioned SQL migrations and a one-shot migration container.
- Non-root standalone Next.js image and least-privilege Docker Compose profile.
- Unit, coverage and Playwright end-to-end tests.
- CI, CodeQL, dependency review, npm audit, tracked-secret and image scanning gates.

## Architecture

```text
Consultant UI / API client
          |
          v
Authenticated Next.js API
  |        |         |
  |        |         +--> Redis rate-limit backend
  |        +------------> PostgreSQL proposals / approvals / audit
  +---------------------> deterministic or reviewed AI provider

Proposal lifecycle:
GENERATE -> PENDING_APPROVAL -> APPROVED or REJECTED
```

Repository layout:

```text
src/app/api/health                 liveness
src/app/api/ready                  database/Redis readiness
src/app/api/proposals              generate and persist
src/app/api/proposals/[id]         retrieve workspace proposal
src/app/api/proposals/[id]/approve explicit approval
src/app/api/proposals/[id]/reject  explicit rejection
src/lib/ai                         generation providers and prompt
src/lib/persistence                PostgreSQL transactions/repository
src/lib/proposals                  input/output/approval schemas and calculators
src/lib/security                   auth, environment, rate limiting and safe errors
migrations                         versioned PostgreSQL schema
scripts                            migrations and tracked-secret checks
examples                           synthetic demo input
docs                               production and screenshot guidance
```

## Quick start

Requirements:

- Node.js 20.15.x and npm 10.7+; or
- Docker with Compose v2.

```bash
cp .env.example .env.local
npm install
npm run db:migrate
npm run dev
```

A committed reviewed `package-lock.json` is still required before production. Until it is present, clean builds are not fully reproducible.

Docker:

```bash
cp .env.example .env
docker compose config --quiet
docker compose up --build --wait
curl http://127.0.0.1:3000/api/health
curl http://127.0.0.1:3000/api/ready
```

PostgreSQL and Redis stay private. The migration service completes before the application starts.

## Environment variables

See [`.env.example`](.env.example).

| Variable | Purpose |
|---|---|
| `APP_BASE_URL` | Public application URL. Production requires HTTPS. |
| `PROPOSAL_WORKSPACE_ID` | Current authenticated workspace identifier. |
| `PROPOSAL_API_KEY` | Server/API credential, at least 32 random characters in production. |
| `TRUST_PROXY_HEADERS` | Enable only behind an ingress that replaces forwarding headers. |
| `DATABASE_URL` | PostgreSQL connection string. |
| `DATABASE_SSL` | Enables certificate-validated PostgreSQL TLS. |
| `REDIS_URL` | Distributed rate-limit backend. |
| `GENERATION_MODE` | `deterministic` or `openai`. |
| `OPENAI_API_KEY` | Required only for `GENERATION_MODE=openai`. |
| `OPENAI_TIMEOUT_MS` | Bounded provider timeout. |
| `OPENAI_MAX_RETRIES` | Bounded provider retries. |
| `RATE_LIMIT_REQUESTS_PER_MINUTE` | Workspace/caller generation limit. |
| `HUMAN_APPROVAL_REQUIRED` | Must remain `true` in production. |

Production startup fails closed without HTTPS, PostgreSQL, Redis, a strong API key, trusted-proxy policy, human approval or a configured generation provider.

## API usage

Use only synthetic data in development. Example input is in [`examples/demo-client.json`](examples/demo-client.json).

Generate and persist a proposal draft:

```bash
curl -X POST http://127.0.0.1:3000/api/proposals \
  -H 'content-type: application/json' \
  -H 'x-api-key: REPLACE_WITH_API_KEY' \
  -H 'x-actor: consultant@example.com' \
  --data @examples/demo-client.json
```

The response contains a proposal UUID and `PENDING_APPROVAL` status.

Retrieve it:

```bash
curl http://127.0.0.1:3000/api/proposals/PROPOSAL_UUID \
  -H 'x-api-key: REPLACE_WITH_API_KEY' \
  -H 'x-actor: consultant@example.com'
```

Approve after reviewing pricing, assumptions, scope and legal/commercial wording:

```bash
curl -X POST http://127.0.0.1:3000/api/proposals/PROPOSAL_UUID/approve \
  -H 'content-type: application/json' \
  -H 'x-api-key: REPLACE_WITH_API_KEY' \
  -H 'x-actor: reviewer@example.com' \
  -d '{"reason":"Scope, assumptions and pricing reviewed against the discovery record."}'
```

The same proposal cannot be approved or rejected twice. A later amendment/version workflow remains a roadmap item.

## Commands

```bash
npm install
npm run db:migrate
npm run format:check
npm run lint
npm run typecheck
npm run test:coverage
npm run build
npm run security:secrets
npm audit --audit-level=high
npm run test:e2e
docker build --target runner -t raeburnai-proposal-generator .
```

CI generates a temporary script-disabled lockfile so application checks can run, then deliberately fails the final gate until a reviewed `package-lock.json` is committed.

## Security model

- No anonymous production proposal generation.
- API-key comparison uses constant-time equality.
- Caller identity and workspace are required for every proposal operation.
- Forwarded IPs are ignored unless proxy trust is explicitly enabled.
- Production limits use Redis and fail closed if unavailable.
- Input and generated output are schema-validated and bounded.
- Internal exceptions and provider bodies are not returned to clients.
- Proposal generation and approval are durably audited.
- Approval is transactional and limited to the pending state.
- Containers run non-root with a read-only application filesystem, dropped capabilities and no privilege escalation.
- PostgreSQL and Redis are not published to the host in Compose.
- Secrets must use a platform secret manager and are checked for high-confidence committed patterns.

The current API-key workspace model is an initial production boundary, not enterprise SSO/RBAC. Multi-user organisations, per-role permissions, MFA and OIDC/SAML remain P0 commercial blockers.

## Deployment

See [`docs/production.md`](docs/production.md). The required release order is:

1. clean locked install and green CI;
2. immutable image build and vulnerability evidence;
3. database backup;
4. one-shot migration;
5. application deployment;
6. liveness/readiness and authenticated E2E smoke test;
7. monitoring and rollback readiness.

A green build alone does not establish enterprise production readiness. Backup restoration, load/accessibility/security testing, data-retention controls and privacy/legal review require separate evidence.

## Screenshots

UI screenshot capture and redaction requirements are documented in [`docs/screenshots.md`](docs/screenshots.md). No fabricated customer evidence should be included.

## RaeburnAI ecosystem

Proposal Generator consumes approved discovery and meeting context and produces reviewed proposal artifacts for CRM, Meeting Intelligence, Executive Briefing and RaeburnAI Chain. Modules should integrate through versioned APIs and separately scoped credentials rather than shared databases or copied secrets.

## Remaining blockers

- Generate, review and commit `package-lock.json`, then use `npm ci` everywhere.
- Replace single-workspace API-key auth with organisations, users, RBAC, MFA and SSO.
- Add proposal amendment/version history and immutable approved snapshots.
- Add PDF, DOCX and PPTX export with snapshot/security tests.
- Add retention, deletion, export, encryption and legal-hold controls for client material.
- Add CRM integration through scoped APIs.
- Demonstrate backup restoration, rollback, provider failure/load testing and penetration testing.
- Complete privacy, DPA, subprocessor, accessibility and commercial/legal review.

See [ROADMAP.md](ROADMAP.md) and [CHANGELOG.md](CHANGELOG.md).

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md). Changes must preserve strict validation, authenticated workspace isolation, approval-first commercial use and auditable sensitive actions.

## Licence

Apache-2.0. See [LICENSE](LICENSE).
