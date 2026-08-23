# Proposal Contract 1.0

`POST /api/proposals` accepts Contract 1.0 from AI_Website and returns a strictly validated proposal draft. The canonical executable definitions are `src/lib/types/proposal.ts` and `src/lib/proposals/schema.ts`; breaking changes require a new version and compatibility tests in both repositories.

Inputs cover company and sector context, decision maker, workflows, pain points, software stack, volumes and cost assumptions, opportunities, risks, outcomes, voluntary budget, constraints, discovery notes and optional deterministic ROI inputs. Optional facts may be omitted; they are never replaced with invented customer facts.

Pricing and ROI arithmetic is reconciled in deterministic code after provider generation. Zero or missing ROI values produce a clearly non-calculable estimate. Output includes executive and business context, current state, prioritised opportunities, solution, implementation phases and roadmap, dependencies, timeline, risks and mitigations, governance, responsible AI, deterministic financials, next steps and a presentation outline.

Requests require the server-side bearer key, are size/rate limited, carry a correlation ID and receive safe errors. Every output status is `DRAFT_REQUIRES_HUMAN_REVIEW`; AI_Website owns proposal history, versioning and approval.
