# Contributing

Thank you for helping improve RaeburnAI Proposal Generator.

## Local setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

## Quality checks

Run these before opening a pull request:

```bash
npm run typecheck
npm run test
npm run build
```

## Pull request standards

- Keep changes typed and tested
- Add useful docs for new features
- Do not commit secrets or customer data
- Prefer clear, small pull requests
- Keep AI-generated content reviewable by humans

## Product principles

This project should feel useful for real consultants, not like a demo. Features should improve proposal quality, commercial clarity, implementation readiness or client trust.
