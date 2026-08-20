# Security Policy — RaeburnAI Proposal Generator

## Supported versions

The release-candidate branch is supported for controlled deployment validation. Promotion to
`main` is a separate repository-owner decision.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security architecture & controls

- **Server-Side Credentials**: API keys (such as `OPENAI_API_KEY`) remain strictly on the server side and are never exposed to client-side bundles.
- **Strict Input & Output Validation**: All incoming requests are validated against `proposalInputSchema` (Zod). All AI model responses are validated against `proposalOutputSchema` (Zod) before being processed or returned.
- **Payload & Rate Limiting**: Requests are restricted to 1MB. Cloudflare edge rate limiting is the authoritative distributed production control; the per-isolate in-memory limiter is defence in depth only.
- **Trusted Client Metadata**: Workers use Cloudflare-overwritten `CF-Connecting-IP`, never client-supplied `X-Forwarded-For`. The latter is accepted only when `TRUST_PROXY_HEADERS=true` for an explicitly trusted Docker reverse proxy.
- **Access Control**: Server-to-server requests require `PROPOSAL_API_KEY`. The standalone workspace is accepted only when explicitly configured behind a Raeburn-controlled Cloudflare Access policy; alternate routes must be disabled.
- **Prompt Injection Defence**: Client context inputs are wrapped in explicit XML context tags (`<client_context>`) with system instructions directing the model to ignore override attempts.
- **Audit Logging & Privacy**: Audit events log action metadata with automatic redaction of sensitive credentials, keys, passwords, and tokens. Client context is not retained or written to disk.
- **Workers Observability**: Structured operational logs are enabled through Workers observability; proposal bodies, model output, secrets, and raw provider exceptions are excluded.
- **Human-in-the-loop Safeguard**: All generated proposals carry an explicit `DRAFT_REQUIRES_HUMAN_REVIEW` status requirement.
- **Security Headers**: Production responses enforce `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy`.

## Reporting a vulnerability

Report security concerns privately to the Raeburn Consulting Group engineering team. Please include:

- Description of the vulnerability
- Proof-of-concept / reproduction steps
- Potential commercial or data impact
