# Production Notes

This application runs as a Next.js service on Node.js 20.

## Release checks

Run:

```bash
npm install
npm run lint
npm run typecheck
npm run test
npm run build
docker build -t raeburnai-proposal-generator .
```

## Runtime

Use the variables listed in `.env.example`.

## Health

Use `GET /api/health` for uptime checks.

## Docker

```bash
docker compose up --build
```

## TODO before high-risk enterprise use

- Replace in-memory rate limiting with Redis or managed edge limits.
- Add persistent storage before proposal history.
- Add workspace authentication and RBAC before multi-user usage.
