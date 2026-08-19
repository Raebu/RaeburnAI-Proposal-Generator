# Roadmap — RaeburnAI Proposal Generator

## Completed (Release Candidate v1.0)

- [x] Contract 1.0 consulting proposal schema (14 executive sections)
- [x] Zod input & AI response output validation
- [x] Deterministic ROI payback model and commercial pricing calculators
- [x] AI generation pipeline with a 25-second timeout and deterministic fallback recovery
- [x] Prompt injection defence boundaries
- [x] Executive dark-mode UI with demo data loader and print/copy/JSON export tools
- [x] Rate limiting with expired memory bucket cleanup
- [x] Audit logging with credential masking and payload size enforcement
- [x] Operational health endpoint (`/api/health`)
- [x] Multi-stage Docker container and Docker Compose configuration
- [x] Vitest unit/integration suite and Playwright E2E suite

## Next (v1.1)

- PDF and DOCX proposal template rendering
- PPTX 5-slide executive presentation export
- Redis-backed rate limiting for multi-instance clusters
- Optional persistent proposal storage with workspace isolation
- Multi-model provider support (Anthropic, Gemini, OpenAI)

## Later (v2.0)

- CRM integrations (HubSpot, Salesforce)
- Real-time collaborative consultant proposal editing
- Organisation analytics dashboard
