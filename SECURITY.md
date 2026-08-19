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
- **Payload & Rate Limiting**: Requests are restricted to a maximum size of 1MB and rate-limited per client IP with automatic expired bucket memory garbage collection.
- **Prompt Injection Defence**: Client context inputs are wrapped in explicit XML context tags (`<client_context>`) with system instructions directing the model to ignore override attempts.
- **Audit Logging & Privacy**: Audit events log action metadata with automatic redaction of sensitive credentials, keys, passwords, and tokens. Client context is not retained or written to disk.
- **Human-in-the-loop Safeguard**: All generated proposals carry an explicit `DRAFT_REQUIRES_HUMAN_REVIEW` status requirement.
- **Security Headers**: Production responses enforce `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy`.

## Reporting a vulnerability

Report security concerns privately to the Raeburn Consulting Group engineering team. Please include:

- Description of the vulnerability
- Proof-of-concept / reproduction steps
- Potential commercial or data impact
