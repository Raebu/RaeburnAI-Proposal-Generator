# Production deployment

This guide describes the minimum release path for the implemented proposal persistence and approval foundation. It does not replace organisation-specific security, privacy, financial or legal review.

## Local Compose

```bash
cp .env.example .env
docker compose config --quiet
docker compose up --build --wait
curl http://127.0.0.1:3000/api/health
curl http://127.0.0.1:3000/api/ready
```

The stack keeps PostgreSQL and Redis private, runs the versioned migration as a one-shot service, then starts the non-root application.

## Production configuration

- Set `NODE_ENV=production`.
- Use HTTPS for `APP_BASE_URL`.
- Generate a unique `PROPOSAL_API_KEY` of at least 32 random characters in a secret manager.
- Set a stable `PROPOSAL_WORKSPACE_ID` for the initial workspace boundary.
- Use managed PostgreSQL and Redis with TLS/private networking.
- Set `TRUST_PROXY_HEADERS=true` only behind an ingress that replaces forwarding headers.
- Keep `HUMAN_APPROVAL_REQUIRED=true`.
- Use `GENERATION_MODE=openai` only with an approved provider key, data policy and spend limits; otherwise use deterministic mode.
- Never place provider or database credentials in browser-exposed environment variables.

Production configuration fails closed when any core boundary is unsafe or incomplete.

## Release sequence

1. Commit and review `package-lock.json`; the branch-restricted verification workflow may generate the first lockfile with package scripts disabled.
2. Run clean `npm ci` and require green formatting, lint, typing, coverage, build, E2E, audit, CodeQL, dependency and image gates.
3. Build an immutable application image and retain vulnerability/SBOM evidence.
4. Back up PostgreSQL and verify that the backup is readable.
5. Run `npm run db:migrate` as a separately approved one-shot job.
6. Deploy the application image without schema mutation during compile/startup.
7. Verify `/api/health` and `/api/ready` through the production ingress.
8. Run authenticated smoke tests: generate, retrieve, approve and reject within a test workspace.
9. Monitor database, Redis, provider errors, 5xx/429 rates and proposal volume.
10. Roll back the application image when necessary. Database rollback requires explicit migration analysis.

## Suggested architecture

```text
TLS/WAF/rate-limited ingress
       |
       v
Next.js proposal service
   |              |
   v              v
PostgreSQL       Redis
   |
   +--> proposals / approvals / audit

Optional approved AI provider is called server-side only.
```

Separate development, staging and production databases, Redis instances, API keys and provider accounts. Other RaeburnAI modules should integrate through versioned APIs rather than shared databases.

## Backup and recovery

Before customer launch:

- automate encrypted PostgreSQL backups;
- enable point-in-time recovery where available;
- restore into an isolated environment and record evidence;
- define proposal/audit retention and deletion policies;
- document application rollback and credential rotation;
- agree recovery time and recovery point objectives.

A configured backup is not production evidence until restoration is demonstrated.

## Monitoring

Alert on:

- readiness failures;
- elevated 5xx and sustained 429 responses;
- PostgreSQL/Redis connection or timeout failures;
- proposal provider timeouts or invalid output;
- unusual generation or approval volume;
- repeated authentication failures;
- backup failures and unexpected storage growth.

## Release checklist

- [ ] Source-controlled lockfile and clean `npm ci` pass.
- [ ] Migrations apply successfully to a clean and upgraded staging database.
- [ ] Formatting, lint, typing, tests/coverage, build and E2E pass.
- [ ] npm audit, dependency review, CodeQL, secret and image scans pass.
- [ ] Production secrets and TLS/private networking are configured.
- [ ] Approval workflow is tested for authorised, unauthorised and repeated transitions.
- [ ] Backup restore and application rollback are demonstrated.
- [ ] Client data lifecycle and encryption controls are approved.
- [ ] Provider policy, spend limits and failure handling are approved.
- [ ] Privacy, DPA, subprocessors, accessibility and penetration testing are complete.
- [ ] A named service owner and rollback decision-maker are available.

## Remaining enterprise blockers

The current API-key workspace boundary is suitable for controlled service integration, not full enterprise identity. Organisation users, RBAC, MFA/SSO, amendments/version history, document exports, client-data lifecycle controls, CRM integration and external operational evidence remain explicit blockers.
