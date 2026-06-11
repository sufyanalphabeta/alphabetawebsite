# ── Stage 1: build ──────────────────────────────────────────────────────────
FROM node:24-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace manifest files first (layer-cache friendly)
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/cms/package.json ./apps/cms/

RUN pnpm install --frozen-lockfile --filter @alphabeta/cms...

# Copy source and build
COPY apps/cms ./apps/cms/

WORKDIR /app/apps/cms
RUN pnpm build

# ── Stage 2: runtime ─────────────────────────────────────────────────────────
FROM node:24-alpine AS runtime

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/cms/package.json ./apps/cms/

RUN pnpm install --frozen-lockfile --filter @alphabeta/cms... --prod

COPY --from=builder /app/apps/cms/dist   ./apps/cms/dist
COPY --from=builder /app/apps/cms/public ./apps/cms/public

WORKDIR /app/apps/cms

ENV HOST=0.0.0.0
ENV PORT=1337
ENV NODE_ENV=production

EXPOSE 1337

CMD ["pnpm", "start"]
