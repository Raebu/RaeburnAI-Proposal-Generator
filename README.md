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

- Multi-step AI proposal pipeline
- Client context ingestion
- Website, LinkedIn and annual report input fields
- Technical proposal generation
- ROI and pricing calculator
- Roadmap and milestone generation
- Risk, assumptions and dependencies
- Proposal history-ready architecture
- API-first backend
- Clean executive dashboard UI
- Docker-ready deployment
- CI-ready test structure
- Security-first environment validation

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Zod validation
- Server Actions/API routes
- OpenAI-compatible provider abstraction
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
src/app                 Next.js routes
src/components          UI components
src/lib/ai              AI provider and prompt pipeline
src/lib/proposals       Proposal domain logic
src/lib/security        Validation and safety helpers
src/lib/types           Shared types
```

## Open-source licence

MIT. See [LICENSE](LICENSE).

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
