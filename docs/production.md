# Production Deployment & Operations — Cloudflare Workers

Cloudflare Workers is the primary production target. Next.js runs through
`@opennextjs/cloudflare`; Docker remains a secondary local or controlled single-instance option.

## Production topology

```text
proposal.theraeburngroup.com
  -> Cloudflare DNS and managed TLS
  -> Cloudflare Access (Raeburn-controlled policy)
  -> Cloudflare Worker / OpenNext / Next.js
  -> OpenAI API
```

The service is stateless. Client context and generated proposals exist only during the request and
in the consultant's browser response; the application has no database, object-store, KV, or R2
proposal persistence. Financial figures remain reconciled by the deterministic calculators and all
output remains `DRAFT_REQUIRES_HUMAN_REVIEW`.

## Release verification gate

Run from a clean checkout of the intended release SHA:

```bash
npm ci
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run test:coverage
npm run build
npm run cf-typegen
npm run cf:build
npx wrangler deploy --dry-run --outdir .wrangler-dry-run
npm run preview
```

Run Playwright against the workerd preview in a second shell:

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:8787 PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e
```

The standard Next.js build is retained for Docker compatibility. `next dev` is not evidence of
Workers compatibility.

## Runtime configuration and secrets

Non-secret settings are defined in `wrangler.jsonc`. Set the OpenAI credential interactively in
Cloudflare; never put its value in source, `.dev.vars`, `wrangler.jsonc`, CI logs, fixtures, or a
client-visible `NEXT_PUBLIC_*` variable:

```bash
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put PROPOSAL_API_KEY
```

Verify only the secret name is present:

```bash
npx wrangler secret list
```

`OPENAI_MODEL`, `RATE_LIMIT_REQUESTS_PER_MINUTE`, `TRUST_PROXY_HEADERS`, and
`TRUST_CLOUDFLARE_ACCESS` are non-secret runtime settings. Keep `TRUST_PROXY_HEADERS=false` on
Workers. Set `TRUST_CLOUDFLARE_ACCESS=true` only after Access covers the custom domain and every
alternate Worker route is disabled. The generated `cloudflare-env.d.ts` describes bindings but is
excluded from application TypeScript compilation because Next.js accesses environment variables
through `process.env`.

## Cloudflare configuration checklist

The repository cannot provision or attest account-level controls. The deployment owner must retain
evidence for every unchecked item before commercial use:

- [ ] Confirm the Cloudflare account owns `theraeburngroup.com` and the Worker custom domain creates
      the proxied DNS record for `proposal.theraeburngroup.com`.
- [ ] Confirm Universal SSL is active, minimum TLS meets Raeburn policy, HTTP redirects to HTTPS,
      and the full certificate chain validates.
- [ ] Protect the Worker (all traffic, including preview/`workers.dev` routes) with a
      Raeburn-controlled Cloudflare Access allow policy; demonstrate unauthenticated denial and
      authorised access. Do not create duplicate application authentication.
- [ ] Disable or protect alternate routes so the custom hostname cannot be bypassed.
- [ ] Create a Cloudflare WAF rate-limiting rule for `POST /api/proposals`, keyed by the appropriate
      Access identity or Cloudflare client characteristic. The per-isolate application limiter is
      defence in depth and is not an authoritative distributed control.
- [ ] Configure alerts for Worker errors/exceptions, elevated 5xx/429 rates, CPU or memory limit
      failures, and OpenAI latency/error degradation. Retain screenshots or exported configuration.
- [ ] Confirm Workers Logs retention and access meet Raeburn policy. Logs must not contain request
      bodies, client context, proposal/model content, credentials, or raw provider exceptions.
- [ ] Record approval of the OpenAI account's retention, training, region, and access controls before
      processing confidential data.

Cloudflare overwrites `CF-Connecting-IP` at its edge; the application pseudonymises that value for
audit events. It ignores `X-Forwarded-For` on Workers. Never enable `TRUST_PROXY_HEADERS` there.

## Build, preview, and deploy

Authenticate Wrangler using a least-privilege interactive login or CI API token, then confirm the
intended account:

```bash
npx wrangler whoami
npm run cf:build
npx wrangler deploy --dry-run --outdir .wrangler-dry-run
npm run deploy
```

The deployment command creates/updates the Worker and the declared custom domain. It does not create
the required Access policy, WAF rate-limit rule, alert policies, or OpenAI secret.

## Post-deployment acceptance

From the production network and through Cloudflare Access:

- Record the release Git SHA, package version, Wrangler version, deployed Worker version, and bundle
  gzip size.
- Validate DNS, TLS chain, HTTP-to-HTTPS redirect, Access denial/allow, and absence of bypass routes.
- Verify `GET /api/health` and `GET /api/readiness` report the expected service mode without
  revealing a secret.
- Generate a synthetic non-confidential proposal with the approved OpenAI credential and confirm
  `generationMode: provider-generated`, schema `1.0`, deterministic pricing/ROI/payback, and human
  review status.
- In a controlled preview/environment on the production network, verify invalid-key fallback,
  malformed-model-output fallback, and the 25-second provider timeout. Do not replace the approved
  production secret merely to test failure behavior.
- Verify the 1MB application payload limit and the Cloudflare edge rate-limit rule.
- Inspect browser storage, response headers, client bundles, clipboard, JSON download, print/PDF,
  and mobile layout. Confirm no secret or confidential proposal content is persisted.
- Inspect sampled logs and alerts using synthetic markers; confirm client content and provider
  exception detail are absent.

Do not claim production acceptance from local workerd results alone.

## Workers Free-plan assessment

Wrangler's dry run is authoritative for compressed bundle size. Workers Free currently permits a
3 MB gzip Worker, 128 MB per isolate, 50 subrequests per invocation, 100,000 requests/day, and 10 ms
CPU per HTTP request. The proposal path makes one OpenAI subrequest and buffers at most the enforced
1MB application payload. Waiting for OpenAI does not count as CPU time.

The 10 ms Free CPU allowance is the viability risk: Next.js server rendering, Zod parsing, prompt
construction, schema validation, and deterministic calculations must be measured in deployed
Workers metrics under representative load. Local elapsed time is not equivalent to Cloudflare CPU
time. If production p95 CPU exceeds the Free allowance or generates `exceededCpu`, the smallest
viable change is upgrading to Workers Paid; no product rewrite or Redis service is required.

## Docker secondary deployment

Docker remains available through `docker compose up --build`. It supports only one application
instance behind a trusted TLS proxy that overwrites `X-Forwarded-For`; set
`TRUST_PROXY_HEADERS=true` only in that topology. Docker deployment does not satisfy the primary
Cloudflare production checklist.
