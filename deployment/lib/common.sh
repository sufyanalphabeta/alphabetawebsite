#!/usr/bin/env bash

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

COMPOSE="docker compose -f docker-compose.prod.yml --env-file .env.production"

cd "$ROOT_DIR"

# ── require_env_file ──────────────────────────────────────────────────
require_env_file() {
  [[ -f ".env.production" ]] || {
    error ".env.production not found — run from project root"
    exit 1
  }
}

# ── require_docker ────────────────────────────────────────────────────
require_docker() {
  command -v docker &>/dev/null || { error "docker not installed"; exit 1; }
  docker info &>/dev/null       || { error "Docker daemon not running"; exit 1; }
}

# ── running_containers ────────────────────────────────────────────────
running_containers() {
  docker ps --format "{{.Names}}" | grep -c alphabetawebsite || echo 0
}

# ── db_size_mb ────────────────────────────────────────────────────────
db_size_mb() {
  $COMPOSE exec -T db psql -U strapi -c \
    "SELECT pg_size_pretty(pg_database_size(current_database()));" 2>/dev/null \
    | grep -Eo '[0-9.]+ [kMGT]B' | head -1 || echo "n/a"
}