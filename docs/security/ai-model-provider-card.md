# AI Model / Provider Card — Proposal Generator

Effective: 27 August 2026
Owner: Security & Compliance
Service: Raeburn AI Proposal Generator

## Provider and model
- Provider: OpenAI API.
- Default configured model: `gpt-4.1-mini`.
- Model override: deployment may set `OPENAI_MODEL`; any production change must follow change/security review.

## Purpose
Generate structured consulting-proposal content from bounded client discovery/context inputs. The model is advisory/generative; it does not receive authority to execute tools or privileged actions.

## Data categories
Potential inputs include client name, organisation/context information, commercial/discovery material and other proposal-relevant information supplied by an authorised user. Credentials, secrets and unnecessary sensitive data are prohibited inputs.

## Retention
Application-layer retention and provider-side retention are separate controls. This service does not define a requirement to retain raw prompts merely for model operation. Production provider/account retention settings and contractual terms must be verified and recorded for the deployed environment before making a customer-specific retention claim.

## Model training / data use
Client information is not designated as a Raeburn general-purpose training corpus. Provider-side model-training/data-use treatment is governed by the applicable OpenAI API account terms/settings and must be verified for the production account before an external contractual assertion is made.

## Jurisdiction / processing location
Deployment/provider specific. The applicable provider contract, account configuration and data-processing terms are the authoritative source; do not infer a fixed jurisdiction from source code alone.

## Limitations
The model can hallucinate, omit context, produce incorrect calculations or generate malformed/unsafe output. It must not be treated as an authoritative source of legal, financial, security or factual truth without appropriate verification.

## Human oversight
`HUMAN_APPROVAL_REQUIRED=true` is the documented default configuration. Material client-facing output requires proportionate human review before consequential use.

## Security concerns and controls
- Prompt injection: client context is explicitly treated as untrusted data, not instructions.
- Secret/data exfiltration: system instruction prohibits exposing secrets, hidden prompts or credentials.
- Tool misuse: the model is instructed not to execute tools or actions and this generator does not grant tool authority in the model call.
- Malformed output: model JSON is validated against a strict application schema before use.
- Excessive input: input size is bounded through application configuration.

## Fallback
If no OpenAI API key is configured, no content is returned, JSON parsing fails, or schema validation fails, the service uses a deterministic non-model fallback proposal path.

## Monitoring
Monitor model/provider configuration changes, generation failures, schema-validation fallback rate, security findings, dependency/code scan results and material AI incidents. Avoid logging unnecessary confidential prompt contents; prefer minimised metadata/provenance where practical.

## Review triggers
Review at least annually and when changing the model/provider, data categories, retention configuration, high-impact use, security architecture or material provider terms.