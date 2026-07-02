# Security Policy

## Supported versions

The `main` branch is the active development branch.

## Reporting a vulnerability

Please do not open a public issue for sensitive vulnerabilities. Report privately to the maintainers with:

- A clear description of the issue
- Reproduction steps
- Potential impact
- Suggested fix, if known

## Security principles

- No secrets in the repository
- All user input validated with Zod
- API keys kept server-side only
- AI output treated as draft content requiring human review
- Commercial assumptions surfaced explicitly
- Production deployments should use HTTPS, secret rotation and observability
