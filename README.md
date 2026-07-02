# RaeburnAI Proposal Generator

![Status](https://img.shields.io/badge/status-production--baseline-blue) ![TypeScript](https://img.shields.io/badge/typescript-strict-blue) ![License](https://img.shields.io/badge/license-Apache--2.0-green)

## One-line positioning statement

AI proposal and solution generator for consultants.

## Short product description

RaeburnAI Proposal Generator helps consultants convert client website notes, LinkedIn context, annual report excerpts and discovery pain points into structured proposals, implementation roadmaps, pricing options, delivery timelines, ROI estimates and executive presentation outlines.

The product is designed for consultant-led review. AI output is draft advisory content, not an automatic commitment, quote or legal document.

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

- Client context capture for website, LinkedIn and annual report notes
- AI proposal generation API
- Executive summary and technical solution generation
- Implementation roadmap generation
- Pricing option generation
- ROI estimate generation
- Timeline and risk register output
- Executive presentation outline generation
- Health check endpoint
- Zod input validation
- Basic rate limiting
- Structured audit logging
- Docker and Docker Compose deployment path
- CI, CodeQL and Dependabot configuration

## Architecture

```text
src/app                    Next.js App Router pages and API routes
src/app/api/health          Operational health endpoint
src/app/api/proposals       Proposal generation endpoint
src/lib/ai                  Prompt and provider integration
src/lib/proposals           Domain schemas, pricing and ROI calculators
src/lib/security            Rate limiting, audit logging and safe errors
src/lib/types               Shared TypeScript proposal contracts
examples                    Demo input data
docs                        Production and screenshot documentation
```

The current implementation uses a server-side OpenAI-compatible generation layer with a deterministic fallback when no provider key is configured. Proposal storage, user accounts and workspace RBAC are intentionally marked as roadmap items rather than faked.

## Quick start

```bash
git clone https://github.com/Raebu/RaeburnAI-Proposal-Generator.git
cd RaeburnAI-Proposal-Generator
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `APP_BASE_URL` | Yes | Public base URL for the app. |
| `OPENAI_API_KEY` | No | Server-side provider key. Without this, fallback generation is used. |
| `OPENAI_MODEL` | No | Model name. Defaults to `gpt-4.1-mini`. |
| `MAX_INPUT_CHARS` | No | Maximum planned input size. |
| `RATE_LIMIT_REQUESTS_PER_MINUTE` | No | Planned externalised rate limit value. |
| `LOG_LEVEL` | No | Runtime logging level. |
| `HUMAN_APPROVAL_REQUIRED` | No | Documents the expected human-review workflow. |

## Usage examples

Use the demo payload in [`examples/demo-client.json`](examples/demo-client.json), or submit equivalent context through the web UI.

API example:

```bash
curl -X POST http://localhost:3000/api/proposals \
  -H "Content-Type: application/json" \
  -d @examples/demo-client.json
```

Health check:

```bash
curl http://localhost:3000/api/health
```

## Security model

- API keys stay server-side only
- User input is validated with Zod
- Proposal generation is rate-limited per caller key
- Sensitive actions are audit logged
- Errors are returned through a safe error helper
- Security headers are configured in Next.js
- CodeQL scans run through GitHub Actions
- Dependabot is configured for dependency maintenance
- Generated proposals require human review before being sent to clients
- No client data or secrets should be committed to the repository

Known limitation: rate limiting is currently in-memory and should be replaced with Redis or edge rate limiting for multi-instance production deployments.

## Production readiness

Production baseline is in place for an open-source module:

```bash
npm install
npm run lint
npm run typecheck
npm run test
npm run build
docker build -t raeburnai-proposal-generator .
```

Docker Compose:

```bash
docker compose up --build
```

See [`docs/production.md`](docs/production.md) for deployment notes.

## Roadmap

- PDF and DOCX proposal export
- PPTX executive deck export
- Persistent proposal history
- Workspace authentication and RBAC
- Redis-backed rate limiting
- Full document upload and retrieval pipeline
- CRM integrations
- Proposal approval workflows
- Multi-model provider support
- Organisation analytics

See [`ROADMAP.md`](ROADMAP.md).

## Contributing

Contributions are welcome. Please read [`CONTRIBUTING.md`](CONTRIBUTING.md), keep changes typed and tested, and maintain the shared RaeburnAI platform style.

## Licence

Apache-2.0. See [`LICENSE`](LICENSE).
