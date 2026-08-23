# Deployment

Cloudflare Workers/OpenNext is the primary target; Docker is the tested secondary target. The authoritative release, Access, WAF, secret, alert, rollback and acceptance procedure is `docs/production.md`.

Do not expose the custom hostname or a `workers.dev` bypass before Access is enforced. Set a unique `PROPOSAL_API_KEY` matching AI_Website, optionally set the approved OpenAI credential, verify `/api/health` and `/api/readiness`, then generate a non-confidential synthetic proposal through the authenticated API. All output remains a draft regardless of provider mode.
