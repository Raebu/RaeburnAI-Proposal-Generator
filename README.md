# RaeburnAI Proposal Generator

Open-source AI proposal and solution generator for consultants, agencies and implementation partners.

Upload or paste client website notes, LinkedIn/company context and annual report content. RaeburnAI Proposal Generator produces:

- Executive-ready proposals
- Technical solution designs
- Implementation roadmaps
- Pricing models
- Delivery timelines
- ROI estimates
- Risk registers
- Executive presentation outlines

## Why this exists

Consultants waste hours turning discovery notes into proposal decks, pricing tables and implementation plans. This project turns messy client context into structured, reviewable, commercially useful proposal assets while keeping the human consultant in control.

## Core capabilities

- AI proposal generation API
- Client context ingestion
- Website, LinkedIn and annual report input fields
- Technical proposal generation
- ROI and pricing calculator
- Roadmap and milestone generation
- Risk, assumptions and dependencies
- Proposal history-ready architecture
- Clean executive dashboard UI
- Docker-ready deployment
- CI-ready test structure
- Strict TypeScript and Zod validation

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Zod validation
- OpenAI-compatible generation layer
- Vitest test setup
- Docker

## Quick start

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-mini
APP_BASE_URL=http://localhost:3000
```

The app includes a deterministic fallback proposal generator when no API key is configured, so contributors can run it locally before adding provider credentials.

## Production deployment

```bash
npm run lint
npm run typecheck
npm run test
npm run build
docker build -t raeburnai-proposal-generator .
```

## Project structure

```text
src/app                 Next.js routes and UI
src/lib/ai              AI provider and prompt pipeline
src/lib/proposals       Proposal domain logic
src/lib/types           Shared types
```

## Open-source licence

Apache-2.0. See [LICENSE](LICENSE).

## Roadmap

- PDF/DOCX export
- PPTX executive deck export
- CRM integrations
- Proposal version history
- Team approval workflow
- RAG over uploaded documents
- Stripe pricing model templates
- Multi-model provider support
- Supabase/Postgres persistence
- Workspace permissions

## Contributing

Pull requests are welcome. Please run tests and keep the project production-minded: typed, documented, secure and usable.
