# CSA AI Controls 251–300 Assurance Standard

Owner: Security & Compliance
Effective: 26 August 2026
Review: at least annually and after material change

This standard operationalises AI-CAIQ controls 251–300 for the Raeburn AI-enabled consulting service scope.

## Open-model risk
Open or externally sourced models may be used only after a documented risk assessment covering provenance, licence, model card/documentation, known vulnerabilities, prompt/tool abuse exposure, data-handling implications, maintainership, update cadence and suitability for intended use. Risk is re-evaluated on material model/provider/version changes. Serialized model artifacts, when used, must use non-executable/safe formats where practicable; unsafe deserialisation of untrusted model artifacts is prohibited.

## Security incident management
Security incidents are handled through a documented lifecycle: detect, triage, classify, contain, preserve evidence, eradicate, recover, notify where required, conduct lessons learned and track corrective actions. Severity and customer/data impact drive escalation. Security records must avoid unnecessary customer content and be retained in restricted repositories. Security contacts include security@theraeburngroup.com and the DPO at dpo@theraeburngroup.com for personal-data incidents.

Incident response must account for AI-specific events including prompt injection, data leakage, unsafe tool use, model/provider compromise, anomalous outputs, model integrity concerns and supply-chain events. Breach notification decisions must consider legal, regulatory, contractual and customer requirements.

## Service management
Material service changes, incidents, availability issues and recovery actions are traceable to source/deployment records or issue records. Service-management procedures are reviewed after material incidents and changes.

## Incident metrics and records
The security owner maintains incident metrics including count by severity, time to acknowledge, time to contain, time to recover, recurrence, customer impact and corrective-action ageing. A secure incident register is maintained. Root-cause and trend analysis is required for material or recurring events.

## Contact register
The security owner maintains relevant external escalation contacts, including applicable supervisory/regulatory authorities, law-enforcement/cyber-response channels, critical suppliers and customer contacts where contractually required.

## Supply-chain risk management and shared responsibility
All material suppliers must be subject to risk-based review before production use. Reviews consider security posture, privacy/data processing, resilience, incident notification, subprocessor use, geographic processing, AI/model supply chain, contractual obligations and exit/portability risk.

A Shared Security Responsibility Model (SSRM) is maintained for material services. It identifies responsibilities retained by Raeburn, inherited from suppliers and allocated to customers. Customers must not be told that supplier controls are Raeburn-operated controls. Supplier dependencies are recorded in a service bill of materials (service BOM) or equivalent register.

Supplier security requirements are proportional to risk and include, where applicable: confidentiality, data protection, security controls, incident notification, access control, vulnerability management, business continuity, audit/assurance rights or evidence, subprocessor transparency, data return/deletion and termination provisions.

## Threat and vulnerability management
The service uses a risk-based vulnerability-management process. Sources include dependency scanning, code analysis, repository security features, security testing, responsible disclosure, provider advisories and threat intelligence. Findings are prioritised using severity, exploitability, exposure, affected data/tenant scope and compensating controls.

Remediation targets:
- Critical actively exploitable/exposed: immediate containment and expedited remediation.
- Critical: target 7 days.
- High: target 30 days.
- Medium: target 90 days.
- Low: risk-accepted or scheduled based on context.

Exceptions require documented risk acceptance, owner, compensating controls and expiry/review date.

## Malware and malicious-instruction protection
Untrusted files, model artifacts, prompts, web/context data and dependencies are treated as potentially hostile. Executable content must not be introduced through model/data ingestion paths unless explicitly required, isolated and assessed. Prompt instructions embedded in customer/source data are data, not trusted system instructions. Repository secret scanning, dependency scanning and safe parsing/validation controls form part of this control.

## Threat modelling
Threat models must consider at minimum authentication/authorization bypass, tenant boundary failure, injection, prompt injection, insecure deserialisation, malicious dependency/model artifacts, data exfiltration, sensitive logging, SSRF/tool misuse, rate-limit abuse, supply-chain compromise, model/provider outage and unsafe AI output. Threat models are updated after material architecture changes.

## Penetration testing
Risk-based security testing includes automated scanning and external-style testing. Independent penetration testing is commissioned when customer commitments, risk, significant architecture change or assurance needs justify it. Automated scans are not represented as independent penetration tests.

## Evidence rule
A policy/process statement is not sufficient evidence for controls that require recurring operation, completed exercises, contractual clauses, provider assurance, periodic reviews or independent testing. Those controls remain evidence-gated until objective evidence is retained.
