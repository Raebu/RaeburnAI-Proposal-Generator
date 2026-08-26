# CSA AI-CAIQ Controls 51–100 Implementation Record

Effective: 26 August 2026
Owner: Security / Engineering

This record maps the second block of 50 AI-CAIQ controls to operational controls for Raeburn AI-enabled consulting services. A control is only treated as attestation-ready where current evidence supports the full question. Supplier-inherited and elapsed-period controls remain evidence-gated until objective evidence is retained.

## Change/configuration controls
CCC-08.1 and CCC-09.1 are implemented through the Change & Configuration Management Standard: exceptions/emergency changes require recorded scope, authorization, validation and retrospective review; releases retain a known-good revision and must be rolled back/disabled on security or validation failure.

## Cryptography and key management
CEK-01 through CEK-21 are governed by the Cryptography and Key Management Standard. Approved cryptography uses maintained libraries/provider KMS/secret managers; secrets are purpose-bound, least-privileged and excluded from source control; rotation/revocation/destruction rules are risk-based; compromised/retired keys are prohibited for new encryption; key changes use controlled change management.

DiscoveryOS additionally implements AES-GCM application-level encryption with tenant-specific derived keys and a versioned key identifier. New ciphertext uses only the active key. Retired keys can be configured decrypt-only for controlled migration/retention, enabling rotation without reactivating retired keys. Production configuration validates key material length and key-ring consistency.

Customer-managed/BYOK capability is not claimed attestation-ready until a documented and tested deployment path exists for the assessed service. Independent/annual cryptographic audit controls remain evidence-gated until the audit event is retained.

## Physical and environmental security
The Physical and Environmental Security Standard governs Raeburn-controlled workplaces, endpoints, media, relocation, sanitisation, asset classification and transfers. The Asset Register records material logical assets and explicitly assigns supplier-owned physical datacentre assets to the supplier-assurance process.

Managed cloud datacentre controls—including physical perimeters, monitored ingress/egress, surveillance, datacentre staff training, cable protection, environmental controls and utility resilience—are inherited supplier controls. These controls are not treated as attestation-ready until current provider assurance evidence for the actual production provider is linked in the evidence register.

## Review cadence
All standards and registers in this record are reviewed at least annually and upon significant change. Exceptions and unresolved evidence gaps are tracked as corrective actions until closure.
