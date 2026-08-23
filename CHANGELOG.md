# Changelog

All notable changes to this project will be documented here.

## Unreleased

- Kept the £5,000+ implementation option independent from client ROI-investment assumptions.
- Removed invented fallback client facts and replaced them with explicit discovery-validation hypotheses.
- Tightened Contract 1.0 output bounds, added a production-standalone test launcher, and repaired CI secret-scan enforcement.
- Added desktop/mobile axe WCAG and browser runtime-error assertions, programmatic ROI field labels, and accessible output contrast.
- Streamed and bounded proposal request bodies before allocation, including requests without a trustworthy `Content-Length` header.
- Added a real Word-compatible DOCX export containing the complete proposal, deterministic ROI, governance, responsible-AI and human-review status sections; browser coverage verifies the downloaded file.
- Bound the standalone container to `0.0.0.0` so its in-container health check and orchestrator probes reach the application reliably.

## 1.0.0-rc.2 — 2026-08-20 (Release Candidate)

### Added

- **Cloudflare Workers Runtime**: Added the official OpenNext Cloudflare adapter, Wrangler configuration, generated binding types, workerd preview, custom-domain declaration, and Workers observability.
- **Continuous Compatibility**: CI now builds the OpenNext Worker, performs a Wrangler deployment dry run, and runs Playwright against the actual local Workers runtime.
- **Workers Verification**: Added trusted Cloudflare client-identity, invalid-provider-key, 25-second timeout, export, clipboard, print, mobile, browser-storage, and response-header coverage.

### Security

- Cloudflare `CF-Connecting-IP` is authoritative on Workers; `X-Forwarded-For` is ignored unless secondary Docker trusted-proxy mode is explicitly enabled.
- `OPENAI_API_KEY` remains a runtime-only Wrangler secret. Cloudflare Access and edge rate limiting are mandatory external production controls.

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
