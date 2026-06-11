# ── Stage 1: build ──────────────────────────────────────────────────────────
FROM node:24-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/web/package.json ./apps/web/

RUN pnpm install --frozen-lockfile --filter @alphabeta/web...

COPY apps/web ./apps/web/

WORKDIR /app/apps/web

ARG VITE_STRAPI_URL=http://localhost:1337
ARG VITE_CDN_URL=http://localhost:1337
ARG VITE_PUBLIC_URL=http://localhost:3000
ENV VITE_STRAPI_URL=$VITE_STRAPI_URL
ENV VITE_CDN_URL=$VITE_CDN_URL
ENV VITE_PUBLIC_URL=$VITE_PUBLIC_URL

RUN pnpm build

# ── Stage 2: runtime (nginx) ─────────────────────────────────────────────────
FROM nginx:alpine AS runtime

COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
