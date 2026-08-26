# Change & Configuration Management Standard

**Owner:** Engineering / Security
**Effective:** 26 August 2026
**Review:** annually and after material change

## Normal changes
1. Changes originate from an issue, requirement, security finding or approved maintenance need.
2. Source/configuration changes are committed to version control and attributable to an individual identity.
3. Changes are reviewed before production deployment.
4. Required automated checks must pass: lint, typecheck, tests, build and security/dependency checks.
5. Production deployment creates a traceable deployment record tied to the source revision.
6. Material customer-environment changes require explicit customer authorization where the customer owns or controls the environment.

## Baselines
The approved baseline is the default branch plus documented production configuration and provider-managed deployment settings. Baseline changes are made only through the controlled process.

## Unauthorized change protection
Direct unmanaged source changes are prohibited. Credentials and production configuration must not be embedded in source. Provider audit/deployment logs and scheduled repository assurance checks are used to detect unauthorized or unexplained deviations.

## Exceptions and emergency changes
Emergency changes are permitted only to contain a material security, availability or integrity risk. The operator records reason, scope, approver where practicable, validation and rollback plan. Retrospective review is required within two business days.

## Rollback
Every production release must retain a known-good source revision. If validation fails or a security concern appears, roll back or disable the affected feature before continuing investigation.

## Review
Baselines and this standard are reviewed at least annually and following material architecture, supplier or deployment changes.