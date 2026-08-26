# CSA AI-CAIQ Controls 201–250 Assurance Standard

Owner: Security & Compliance
Effective: 26 August 2026
Review: annually and after material change.

This standard governs Infrastructure Security, Logging and Monitoring, and Model Security for the service.

## Infrastructure
Production and non-production environments are separated. Customer access is tenant-scoped. Service communications use authenticated and encrypted channels. Production platforms use maintained secure baselines. Capacity, availability, approved service exposure, environment separation, tenant isolation, migration security, high-risk architecture and provider assurance are reviewed and retained as evidence.

## Logging and monitoring
Security-relevant activity is auditable. Logs are access-controlled, retained according to policy and protected from unauthorized modification or deletion. Events use reliable timestamps. Sensitive customer content is not written to ordinary logs; privacy-preserving metadata, classifications and cryptographic digests are used where event traceability is required. Monitoring failures and material security anomalies require escalation. AI input and output events must be traceable without unnecessarily retaining raw customer content.

## Model security
Raeburn primarily consumes provider-hosted models rather than maintaining a proprietary training pipeline. Provider provenance, model documentation, material changes and supplier assurance are recorded. Any model artifact stored or loaded by Raeburn must be scanned, cryptographically hashed and provenance-verified before use. Model-specific adversarial threats are assessed and mitigated. AI functions must have failure handling and a deterministic or safe fallback where feasible. Material model changes require renewed evaluation.

## Evidence gate
A control is attested only when repository, production, supplier or operating evidence supports it. Provider-dependent and runtime-dependent controls remain open until objective evidence is retained.