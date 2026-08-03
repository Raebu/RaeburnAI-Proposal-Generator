# Production readiness audit — RaeburnAI Proposal Generator

Date: 2026-08-03  
Branch: `audit/raeburnai-proposal-generator-production-readiness-2026-08-03`

## Scope and product

This is a Next.js consultant-facing proposal drafting module. It validates structured client context, calls an OpenAI-compatible provider when configured, and otherwise returns an explicitly documented deterministic draft. It has no accounts, persistence, workspace isolation, or verified deployment.

## Baseline evidence

Before remediation, `npm install --ignore-scripts` completed without a lockfile; `npm run lint` and `npm run typecheck` passed; `npm run test` failed because Vitest could not resolve the `~` TypeScript alias; `npm run format:check` failed in seven tracked files; and the CI hardening workflow was restricted to a historical branch and referenced missing `db:migrate` and `security:secrets` scripts. Dependency audit reported high/critical advisories in the Next/PostCSS and test-tool dependency graph.

## Changes on this branch

- Added a committed npm lockfile and changed CI to use `npm ci`.
- Added Vitest path alias resolution and a coverage command.
- Upgraded Next.js within the supported major line, React-compatible tooling, Playwright, PostCSS and Vitest; pinned the vulnerable transitive glob resolution.
- Made the documented rate-limit environment variable effective while retaining a safe default.
- Removed the stale hardening-branch condition and replaced nonexistent CI scripts with checks that exist in this repository.
- Added formatting exclusions for generated evidence directories and normalized tracked formatting.

## Verification evidence

| Check                          | Result                                                                                |
| ------------------------------ | ------------------------------------------------------------------------------------- |
| `npm ci --no-audit --no-fund`  | Passed locally                                                                        |
| `npm run lint`                 | Passed, zero warnings                                                                 |
| `npm run typecheck`            | Passed                                                                                |
| `npm run test`                 | Passed, 7 tests                                                                       |
| `npm run test:coverage`        | Passed, 61.11% statements / 64.70% lines                                              |
| `npm run format:check`         | Passed                                                                                |
| `npm run build`                | Passed, 4 application routes                                                          |
| `npm audit --audit-level=high` | Blocked: remaining Next/PostCSS advisories require a major framework/config migration |
| E2E / preview deployment       | Blocked: browser/deployment credentials and environment are not available             |

## Findings and residual risk

The repository is materially more reproducible and testable, but it is not production-ready. The remaining high-risk items are: unresolved framework dependency advisories; in-memory rate limiting that is not shared across instances; no authentication, authorization, tenant isolation or proposal persistence; provider timeout/retry and usage controls are not verified; and no staging/preview deployment or rollback drill has been evidenced. The deterministic fallback is clearly labelled in documentation, but must remain visibly distinct from provider-backed output in any commercial workflow.

Initial score: 43/100  
Current score: 67/100  
Status: Verification Pending / Blocked
