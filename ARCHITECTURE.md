# Architecture

The Proposal Generator is an independently deployable, stateless Next.js service. `POST /api/proposals` accepts Contract 1.0 using a server-side bearer key, validates and bounds the request, calls the configured provider through `src/lib/ai`, validates its structured result, then overwrites financial output with deterministic pricing and ROI calculations. A labelled deterministic draft is returned when the provider is absent or safely fails.

The service does not own customers, payments, proposal history or approval. AI_Website persists the numbered draft and controls human review/client visibility. The standalone browser workspace is an internal convenience protected by Cloudflare Access; it never persists inputs in browser storage. See `docs/PROPOSAL_CONTRACT_1.0.md`.
