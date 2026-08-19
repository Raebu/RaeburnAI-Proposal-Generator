# Production Deployment & Operations Guide — RaeburnAI Proposal Generator

This application runs as a Next.js standalone service on Node.js 20.

## Production Architecture & Operational Design

- **Stateless Engine**: The application processes incoming client context, synthesises proposal content via OpenAI (or deterministic fallback), validates output via Zod schemas, and returns the generated proposal directly to the consultant.
- **Client Data Protection**: Client context and discovery notes are processed strictly in-memory during the request lifecycle and are never persisted to disk or logged in plain text.
- **Financial Reconciliation**: AI-proposed financial figures are validated against deterministic calculators (`calculators.ts`). Stated pricing and ROI payback months are calculated deterministically to prevent commercial discrepancies.

## Release & Verification Gate

Run the standard production gate before deploying:

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run test:coverage
npm run format:check
npm run build
npx playwright test
docker build -t raeburnai-proposal-generator .
```

## Production Runtime Configuration

Inject secrets through the deployment platform or container environment; do not bake an
`.env.local` file into the image. `OPENAI_API_KEY` is required only for live AI generation.
Without it, the UI clearly labels output as a deterministic fallback draft.

```env
OPENAI_API_KEY=sk-proj-your-actual-api-key
OPENAI_MODEL=gpt-4.1-mini
RATE_LIMIT_REQUESTS_PER_MINUTE=20
```

## Docker Container Deployment

Build and launch via Docker Compose:

```bash
docker compose up --build -d
```

Verify health:

```bash
curl http://localhost:3000/api/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "raeburnai-proposal-generator",
  "timestamp": "2026-08-15T17:30:00.000Z",
  "version": "1.0.0-rc.1",
  "mode": "provider-backed",
  "checks": {
    "process": "alive",
    "application": "healthy",
    "aiProviderConfigured": true
  }
}
```

## Security & Operational Safeguards

1. **HTTPS Enforcement**: Ensure the reverse proxy (Nginx, Traefik, Cloudflare, or AWS ALB) terminates TLS and forwards original client IP in `X-Forwarded-For`.
2. **Rate Limiting / Intended Topology**: The initial supported deployment is a single application instance behind one trusted TLS-terminating reverse proxy. The proxy must overwrite (not append an untrusted client value to) `X-Forwarded-For`. In-memory rate limiting is not suitable for multiple replicas. Before load balancing or horizontal scaling, enforce distributed rate limits at Cloudflare (preferred when it is the edge) or use a Redis-backed limiter.
3. **Human Review**: All output carries status `DRAFT_REQUIRES_HUMAN_REVIEW`. Senior consultants must review proposals before client submission.

## Initial single-instance deployment checklist

The repository does not provision a domain, DNS, TLS, authentication gateway or monitoring.
Before handling client-confidential data, the deployment owner must complete and retain evidence
for every item:

- [ ] Point the approved domain and DNS record at the TLS-terminating edge/reverse proxy.
- [ ] Enforce HTTPS, install an approved certificate, redirect HTTP, and validate the full chain.
- [ ] Configure one trusted reverse proxy to overwrite `X-Forwarded-For` with the connecting client IP; reject or replace inbound client-supplied values rather than appending them.
- [ ] Place the application behind Raeburn Consulting Group SSO, VPN, or an equivalent access gateway and verify unauthenticated access is denied.
- [ ] Inject `OPENAI_API_KEY` at runtime from the approved secret manager; never add it to the image, repository, browser environment, or deployment manifest.
- [ ] Record approval of the OpenAI account's data-retention, model-training, region, and access controls before sending confidential client data.
- [ ] Run exactly one application replica and set explicit CPU and memory limits based on a representative proposal-generation load test.
- [ ] Configure an `on-failure` or platform-equivalent restart policy and demonstrate recovery from a terminated process.
- [ ] Configure the platform health probe against `GET /api/health` with suitable startup grace, interval, timeout, and failure thresholds.
- [ ] Send stdout/stderr operational logs to approved storage; verify that request bodies, proposal content, client identifiers, and secrets are absent.
- [ ] Alert on failed health probes, elevated 5xx and 429 rates, resource saturation, restarts, and AI-provider latency/error rates.
- [ ] From the production network, generate a synthetic non-confidential provider-backed proposal and verify outbound OpenAI connectivity and `generationMode: provider-generated`.
- [ ] In a controlled test environment using the production network path, delay or block the provider response and verify fallback occurs at the 25-second application timeout without secret or client-data leakage.
- [ ] Run backup/recovery checks only if persistence is later added; the current service stores no proposals.

Passing local Docker checks does not constitute verification of domain, HTTPS, DNS, external
monitoring or production AI connectivity.
