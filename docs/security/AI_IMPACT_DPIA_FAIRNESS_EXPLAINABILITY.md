# AI Impact, DPIA, Fairness & Explainability Assessment — Proposal Generator

**Assessment date:** 26 August 2026
**Owner:** Product / Security / DPO
**Status:** Approved for advisory consulting use subject to listed controls

## Intended purpose
Generate draft consulting proposals, roadmaps, pricing/ROI narratives and executive presentation content from user-supplied business context. The service is advisory and requires human review before customer or commercial reliance.

## Personal-data/privacy assessment
The service may receive business contact or employee/customer context supplied by a user. High-volume special-category or criminal-offence data is not required for normal operation and should not be submitted unless specifically authorised. The application minimises fields, validates size/type, avoids intentional durable server-side input storage, and routes privacy requests to dpo@theraeburngroup.com.

### DPIA risk findings
- Excessive or unlawful personal data: mitigated by purpose limitation, minimisation, contractual/user responsibility and DPO escalation.
- Third-party AI disclosure: mitigated by approved-provider requirement, encrypted transfer, provider/DPA review and deployment-specific region/retention controls.
- Prompt injection/data exfiltration: mitigated by separating untrusted client material from privileged instructions, strict input/output schemas and no autonomous tool execution.
- Sensitive data in logs: mitigated by logging event/provenance metadata rather than full prompt contents.
- Incorrect output/hallucination: mitigated by explicit no-unsupported-claims rule, strict schema validation, deterministic calculations/fallback and required human review.

Residual privacy risk: Moderate for deployments processing personal/confidential context until provider contractual/location evidence is confirmed; Low-to-Moderate for ordinary business context after those controls are evidenced.

## AI impact assessment
Potential affected parties include consultants, customers and people mentioned in supplied context. The application does not autonomously take employment, credit, healthcare, insurance or legal-rights decisions and is not approved for those uses.

Key risks: hallucination, over-reliance, commercial misstatement, biased wording/recommendations, confidential-data disclosure, provider dependency and misuse. Controls: bounded context, approved provider, output validation, human review, audit logging, incident/vulnerability processes and acceptable-use restrictions.

## Fairness assessment
The proposal-generation function is not designed to rank people or determine eligibility. Protected characteristics are not required inputs. The service must not infer protected characteristics or use them as decision criteria. Where a proposal concerns workforce/customer segmentation, reviewers must check that recommendations do not create unjustified differential treatment.

**Initial assessment:** no intended decision path requires protected characteristics; deterministic pricing/ROI calculations are independent of demographic characteristics. Live model fairness regression testing is required before any use case that materially evaluates or recommends actions about individuals or protected groups.

## Explainability requirement and evaluation
Required explainability is practical rather than neural-model interpretability. Users can identify: the supplied source-context categories; explicit assumptions; structured roadmap/pricing/ROI/risk sections; deterministic calculations; model/provider configuration where disclosed operationally; and the fact that output requires human review.

Limitations: Raeburn cannot explain internal neural reasoning of a third-party foundation model and does not claim chain-of-thought transparency. Generated prose may be probabilistic and incomplete. These limitations are acceptable only for advisory drafting with human validation.

## Human oversight
A competent human reviewer must validate material facts, assumptions, pricing, legal/regulatory claims, recommendations and customer-specific commitments before external use. High-impact automated decisions are prohibited.

## Review triggers
Reassess on: new model/provider; training/fine-tuning/RAG dataset introduction; durable storage; new sensitive-data categories; autonomous tools/actions; new jurisdiction; high-impact decision use; material security incident; or major customer requirement change.
