# ── Stage 1: build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace manifest files first (layer-cache friendly)
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY apps/cms/package.json ./apps/cms/

# BuildKit cache mount keeps the pnpm store between builds so packages
# are not re-downloaded on every rebuild (safe with --frozen-lockfile).
RUN --mount=type=cache,id=pnpm-store,target=/tmp/pnpm-store \
    pnpm install --frozen-lockfile --trust-lockfile \
      --store-dir=/tmp/pnpm-store \
      --filter @alphabeta/cms...

# Copy source and build
COPY apps/cms ./apps/cms/

WORKDIR /app/apps/cms
RUN pnpm build

# ── Stage 2: runtime ─────────────────────────────────────────────────────────
FROM node:22-alpine AS runtime

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY apps/cms/package.json ./apps/cms/

RUN --mount=type=cache,id=pnpm-store,target=/tmp/pnpm-store \
    pnpm install --frozen-lockfile --trust-lockfile \
      --store-dir=/tmp/pnpm-store \
      --filter @alphabeta/cms... --prod

COPY --from=builder /app/apps/cms/dist   ./apps/cms/dist
COPY --from=builder /app/apps/cms/public ./apps/cms/public

WORKDIR /app/apps/cms

# Without tsconfig.json, strapi start treats this as a non-TS project and sets
# distDir=appDir (process.cwd). It then looks for config in ./config, not ./dist/config.
# Symlinking dist/config → config makes the compiled configs visible at the expected path.
RUN ln -s dist/config config

ENV HOST=0.0.0.0
ENV PORT=1337
ENV NODE_ENV=production

EXPOSE 1337

CMD ["pnpm", "start"]
