# Cryptography and Key Management Standard

Owner: Security
Review: at least annually and after material cryptographic, provider, regulatory, or security changes.

## Policy
Raeburn AI services protect data in transit using TLS and protect stored data using approved platform/database encryption plus application-level encryption where the threat model requires it. Cryptographic design uses established, maintained libraries and provider-managed cryptographic services; bespoke cryptographic primitives are prohibited.

Approved symmetric protection is AES-256-GCM or an equivalent AEAD construction from an approved library/provider. Approved hashing/signature algorithms and TLS configurations must meet current industry guidance and provider-supported secure defaults. Weak/deprecated algorithms and protocols must not be introduced.

## Roles
Security owns this standard and cryptographic risk decisions. Engineering implements cryptographic controls. Privileged key/secret administration is restricted by least privilege and MFA where supported. Production application code must never contain plaintext production secrets.

## Key lifecycle
Each cryptographic key/secret has a defined purpose and environment. Generation must use provider KMS/secret-management facilities or a cryptographically secure random number generator from an approved library. Keys are created inactive/pre-provisioned where the supporting platform exposes lifecycle states, activated only for an approved purpose, rotated according to risk and provider capability, revoked immediately on suspected compromise or loss of authorization, deactivated at expiry, and securely destroyed when retention/rollback obligations expire.

Compromised or revoked keys must not be used for new encryption. Where technically required to recover legacy data, a revoked key may be retained with least-privilege decrypt-only access until migration or retention expiry. Archived keys are stored only in approved secret/KMS repositories and are never committed to source control.

Key changes follow the change-management process, including impact, rollback, downstream dependency, residual-risk, cost/benefit and continuity analysis. All material status changes must be attributable through provider audit logs, deployment history, ticket/change records or equivalent evidence.

## Rotation and cryptoperiod
Cryptoperiods are based on sensitivity, exposure, provider guidance, contractual/regulatory obligations and operational risk. High-risk secrets are rotated immediately following suspected compromise. Routine production secrets are reviewed at least annually and rotated sooner where provider capabilities and risk justify it. Rotation must preserve controlled decrypt/migration capability for existing ciphertext where required.

## Customer-managed keys
Where an enterprise deployment or supporting cloud service exposes customer-managed/BYOK capabilities, customers may provide and control their own encryption keys through the approved KMS/secret-management integration. A product must not advertise customer-managed keys unless that deployment path has been tested and documented.

## Assurance
Cryptographic controls are reviewed continuously through code/dependency/security checks and at least annually as part of the security-control review. Material security incidents trigger an immediate cryptographic impact review. Findings are tracked to closure.
