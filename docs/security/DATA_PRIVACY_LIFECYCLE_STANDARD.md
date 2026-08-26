# Data Security & Privacy Lifecycle Standard

**Owner:** Data Protection / Security
**Effective:** 26 August 2026
**Review:** at least annually and after material change

## Scope
Applies to personal, sensitive, regulated, confidential and customer data processed by Raeburn AI-enabled consulting services, including Proposal Generator and DiscoveryOS.

## 1. Lifecycle governance
Data is classified, minimised, protected, retained and deleted according to purpose, sensitivity, contract and applicable law. New processing must identify lawful purpose, data categories, owner/steward, processors/subprocessors, locations, transfers, retention and deletion path before production use.

## 2. Classification
Classes: Public; Internal; Confidential; Restricted. Personal data, credentials, security telemetry containing identifiers, customer confidential material and regulated data are Confidential or Restricted unless a documented assessment states otherwise.

## 3. Inventory and ownership
The service data register is authoritative. It records data category, source, owner/steward, purpose, system, processor, location, retention, transfer basis and deletion method. Security owns technical safeguards; the DPO/data-protection function owns privacy governance; product owners own purpose and minimisation.

## 4. Data flows
Material data flows must be documented from collection through processing, third-party transfer, storage, output, logging, backup and deletion. Reviews occur at least annually and following architecture/provider changes.

## 5. Security and privacy by design/default
Only fields required for the service are collected. Inputs are length/schema validated. Sensitive data is not placed in logs by design. Production secrets are excluded from source control. Privacy-preserving defaults, least privilege, encryption and human review are mandatory where applicable.

## 6. DPIA / AI impact assessment
A DPIA is required before high-risk personal-data processing or where risk indicators exist. The AI impact assessment is required for material AI changes and must cover privacy, security, misuse, fairness, transparency, human oversight and supplier risk. Unresolved high risk requires DPO/security escalation before release.

## 7. Transfers and subprocessors
Personal or sensitive data may be transferred only over approved encrypted channels and only to approved processors/subprocessors under an appropriate contract/DPA and transfer mechanism where required. Subprocessors must be recorded and disclosed through the applicable Trust Centre, contract or customer assurance channel.

## 8. Data-subject rights
Requests for access, correction, deletion, restriction, portability or objection are routed to dpo@theraeburngroup.com. Identity is verified proportionately; applicable systems and processors are searched; decisions and completion dates are recorded; statutory timelines apply.

## 9. Purpose limitation
Personal data is used only for documented purposes compatible with the original collection basis. Secondary use requires documented assessment and, where required, new notice/consent or other lawful basis.

## 10. Production/non-production separation
Production customer/personal data must not be copied to development/test environments unless explicitly authorised by the data owner, justified by risk assessment, minimised/redacted, access-restricted and deleted promptly after the approved purpose.

## 11. Retention and deletion
Retention is defined per data category. Proposal Generator is designed to avoid durable server-side storage of proposal inputs unless a deployment explicitly adds persistence. DiscoveryOS uses configured retention controls. Deletion must cover primary records and downstream processors; backup copies expire through controlled backup-retention cycles.

## 12. Secure disposal
Logical data is securely deleted using provider-supported deletion mechanisms. Physical-media destruction/sanitisation is inherited from approved cloud/datacentre providers and must be evidenced through supplier assurance. Raeburn-managed removable media containing Restricted data is prohibited unless specifically approved and encrypted; disposal must use recognised sanitisation or certified destruction.

## 13. Law-enforcement disclosure
Requests are referred to the DPO/legal owner. Raeburn verifies authority, scope, jurisdiction and necessity; discloses only legally required data; records the request and response; and notifies the customer/data subject where lawful and contractually appropriate. Informal requests are not actioned.

## 14. Data location
Production data locations and subprocessors must be documented before production processing. Changes to country/region are reviewed for privacy, contractual and transfer impact and communicated where required.

## 15. Provenance and integrity
Sources used for AI context or datasets must be attributable. Where practical, source type, timestamp/version and integrity hash are recorded without logging sensitive content. Training/fine-tuning datasets are not currently part of the Proposal Generator service; any future dataset must have an owner, provenance record, version identifier, integrity checks and change approval before use.

## 16. Data poisoning
Untrusted customer/source material is treated as data, not instructions. Schema bounds, prompt-injection separation, integrity/version controls and human review reduce poisoning risk. Training/fine-tuning pipelines, if introduced, must include provenance, allowlisting where appropriate, duplicate/anomaly checks, integrity validation and rollback to a known dataset version.

## 17. Privacy-enhancing techniques
Risk assessment determines use of minimisation, redaction/pseudonymisation, aggregation, tokenisation or other PETs. Raw personal data is not to be used for model training by Raeburn unless specifically approved by a DPIA/AI impact assessment and contractually permitted.

## 18. Integrity and versioning
Material datasets and reference corpora must be versioned and protected against unauthorised changes. Release or model-evaluation evidence must identify the dataset/version used so results are reproducible.

## 19. Relevance
Data used for model evaluation, augmentation, retrieval or future training must be relevant to the documented use case. Owners must remove stale, unrelated or unlawfully sourced data.

## Evidence
Evidence includes this standard, service data register, DPIA/AI impact assessment, architecture/data-flow record, source/version hashes, processor register, retention settings, access controls, audit logs and supplier assurance.
