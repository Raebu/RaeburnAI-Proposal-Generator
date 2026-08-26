# Identity & Access Management Standard

**Owner:** Security / Engineering
**Effective:** 26 August 2026
**Review:** annually and after material identity-provider, architecture or risk change

## Principles
Access is based on unique identities where authentication is required, least privilege, need-to-know and separation of duties. Shared privileged identities are prohibited except documented emergency/service identities with compensating controls.

## Provisioning and revocation
Access requires an approved business purpose and owner. Provisioning, material access changes and revocation must be recorded. Leavers and no-longer-required access are revoked promptly. Privileged access is time-limited where the platform supports it and reviewed more frequently than ordinary access.

## Authentication
Privileged, administrative, source-control, cloud, production, security and privacy access must use strong authentication and MFA where the provider supports it. Service identities use securely generated secrets, certificates, workload identity or equivalent mechanisms rather than human passwords where possible.

## Credential management
Credentials must be unique, kept in approved secret stores, never committed to source control, rotated/revoked following compromise or role change and protected against disclosure. Default or weak production secrets are prohibited.

## Authorization
Role- and scope-based authorization must be enforced for sensitive functions and tenant/customer data. Global administrative access requires explicit authorization. Customer-controlled privileged access is performed only within authorised support/delivery scope.

## Access reviews
Security/system owners review access at least quarterly for privileged identities and at least annually for ordinary sensitive access, and after material role changes. Reviews validate identity, role, scope, need-to-know and segregation-of-duties conflicts.

## AI-specific access
AI agents and automation receive only the tools, plugins, data scopes and permissions required for the approved use case. Model-output modification and overrides are restricted to authorised roles and changes affecting material decisions require traceable human approval.

## Evidence
Evidence includes identity-provider exports, cloud/source-control membership, role mappings, access-review records, provisioning/revocation tickets, MFA/provider settings and audit logs.