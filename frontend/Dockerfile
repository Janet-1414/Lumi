# ── Stage 1: Dependencies ─────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --frozen-lockfile

# ── Stage 2: Builder ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── Stage 3: Runtime ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system lumi && adduser --system --ingroup lumi lumi

# Copy only what Next.js standalone needs
COPY --from=builder --chown=lumi:lumi /app/.next/standalone ./
COPY --from=builder --chown=lumi:lumi /app/.next/static ./.next/static
COPY --from=builder --chown=lumi:lumi /app/public ./public

USER lumi
EXPOSE 3000

CMD ["node", "server.js"]
