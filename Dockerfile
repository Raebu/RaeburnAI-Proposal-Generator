FROM node:20.15.1-alpine3.20 AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false
RUN addgroup -S -g 10001 proposal && adduser -S -u 10001 -G proposal proposal

FROM base AS deps
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS migration
ENV NODE_ENV=production
COPY --chown=proposal:proposal --from=builder /app/node_modules ./node_modules
COPY --chown=proposal:proposal package*.json ./
COPY --chown=proposal:proposal scripts ./scripts
COPY --chown=proposal:proposal migrations ./migrations
USER proposal
CMD ["npm", "run", "db:migrate"]

FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
COPY --from=builder /app/public ./public
COPY --from=builder --chown=proposal:proposal /app/.next/standalone ./
COPY --from=builder --chown=proposal:proposal /app/.next/static ./.next/static
USER proposal
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"]
CMD ["node", "server.js"]
