# CSA AI-CAIQ v1.1 — First 50 Control Standard

**Owner:** Raeburn Consulting / Security
**Effective:** 26 August 2026
**Review:** at least annually and after material change
**Applies to:** RaeburnAI Proposal Generator and supporting production services.

This standard operationalises AI-CAIQ questions A&A-01.1 through CCC-07.1. Evidence is maintained in Git history, CI runs, incident/change records, supplier evidence and the Raeburn CSA STAR evidence pack.

## Audit & assurance (A&A-01 to A&A-06)
- Security and assurance controls are reviewed at least annually and after material change.
- The control owner maintains a risk-based assurance plan, control evidence register, findings register and corrective-action log.
- Legal, contractual and regulatory obligations applicable to the service are considered in assurance reviews.
- Material findings receive an owner, severity, due date, remediation plan and closure evidence.
- Independent assurance is commissioned at least annually. Independence means the assessor is not responsible for designing or operating the control under review. External independent testing is preferred for material internet-facing systems.

## Application & interface security (AIS-01 to AIS-15)
- Security requirements are mandatory across requirements, design, development, review, test, deployment and operation.
- Every change passes automated linting, type checking, tests and dependency/security checks before release unless an approved emergency exception exists.
- API access uses explicit authentication/authorization, bounded secrets and validated schemas.
- Untrusted input is treated as data, not authority. Inputs are schema validated, bounded, normalized where appropriate and screened for adversarial/tool-use patterns.
- Model output is treated as untrusted. Outputs that can drive actions, customer decisions or generated code are validated against expected schemas/policies and require human review where impact is material.
- Agent/tool permissions use least privilege, explicit allowlists, bounded execution time/resource limits and no implicit access to production secrets.
- Tools/plugins execute in isolated service/process boundaries appropriate to their risk; arbitrary customer-supplied code is not executed in the application process.
- Caches must not contain secrets or cross-tenant data without explicit isolation, TTL and access controls. Sensitive responses default to no-store where appropriate.
- System/developer instructions are kept separate from user-provided content; user text is delimited and never interpolated into privileged instruction channels as trusted policy.
- Source is version controlled; review and static/security analysis are part of the SDLC.

## Business continuity & resilience (BCR-01 to BCR-11)
- A business impact analysis, continuity plan, disaster-response plan, communications plan, backup plan and restoration procedure are maintained.
- Plans are reviewed annually and after material changes.
- Backups and restore verification follow the service-specific recovery schedule documented in `BCP_DR_PLAN.md`.
- Continuity and disaster exercises are conducted at least annually and after major architecture changes, with lessons recorded and tracked.
- Managed cloud services are selected to provide provider-level redundancy; service design avoids dependence on a single local physical device for recoverability.

## Change & configuration management (CCC-01 to CCC-07)
- All production-affecting changes are version controlled and attributable.
- Normal changes require review, automated checks and a deployment record. Emergency changes require retrospective review.
- Production configuration uses documented baselines; unauthorized drift is detected by scheduled CI policy checks and platform/provider monitoring where available.
- Customer-specific environment changes require explicit authorization under the applicable engagement/SLA; no operator may make discretionary customer-environment changes outside the agreed scope.
- Rollback to a known-good release is part of deployment and incident procedures.

## Evidence rule
A control is attested **Yes** only when the required policy/process exists and objective evidence demonstrates operation. Time-bound controls such as annual independent assessment or annual exercises remain evidence-gated until the required event has actually occurred.