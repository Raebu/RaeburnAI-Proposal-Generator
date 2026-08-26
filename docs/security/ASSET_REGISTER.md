# Security Asset Register

Owner: Security / Engineering
Review: at least annually and after significant change.

| Asset / service | Type | Owner | Environment | Classification | Criticality | Data / function | Location / provider | Lifecycle |
|---|---|---|---|---|---|---|---|---|
| RaeburnAI Proposal Generator source | Logical / source | Engineering | Production | Internal | High | Application source and security configuration | GitHub | Active |
| Proposal Generator application | Logical / application | Engineering | Production | Confidential | High | Customer proposal inputs and generated outputs in request context | Approved managed hosting | Active |
| AI model API integration | Supplier / API | Engineering | Production | Confidential | High | Approved prompt context and generated response | Approved AI provider | Active |
| Deployment secrets | Logical / secrets | Security / Engineering | Production | Restricted | Critical | API credentials and service configuration | Approved secret manager / deployment platform | Active |
| Build and security automation | Logical / CI | Engineering | Production support | Internal | High | CI, dependency, CodeQL, Scorecard and SBOM controls | GitHub Actions | Active |
| Security evidence and policies | Information asset | Security | Corporate | Internal/Public by document | High | Assurance records and policies | Approved repository / Google Drive | Active |

Physical datacentre assets are supplier-owned and tracked through the approved-provider assurance process rather than duplicated as Raeburn-owned equipment. Company-managed endpoints that administer production are recorded in the corporate endpoint/asset inventory and must satisfy the Physical and Environmental Security Standard.

Changes to ownership, classification, provider, lifecycle or criticality must update this register or the corresponding secured corporate asset system as part of the change process.
