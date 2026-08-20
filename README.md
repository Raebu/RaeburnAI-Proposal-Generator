# RaeburnAI Proposal Generator

![Status](https://img.shields.io/badge/status-release--candidate-blue) ![TypeScript](https://img.shields.io/badge/typescript-strict-blue) ![License](https://img.shields.io/badge/license-Apache--2.0-green)

## One-line positioning statement

Commercial AI proposal and solution engine for management and technology consultants.

## Short product description

RaeburnAI Proposal Generator is the commercial proposal engine used by **Raeburn Consulting Group** to transform client discovery notes, website context, annual report excerpts, and operational parameters into structured, executive-grade client proposals, technical roadmaps, commercial pricing options, deterministic ROI payback models, and 5-slide pitch presentation outlines.

The product enforces strict schema validation (Contract Version 1.0), prompt injection defence boundaries, and human-in-the-loop governance. AI model outputs are parsed and validated via Zod, with financial calculations reconciled against deterministic domain calculators.

## Part of the RaeburnAI Platform

RaeburnAI is an enterprise AI platform for practical business transformation. Each module is designed to solve a specific operating problem while sharing a consistent architecture, security model, documentation standard and delivery philosophy.

### Ecosystem map

- [RaeburnAI Compliance Engine](https://github.com/Raebu/RaeburnAI-Compliance-Engine) - AI governance, GDPR, ISO 42001, ISO 27001 and EU AI Act readiness.
- [Universal AI Knowledge Graph](https://github.com/Raebu/Universal-AI-Knowledge-Graph) - shared organisational knowledge and relationship intelligence.
- [RaeburnAI Business Twin](https://github.com/Raebu/RaeburnAI-Business-Twin) - digital operating model and business simulation layer.
- [RaeburnAI Executive Briefing](https://github.com/Raebu/RaeburnAI-Executive-Briefing) - leadership briefings, board packs and decision intelligence.
- [RaeburnAI Proposal Generator](https://github.com/Raebu/RaeburnAI-Proposal-Generator) - consultant proposal, roadmap, pricing and ROI generation.
- [RaeburnAI-Chain](https://github.com/Raebu/RaeburnAI-Chain) - orchestration layer connecting core RaeburnAI modules.

## Core features

- **Contract 1.0 Consulting Schema**: Full structured coverage across 14 commercial proposal sections.
- **Client Context Capture**: Ingest client website excerpts, LinkedIn profile notes, annual report priorities, and operational pain points.
- **Deterministic ROI & Financial Payback Model**: Capacity recovery confidence factors, blended hourly rates, monthly and annualised capacity-value ranges, first-year ROI, and payback calculation with explicit limitations.
- **AI Generation Engine**: Server-side OpenAI provider integration with 25-second timeout, graceful error handling, and deterministic fallback mode.
- **Prompt Injection Defence**: XML/markdown context boundary isolation and input sanitisation.
- **Strict Zod Output Validation**: Raw AI output is schema-validated before returning to caller; invalid model responses trigger safe fallback.
- **Commercial UI / UX**: Executive dark-mode consultant workspace, 1-click Demo Data Loader, Copy-to-Clipboard, JSON download, and `@media print` PDF export styling.
- **Security & Rate Limiting**: Cloudflare edge rate limiting for production, defence-in-depth in-memory limiting, 1MB application payload checks, security headers, and privacy-safe audit logging.
- **Operational Health Check**: `GET /api/health` endpoint reporting process, application, and provider configuration status.
- **Cloudflare Workers Deployment**: Next.js on Workers through the official OpenNext Cloudflare adapter, protected by Cloudflare Access. Docker remains available for local/secondary deployment.

## Architecture

```text
src/app                    Next.js App Router pages and API routes
src/app/api/health         Operational health check endpoint
src/app/api/proposals      Proposal generation API endpoint with rate limit & payload checks
src/lib/ai                 Prompt builder, OpenAI integration, fallback, and financial reconciliation
src/lib/proposals          Domain schemas (Zod input & output) and deterministic financial calculators
src/lib/security           Rate limiting with GC, audit logging with redaction, safe error handling
src/lib/types              Shared TypeScript proposal contract (Version 1.0)
examples                   Demo client context payload (demo-client.json)
docs                       Production readiness audit and deployment documentation
tests                      Vitest unit/integration tests and Playwright E2E tests
```

## Quick start

```bash
git clone https://github.com/Raebu/RaeburnAI-Proposal-Generator.git
cd RaeburnAI-Proposal-Generator
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`. Click **⚡ Load Demo Client Data** to test the system in one click.

## Environment variables

| Variable                         | Required    | Description                                                                        |
| -------------------------------- | ----------- | ---------------------------------------------------------------------------------- |
| `OPENAI_API_KEY`                 | Conditional | Required for live AI generation. Without it, a labelled fallback draft is used.    |
| `OPENAI_MODEL`                   | No          | OpenAI model identifier (default: `gpt-4.1-mini`).                                 |
| `RATE_LIMIT_REQUESTS_PER_MINUTE` | No          | Defence-in-depth per-isolate limit (default: `20`); not the production edge limit. |
| `TRUST_PROXY_HEADERS`            | No          | Docker-only trusted proxy mode. Keep `false` on Cloudflare Workers.                |
| `PROPOSAL_API_KEY`               | Production  | Bearer key shared only with the AI_Website server.                                 |
| `TRUST_CLOUDFLARE_ACCESS`        | No          | Allows browser generation only behind fully enforced Cloudflare Access.            |

## Usage examples

Use the demo payload in [`examples/demo-client.json`](examples/demo-client.json):

```bash
curl -X POST http://localhost:3000/api/proposals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PROPOSAL_API_KEY" \
  -d @examples/demo-client.json
```

Health check:

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/readiness
```

## Security model

- API keys remain strictly server-side.
- Inputs are validated via Zod (`proposalInputSchema`) with 1MB payload limits.
- Model responses are schema-validated via Zod (`proposalOutputSchema`).
- Rate limiting per client IP with automatic memory garbage collection.
- Audit logs redact sensitive keys, tokens, and credentials.
- Error messages are sanitized to prevent leaking stack traces or internal environment details.
- Security headers configured in Next.js (`X-Frame-Options DENY`, `X-Content-Type-Options nosniff`, `Referrer-Policy`, and restrictive feature permissions).
- Generated proposals explicitly display `DRAFT_REQUIRES_HUMAN_REVIEW` status.

## Production verification

Run the complete production verification gate:

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run test:coverage
npm run format:check
npm run build
npm run cf:build
npx wrangler deploy --dry-run
npx playwright test
docker build -t raeburnai-proposal-generator .
```

Cloudflare workerd preview:

```bash
npm run preview
```

Set the production OpenAI secret interactively before deployment:

```bash
npx wrangler secret put OPENAI_API_KEY
```

Docker Compose remains supported as a secondary/local option:

```bash
docker compose up --build
```

See [`docs/production.md`](docs/production.md) for full operational guidelines.

The cross-repository source-of-truth, customer journey and delivery mapping are documented in `AI_Website/RAEBURN_AI_TRANSFORMATION_SERVICE.md` in the canonical consulting repository.

## Licence

Apache-2.0. See [`LICENSE`](LICENSE).
