# Supply Chain SSRM & Service BOM

Owner: Security & Compliance
Effective: 26 August 2026

## Shared Security Responsibility Model
Raeburn owns application design, secure coding, application configuration, prompt/data handling, application-level access controls, customer-facing incident coordination and its own personnel/process controls.

Infrastructure, hosting, identity, model/API and repository providers own controls intrinsic to their managed platforms. Their controls are inherited only where verified and applicable. Customers retain responsibility for lawful data submission, authorized users, endpoint security, credentials they control, use of generated outputs and any customer-managed environment.

Customer guidance: Raeburn does not represent supplier-operated controls as Raeburn-operated controls. Where a contract/customer deployment changes responsibilities, the deployment-specific responsibility matrix takes precedence.

## Service BOM process
For each production deployment, maintain a current list of material suppliers/components with: supplier/component, purpose, data processed, privileged access, hosting/processing region where known, subprocessor dependency, assurance evidence, incident-notification route, exit/portability consideration, owner and review date.

## Current known material dependencies
- GitHub: source control and security automation.
- OpenAI API: optional AI model/provider path when configured.
- Runtime/hosting, logging and any production datastore providers: must be entered in the deployment-specific BOM before production attestation; provider evidence remains an open evidence gate until verified.

## Supplier review criteria
Security posture and assurance; privacy/DPA terms; incident notification; access control; vulnerability management; resilience/BCP; subprocessor transparency; data location/transfer; AI/model provenance and supply-chain risk; termination/data return/deletion; financial/operational concentration risk.

## Contractual minimums
Material supplier agreements should address confidentiality, data protection, security obligations, incident notification, access restrictions, business continuity, subprocessor obligations, data return/deletion and termination. Evidence of actual signed terms is retained separately.

## Review
New material suppliers require review before production use. Significant supplier/service changes trigger re-review. A formal annual review is required; annual completion evidence is retained separately.