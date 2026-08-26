# Service Data Register & Data Flow — Proposal Generator

**Owner:** Product / DPO / Security
**Effective:** 26 August 2026
**Review:** annually and after material architecture change

## Inventory
| Data set | Source | Classification | Purpose | Owner/steward | Persistence | Retention | Processor/location |
|---|---|---|---|---|---|---|---|
| Client name and supplied context | authenticated/authorised user or consultant | Confidential; may contain personal data | generate a consulting proposal | Product owner / DPO | application is designed without durable server-side proposal-input storage | request lifetime plus provider/logging behaviour defined by deployment contracts | application runtime; approved AI provider when enabled; production region must be recorded in deployment evidence |
| Generated proposal | AI provider or deterministic fallback | Confidential | return requested proposal | Product owner | returned to caller; durable storage only if a deployment explicitly adds it | deployment/customer defined | application runtime/customer endpoint |
| Security/audit metadata | application | Internal/Confidential | abuse prevention, security investigation, operations | Security | structured logs | provider/security retention schedule | approved logging/runtime provider |
| Credentials/API keys | administrators/providers | Restricted | service authentication | Security | secret manager/environment only | until rotation/revocation | approved deployment secret store |

## Data flow
1. User submits bounded proposal fields over HTTPS.
2. API validates schema and size limits.
3. Source manifest records source categories and content hashes without copying sensitive content into logs.
4. If an approved AI provider key is configured, validated context is sent over TLS to the approved provider; otherwise deterministic local fallback is used.
5. AI output is parsed and validated against a strict output schema; invalid output is discarded and fallback used.
6. Proposal response is returned over HTTPS.
7. Security logging records event outcome and non-sensitive provenance metadata.
8. No model training or fine-tuning is performed by this application.

## Ownership/stewardship review
Product owns business purpose; DPO owns privacy governance; Security owns technical safeguards. Changes to fields, provider, persistence, region, subprocessors or retention require review of this register, DPIA/AI impact assessment and customer disclosures where applicable.

## Subprocessor disclosure register
- OpenAI API: conditional AI inference provider when configured. Customer/data terms and deployment-specific retention/training settings must be approved before production use.
- Hosting, logging and edge providers: deployment-specific and must be recorded in the Trust Centre/provider assurance register before production processing.

## Data location
The repository does not hard-code a production geography. Production deployments must record runtime, database (if any), logs and AI-provider processing regions before customer data is processed. Unsupported/unknown location is a release blocker for regulated workloads.
