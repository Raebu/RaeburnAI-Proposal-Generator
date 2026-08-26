# CSA STAR for AI — Controls 301–320 Assurance Standard

Effective: 26 August 2026
Owner: Security & Compliance
Scope: Raeburn AI Proposal Generator

## Vulnerability remediation and closure
Security findings are risk-ranked, assigned an owner, remediated within the vulnerability-management SLA, and closed only when remediation or an approved compensating control is evidenced. Re-testing is required for material findings. Exceptions must be time-bound, risk-accepted and tracked.

## Patch and update governance
Supported application, runtime, dependency, container and infrastructure components must receive security updates according to risk. Emergency security fixes may use an expedited change path but remain subject to testing, review and rollback planning. Unsupported components are removed, upgraded or isolated under a documented exception.

## Security testing
The service uses layered assurance including automated dependency/code scanning, build/test gates, threat modelling and targeted security testing. Independent penetration testing is required on a risk basis and must be evidenced before any control specifically requiring independent testing is attested.

## Workload and AI isolation
Customer and execution context must be separated using application authorization boundaries and provider isolation controls appropriate to the deployed architecture. Cross-tenant access is denied by default. AI inputs are treated as untrusted data and are separated from privileged instructions. High-impact actions require explicit authorization and human oversight where applicable.

## Zero trust
Access is authenticated and authorized based on identity, role, tenant/context and least privilege. No network location is inherently trusted. Privileged access requires stronger assurance and is logged. Service-to-service trust must be explicit, scoped and revocable.

## Evidence requirements
The following are retained where applicable: vulnerability findings and closure records; patch/update evidence; security-test results; production isolation configuration; access-control tests; provider architecture evidence; privileged-access logs; and independent penetration-test reports. A written policy is not a substitute for operating evidence where the AI-CAIQ control asks for operation, testing or provider capability.

## Review
Review at least annually and after material architecture, threat, provider or regulatory change.