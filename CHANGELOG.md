# Changelog

All notable changes to this project will be documented here.

## 1.0.0-rc.1 — 2026-08-19 (Release Candidate)

### Added

- **Contract 1.0 Consulting Schema**: Full 14-section proposal specification covering Executive Summary, Business Context, Current State Assessment, Challenges, Opportunities, Proposal Scope, Technical Solution, Phased Roadmap, Pricing Tiers, Timeline, Deterministic ROI, Risk Register, Governance, Responsible AI, Next Steps, and Executive Presentation.
- **AI Reliability & Validation**: Output validation with Zod (`proposalOutputSchema`), 25-second AI request timeout, and financial reconciliation against deterministic domain calculators.
- **Prompt Injection Defence**: XML context isolation (`<client_context>`) and character/command sanitisation.
- **Commercial UI**: Executive consultant interface with 1-click Demo Client Data loader, Copy Text, Download JSON, and `@media print` PDF layout styling.
- **API & Rate Limiting Upgrades**: Payload size limit enforcement (1MB max), in-memory rate limiting with expired bucket garbage collection, HTTP 413/429/400 status codes, and security headers.
- **Expanded Testing**: Vitest unit/integration and Playwright consultant-journey coverage in the release gate.
- **Health Endpoint**: Operational checks for process, application, and provider status (`/api/health`).

## 0.1.0 — 2026-07-02

### Added

- Next.js initial proposal generator application
- Basic AI prompt and deterministic fallback
- Initial Dockerfile and CI setup
