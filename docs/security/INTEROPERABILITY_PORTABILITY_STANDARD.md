# Interoperability & Portability Standard

**Owner:** Engineering / Security
**Effective:** 26 August 2026
**Review:** annually and after material architecture or contractual change

## Principles
Customer information must not be intentionally trapped in proprietary formats when a reasonable open or commonly supported representation exists. Interfaces, exports and integrations must preserve confidentiality, integrity and authorization boundaries.

## Interfaces and export
Where the service stores customer-controlled data, documented interfaces or export mechanisms must allow authorised customers to retrieve applicable data in a structured format. Stateless request/response data that is immediately returned to the caller is considered inherently portable; no hidden application datastore is used for that content unless explicitly introduced and documented.

## Secure transport
Management, import and export of customer information must use cryptographically protected protocols such as HTTPS/TLS or an equivalent approved secure channel. Plaintext network transport of sensitive customer data is prohibited.

## Contract termination
Customer terms and delivery documentation must define how customers can obtain applicable retained data at termination, the supported retrieval window, deletion/retention obligations, and any legal exceptions.

## Compatibility
Material interface changes require change control, versioning/backward-compatibility assessment and customer communication where they would break an agreed integration.

## Evidence
Evidence includes API/interface documentation, export tests, TLS configuration, contract/DPA terms, change records and deletion/retention records.