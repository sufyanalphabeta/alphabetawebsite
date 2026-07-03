#!/usr/bin/env bash

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

COMPOSE="docker compose -f docker-compose.prod.yml --env-file .env.production"

cd "$ROOT_DIR"