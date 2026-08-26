# AI Application Security Standard

**Owner:** Engineering / Security
**Effective:** 26 August 2026
**Review:** annually and after material change

## Input security
- Validate all structured request data against explicit schemas and size/range constraints.
- Treat user, uploaded and retrieved content as untrusted data.
- Delimit untrusted content from system/developer instructions and never permit user content to redefine privileged policy.
- Reject or neutralise inputs attempting credential extraction, unauthorized tool use, privilege escalation or instructions outside the approved task boundary.

## Output security
- Treat model output as untrusted until validated.
- Validate structured output against schemas before use.
- Do not execute generated commands/code automatically in production.
- Require human review for material commercial, legal, security or customer-impacting outputs.
- Prevent secrets, internal prompts and unnecessary personal data from being deliberately returned.

## Agent and tool boundaries
- Tools are deny-by-default and explicitly allowlisted.
- Each tool receives only the permissions and data needed for the current task.
- Tool execution has bounded time, request size and scope.
- Destructive, financial, identity, production-change or customer-environment actions require explicit authorization and an auditable event.

## Sandboxing
Arbitrary customer-provided executable code is not run in the application process. Any future code/tool execution must use an isolated runtime/container with no implicit production credentials, restricted network/filesystem access and enforced resource/time limits.

## Cache protection
- Do not cache credentials, API keys, authorization headers or privileged prompts.
- Customer-sensitive responses use no-store or tenant-scoped caches with bounded TTL where caching is required.
- Cache keys must include the security/tenant context needed to prevent cross-context data exposure.

## Prompt differentiation
System/developer instructions are constructed separately from user content. User content is labelled/delimited as data and is not concatenated into privileged policy text without encoding and contextual separation.

## Verification
Security tests cover schema validation, unauthorized API access, prompt-injection boundaries, unsafe output handling and tool authorization where the relevant feature exists.