# Physical and Environmental Security Standard

Owner: Security / Operations
Review: at least annually and after material facility, hosting, supplier, or working-practice changes.

## Scope and shared responsibility
Production infrastructure is hosted on approved managed cloud/service-provider facilities. Physical datacentre controls (perimeters, guards/access systems, CCTV, environmental monitoring, utilities, cable protection, equipment placement and datacentre staff training) are inherited from those providers and must be supported by current supplier assurance evidence before reliance is recorded in the CSA evidence register.

Raeburn-controlled offices, endpoints, removable media and equipment remain subject to the controls below.

## Secure working environment
Only authorised personnel may access restricted work areas or unattended company equipment. Devices must use screen locking, full-disk encryption where supported, strong authentication and secure storage. Visitors must not be given unsupervised access to sensitive systems or records. Sensitive conversations and displays must be protected from casual observation.

## Asset classification and inventory
Physical and logical assets are classified by business/security impact and recorded in an asset register. At minimum the register records asset/service, owner, environment, classification, data handled, location/provider, criticality, lifecycle state and disposal/transfer status. The register is reviewed at least annually and after significant change.

## Offsite use, disposal and sanitisation
Equipment used outside organisational premises must remain under authorised custody and must use encryption and access control. Disposal/reuse requires approved sanitisation. Storage media containing protected information must be cryptographically erased, securely overwritten using an industry-accepted method, or physically destroyed such that practical forensic recovery is not possible. Disposal evidence is retained for material assets.

## Transfer and relocation
Movement of hardware, software, removable media or protected data to an alternate location requires written or cryptographically verifiable authorisation by an accountable owner. Transfers use secure transport and encryption appropriate to classification. Chain-of-custody evidence is retained where risk warrants it.

## Physical media
Use of removable physical media for customer or restricted data is prohibited by default. Where explicitly approved, media must be inventoried, encrypted, transported in secure custody and sanitised/destroyed after use.

## Provider physical controls
Approved infrastructure providers must maintain physical security perimeters, authorised-access controls and access logs, perimeter/ingress/egress surveillance, trained datacentre personnel, environmental controls, resilient utilities, cable protection, segregation from material environmental hazards, operational monitoring/metrics and continuity capabilities appropriate to the service. Supplier evidence is reviewed proportionately to risk and at least annually for critical providers.

## Connection authentication
Raeburn-managed endpoint/device identity must be incorporated into access decisions where the platform supports device posture, managed-device identity, certificates or hardware-backed credentials. This control is not claimed for a service unless evidence shows it is enabled for the relevant access path.
