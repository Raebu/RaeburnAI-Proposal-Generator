# Incident Response Plan, Contact Register & Incident Register

Owner: Security & Compliance
Effective: 26 August 2026

## Response workflow
1. Receive/detect event through monitoring, provider alert, user report, responsible disclosure or internal review.
2. Triage severity and determine whether customer data, personal data, credentials, AI safety/integrity or availability are affected.
3. Contain immediately where required, including disabling a feature/provider integration, revoking credentials, rate limiting or rolling back.
4. Preserve relevant logs, deployment/source revisions and provider evidence without copying unnecessary customer content.
5. Eradicate root cause, validate remediation and recover service safely.
6. Notify affected customers, processors/providers and authorities when required by law, regulation or contract.
7. Perform lessons learned/root-cause review for material incidents and track corrective actions to closure.

## Severity
- P1 Critical: active compromise, material cross-tenant/customer exposure, critical credential compromise, dangerous autonomous action or major outage.
- P2 High: significant control failure or likely customer/security impact without confirmed P1 impact.
- P3 Medium: contained security weakness/event requiring remediation.
- P4 Low: informational/minor event without material impact.

## Metrics reported
Security owner reports: incident count by severity; mean/median time to acknowledge, contain and recover where data exists; recurrence; customer impact; reportable privacy incidents; and overdue corrective actions.

## Baseline report — 26 August 2026
Known open reportable security incidents recorded in this register: 0.
Known open personal-data breaches recorded in this register: 0.
Overdue incident corrective actions originating from this register: 0.
This baseline starts the operating record and is updated when incidents occur and at security review.

## Contact register
- Security reporting: security@theraeburngroup.com
- Data protection/privacy: dpo@theraeburngroup.com
- UK data-protection regulator: Information Commissioner's Office (ICO)
- UK national cyber-response guidance/reporting: National Cyber Security Centre (NCSC)
- Material suppliers: provider support/security channels are recorded with deployment/supplier evidence when production scope is confirmed.
- Customer contacts: contract/service-specific contacts are used where notification obligations exist.

## Incident records
Each incident record must include unique ID, date/time, reporter/source, severity, affected service/data/tenants, chronology, containment, evidence references, notifications/decisions, root cause, remediation, lessons learned, owner and closure date. Sensitive incident records must be access-restricted.

## Review
Material incidents trigger immediate post-incident review. The plan, contacts and metrics are formally reviewed at least annually; completion evidence is retained separately.