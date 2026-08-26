# Business Continuity & Disaster Recovery Plan

**Owner:** Security / Service Owner
**Effective:** 26 August 2026
**Review:** annually and after material change

## Business impact and priorities
Priority 1: protect people, credentials and customer data. Priority 2: contain security impact. Priority 3: restore authenticated customer-facing service. Priority 4: restore non-critical reporting/administration.

Material disruption scenarios include cloud/platform outage, database loss/corruption, deployment failure, credential compromise, supplier outage, DNS/TLS failure, staff unavailability and security incident.

## Recovery strategy
- Source, configuration and infrastructure definitions are version controlled.
- Production releases must be reproducible from controlled source.
- Managed cloud/provider resilience is used in preference to dependence on local physical equipment.
- Critical credentials are stored in provider secret-management facilities, not source code.
- A known-good release must be identifiable and rollback-capable.

## Backups
For production systems that persist customer or operational data, provider-supported automated backup/PITR must be enabled before production use. Backups inherit production confidentiality and access restrictions.

Minimum operational target unless a stricter service contract applies:
- automated backup or point-in-time recovery: daily or continuous;
- retention: at least 7 days for operational recovery;
- restore verification: quarterly and after material storage changes;
- restoration evidence: ticket/log containing date, operator, source backup, target, result and issues.

A service without persistent production data documents that fact and relies on source/configuration redeployment instead of claiming data backups.

## Continuity exercise
At least annually, conduct a tabletop exercise covering one supplier outage and one security/data-loss scenario. Record participants, scenario, decisions, recovery sequence, communications, gaps and remediation owners.

## Disaster-response exercise
At least annually, exercise recovery to a known-good state. Participation of emergency authorities is included only where relevant and feasible; for cloud software incidents it is normally not applicable.

## Communications
Internal: accountable leadership, service owner, security, privacy/DPO where personal data is implicated.
External: affected customers, critical suppliers and regulators/authorities where contractual or legal thresholds require notification.

## Invocation and closure
The incident lead may invoke this plan for a material outage, integrity loss or security incident. Closure requires service validation, evidence preservation, customer/regulatory assessment and a lessons-learned record.