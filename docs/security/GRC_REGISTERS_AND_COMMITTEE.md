# GRC Registers, Exceptions & AI Ethics Committee

**Effective:** 26 August 2026

## Regulatory / standards mapping register
| Obligation/framework | Applicability | Owner | Evidence/action |
|---|---|---|---|
| UK GDPR / Data Protection Act 2018 | personal-data processing in UK scope | DPO | privacy notice, lifecycle standard, DPIA, rights process, processor controls |
| PECR | applicable electronic communications/cookies/marketing where used | DPO/Marketing | website consent/communications controls |
| Customer contracts / confidentiality / DPAs | customer engagements | Commercial/DPO | contract and supplier review |
| Intellectual property/confidentiality | source, client inputs, generated deliverables | Legal/Product | access, licence, confidentiality controls |
| UK AI regulatory principles / sector rules | risk/use-case dependent | Governance | AI impact assessment and use-case review |
| EU AI Act | where territorial/use-case scope applies | Governance/DPO | classification and obligations review before covered deployment |
| CSA AICM / AI-CAIQ | voluntary assurance | Security | implementation tracker and evidence register |

Review: at least annually and before material new jurisdiction/use case.

## Policy exception register
No active policy exceptions at adoption. New exceptions require: ID, policy/control, rationale, risk, compensating controls, owner, approver, start/expiry, review result. Exceptions without expiry are prohibited.

## AI risk register — Proposal Generator
| Risk | Inherent | Controls | Residual | Owner |
|---|---|---|---|---|
| Prompt injection through customer context | High | untrusted-context separation; no tool execution; bounded inputs; human review | Medium | Security/Product |
| Hallucination / incorrect claims | High | prompt rules; schema validation; fallback; human review | Medium | Product |
| Confidential data disclosure to provider | High | approved provider/DPA; TLS; minimisation; location/retention review | Medium pending provider evidence | DPO/Security |
| Biased or inappropriate recommendations | Medium | advisory-only scope; fairness restrictions; human review; impact assessment | Low-Medium | Product/Governance |
| Over-reliance / autonomous decision use | High | acceptable-use prohibition; human approval; no autonomous decision tools | Low-Medium | Product |
| Provider outage/model change | Medium | deterministic fallback; provider-change review | Low-Medium | Engineering |

## AI Ethics & Impact Committee charter
Established as a standing governance body from 26 August 2026.

Membership by role: Executive Sponsor/Chair; Security; Data Protection; Product/Engineering; independent/challenge participant where proportionate. Quorum: three, including Security or Data Protection.

Mandate: review high-impact/new AI use cases; unresolved DPIA/fairness risks; material policy exceptions; autonomous-action proposals; significant AI incidents; model/provider changes with material risk; and requests to use AI for decisions materially affecting individuals.

Records: each review records date, attendees/roles, decision, conditions, risks accepted, actions, owners and due dates. Emergency risk decisions are documented retrospectively within two business days.

## Initial committee determination — 26 August 2026
Proposal Generator is approved for advisory consulting-draft generation with mandatory human review. It is not approved for autonomous high-impact decisions. Conditions: provider/location/DPA evidence must be completed for deployments processing regulated/personal data; live fairness testing is required before any person-ranking use case; no training/fine-tuning on customer data without new DPIA/impact review.
